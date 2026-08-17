import { Request, Response, NextFunction } from 'express';
import { submissionService } from '../services/submissionService.js';

export const submissionController = {
  async createSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        userId,
        user_id,
        service,
        lessonId,
        lesson_id,
        activityTitle,
        activity_title,
        submissionType,
        submission_type,
        formData,
        submissionData,
        submission_data,
      } = req.body;

      const rawFormData = formData !== undefined 
        ? formData 
        : (submissionData !== undefined ? submissionData : submission_data);

      const parsedFormData = typeof rawFormData === 'object' && rawFormData !== null ? rawFormData : { data: rawFormData };

      // User ID resolution: explicit userId -> email -> fullName -> 'anonymous_user'
      const finalUserId = String(
        userId || 
        user_id || 
        parsedFormData.email || 
        parsedFormData.fullName || 
        'anonymous_user'
      ).trim();

      const finalLessonId = String(lessonId || lesson_id || '').trim();
      const finalActivityTitle = String(activityTitle || activity_title || '').trim();
      const finalSubmissionType = String(submissionType || submission_type || '').trim();
      const finalService = String(service || parsedFormData.service || '').trim() || undefined;

      const missingFields: string[] = [];
      if (!finalLessonId) missingFields.push('lessonId');
      if (!finalActivityTitle) missingFields.push('activityTitle');
      if (!finalSubmissionType) missingFields.push('submissionType');

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required field(s): ${missingFields.join(', ')}`,
        });
      }

      const submission = await submissionService.createSubmission({
        userId: finalUserId,
        service: finalService,
        lessonId: finalLessonId,
        activityTitle: finalActivityTitle,
        submissionType: finalSubmissionType,
        formData: parsedFormData,
        submissionData: parsedFormData,
      });

      return res.status(201).json({
        success: true,
        message: 'Activity submission stored successfully',
        data: submission,
      });
    } catch (error) {
      console.error('❌ Error creating activity submission:', error);
      next(error);
    }
  },

  async getAllSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page,
        limit,
        status,
        lessonId,
        submissionType,
        search,
        sortBy,
        order,
      } = req.query;

      const result = await submissionService.getAllSubmissions({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status ? String(status) : undefined,
        lessonId: lessonId ? String(lessonId) : undefined,
        submissionType: submissionType ? String(submissionType) : undefined,
        search: search ? String(search) : undefined,
        sortBy: sortBy ? String(sortBy) : undefined,
        order: order && String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      });

      return res.status(200).json({
        success: true,
        data: result.submissions,
        statusCounts: result.statusCounts,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('❌ Error getting all submissions:', error);
      next(error);
    }
  },

  async exportSubmissionsCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await submissionService.getAllSubmissions({ limit: 1000 });
      const submissions = result.submissions || [];

      const headers = ['Submission ID', 'User ID', 'Service', 'Lesson ID', 'Activity Title', 'Submission Type', 'Form Data', 'Proof URL', 'Submitted At'];
      const rows = [headers.join(',')];

      for (const s of submissions) {
        const data = s.form_data || s.submission_data || {};
        const proofUrl = data.screenshotUrl || data.imageUrl || data.fileUrl || '';
        const formDataStr = Object.entries(data)
          .filter(([k]) => !['screenshotUrl', 'imageUrl', 'fileUrl'].includes(k))
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ');

        const row = [
          `"${s.id || ''}"`,
          `"${s.user_id || ''}"`,
          `"${s.service || ''}"`,
          `"${s.lesson_id || ''}"`,
          `"${(s.activity_title || '').replace(/"/g, '""')}"`,
          `"${s.submission_type || ''}"`,
          `"${formDataStr.replace(/"/g, '""')}"`,
          `"${proofUrl}"`,
          `"${s.created_at || ''}"`
        ];
        rows.push(row.join(','));
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=activity_submissions_${Date.now()}.csv`);
      return res.status(200).send(rows.join('\n'));
    } catch (error) {
      console.error('❌ Error exporting submissions CSV:', error);
      next(error);
    }
  },

  async getSubmissionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Submission id parameter is required',
        });
      }

      const submission = await submissionService.getSubmissionById(id);
      if (!submission) {
        return res.status(404).json({
          success: false,
          error: `Submission with id '${id}' not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      console.error('❌ Error getting submission by id:', error);
      next(error);
    }
  },

  async getSubmissionsByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const targetUserId = userId || (req.params as any).providerUid;

      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          error: 'userId parameter is required',
        });
      }

      const submissions = await submissionService.getSubmissionsByUser(targetUserId);
      return res.status(200).json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      console.error('❌ Error fetching activity submissions for user:', error);
      next(error);
    }
  },

  async reviewSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, reviewNotes, review_notes } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Submission id parameter is required',
        });
      }

      // Extract authenticated user payload from JWT session
      const authUser = (req as any).admin || (req as any).user;
      const reviewerUserId = authUser ? String(authUser.id || authUser.user_id || '') : undefined;
      const reviewerName = authUser ? String(authUser.name || authUser.email || '') : undefined;

      const finalNotes = reviewNotes !== undefined ? reviewNotes : review_notes;

      const updatedSubmission = await submissionService.reviewSubmission(id, {
        ...(status ? { status } : {}),
        ...(reviewerUserId ? { reviewerUserId } : {}),
        ...(reviewerName ? { reviewerName } : {}),
        ...(finalNotes !== undefined ? { reviewNotes: finalNotes } : {})
      });

      if (!updatedSubmission) {
        return res.status(404).json({
          success: false,
          error: `Submission with id '${id}' not found`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `Submission status successfully updated to '${updatedSubmission.status}'`,
        data: updatedSubmission,
      });
    } catch (error: any) {
      console.error('❌ Error reviewing submission:', error);
      return res.status(400).json({
        success: false,
        error: error?.message || 'Error while reviewing submission',
      });
    }
  },

  async claimSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Submission id parameter is required',
        });
      }

      const authUser = (req as any).admin || (req as any).user;
      if (!authUser) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required to claim submission.',
        });
      }

      const reviewerUserId = String(authUser.id || authUser.user_id || '');
      const reviewerName = String(authUser.name || authUser.email || reviewerUserId);

      const claimedSubmission = await submissionService.claimSubmission(id, reviewerUserId, reviewerName);

      return res.status(200).json({
        success: true,
        message: `Submission claimed successfully by ${reviewerName}`,
        data: claimedSubmission,
      });
    } catch (error: any) {
      console.error('❌ Error claiming submission:', error);
      return res.status(400).json({
        success: false,
        error: error?.message || 'Error claiming submission',
      });
    }
  },

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { range, startDate, endDate } = req.query;

      const analytics = await submissionService.getAnalytics({
        range: range ? String(range) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error('❌ Error fetching submission analytics:', error);
      next(error);
    }
  },

  async getReviewers(req: Request, res: Response, next: NextFunction) {
    try {
      const { sql } = await import('../db/client.js');
      const reviewers = await submissionService.getReviewers();
      const userReviewers = await sql`
        SELECT user_id, name, email, role, is_reviewer, is_active
        FROM users
        WHERE is_reviewer IS TRUE
        ORDER BY name ASC;
      `;
      return res.status(200).json({
        success: true,
        data: reviewers,
        reviewers: (userReviewers as any[]).map((u: any) => ({
          user_id: String(u.user_id),
          name: u.name || u.email || String(u.user_id),
          email: u.email || '',
          role: u.role || 'user',
          is_reviewer: true,
          is_active: Boolean(u.is_active)
        }))
      });
    } catch (error) {
      console.error('❌ Error fetching reviewers:', error);
      next(error);
    }
  },

  async addReviewer(req: Request, res: Response, next: NextFunction) {
    try {
      const targetIdentifier = req.body.userId || req.body.user_id || req.body.name || req.body.email;
      if (!targetIdentifier || !String(targetIdentifier).trim()) {
        return res.status(400).json({ success: false, error: 'Reviewer identifier is required' });
      }
      const reviewers = await submissionService.addReviewer(String(targetIdentifier).trim());
      return res.status(201).json({
        success: true,
        message: `Reviewer added successfully`,
        data: reviewers,
        reviewers,
      });
    } catch (error: any) {
      console.error('❌ Error adding reviewer:', error);
      return res.status(500).json({ success: false, error: error?.message || 'Failed to add reviewer' });
    }
  },

  async deleteReviewer(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.params;
      const targetName = name || req.body?.name;
      if (!targetName) {
        return res.status(400).json({ success: false, error: 'Reviewer name parameter is required' });
      }
      const reviewers = await submissionService.deleteReviewer(String(targetName));
      return res.status(200).json({
        success: true,
        message: `Reviewer '${targetName}' deleted successfully`,
        data: reviewers,
      });
    } catch (error: any) {
      console.error('❌ Error deleting reviewer:', error);
      return res.status(500).json({ success: false, error: error?.message || 'Failed to delete reviewer' });
    }
  },

  async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const activities = await submissionService.getUniqueActivities();
      return res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      console.error('❌ Error fetching submission activities:', error);
      next(error);
    }
  },

  async getAvailableUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { sql } = await import('../db/client.js');

      const users = await sql`
        SELECT user_id, name, email, role, is_reviewer
        FROM users
        WHERE is_reviewer IS NOT TRUE OR is_reviewer = FALSE
        ORDER BY name ASC, user_id ASC;
      `;

      return res.status(200).json({
        success: true,
        users: (users as any[]).map((u: any) => ({
          id: String(u.user_id),
          user_id: String(u.user_id),
          name: u.name || u.email || 'Unnamed User',
          email: u.email || '',
          role: u.role || 'User',
          is_reviewer: Boolean(u.is_reviewer)
        }))
      });
    } catch (error) {
      console.error('❌ Error fetching available users for reviewers:', error);
      next(error);
    }
  },
};
