import { sql } from '../db/client.js';

export interface CreateSubmissionInput {
  userId: string;
  service?: string;
  lessonId: string;
  activityTitle: string;
  submissionType: string;
  formData?: Record<string, any> | any;
  submissionData?: Record<string, any> | any;
}

export interface GetSubmissionsQuery {
  page?: number;
  limit?: number;
  status?: string;
  reviewedBy?: string;
  lessonId?: string;
  submissionType?: string;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface ReviewSubmissionInput {
  status?: string;
  reviewedBy?: string;
  reviewerUserId?: string;
  reviewerName?: string;
  reviewNotes?: string;
  forceReassign?: boolean;
}

// Ensure schema has reviewed_by_user_id and reviewed_at columns
let isSchemaEnsured = false;
async function ensureSubmissionsSchema() {
  if (isSchemaEnsured) return;
  try {
    await sql`
      ALTER TABLE activity_submissions 
      ADD COLUMN IF NOT EXISTS reviewed_by_user_id VARCHAR(255);
    `;
    await sql`
      ALTER TABLE activity_submissions 
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
    `;
    isSchemaEnsured = true;
  } catch (err) {
    console.error('[submissionService] Schema migration check warning:', err);
  }
}

function isVideoSkippedSubmission(s: any): boolean {
  if (!s) return false;
  
  const fd = s.form_data || s.submission_data || s.formData || s.submissionData || {};
  const lessonId = String(s.lesson_id || s.lessonId || '').toLowerCase();
  const title = String(s.activity_title || s.activityTitle || '').toLowerCase();
  const subType = String(s.submission_type || s.submissionType || '').toLowerCase();
  
  const isExplicitSkipped = (
    s.skipped_video === true ||
    s.video_skipped === true ||
    s.video_skipped === 'true' ||
    s.skipped === true ||
    subType === 'skipped_video' ||
    subType === 'no_video' ||
    subType === 'skipped' ||
    fd.skippedVideo === true ||
    fd.videoSkipped === true ||
    fd.video_skipped === true ||
    fd.skipped_video === true ||
    fd.skipped === true ||
    fd.videoStatus === 'skipped' ||
    fd.video_status === 'skipped' ||
    s.video_url === 'skipped' ||
    fd.video_url === 'skipped' ||
    fd.videoUrl === 'skipped'
  );

  if (isExplicitSkipped) return true;

  const isVideoActivity = (
    lessonId.includes('mantra-intro-video') ||
    lessonId.includes('intro-video') ||
    lessonId.includes('market-yourself') ||
    lessonId.includes('grow-your-practice') ||
    title.includes('mantra intro video') ||
    title.includes('intro video') ||
    subType.includes('video')
  );

  if (isVideoActivity) {
    const rawVUrl = s.videoUrl || s.video_url || s.video || s.proof_url || s.proofUrl || fd.videoUrl || fd.video_url || fd.videoLink || fd.video || fd.url || fd.file || '';
    let cleanVUrl = String(rawVUrl).trim().replace(/^['"]|['"]$/g, '');
    if (!cleanVUrl || ['null', 'undefined', 'none', 'n/a', 'skipped'].includes(cleanVUrl.toLowerCase())) {
      return true;
    }
  }

  return false;
}

// Helper to enrich raw submission rows with reviewer user object
async function enrichSubmissions(rawSubmissions: any[]) {
  if (!rawSubmissions || rawSubmissions.length === 0) return [];
  
  // Collect all non-null reviewed_by_user_id values
  const reviewerUserIds = Array.from(
    new Set(rawSubmissions.map((s) => s.reviewed_by_user_id).filter(Boolean))
  );

  let reviewerMap = new Map<string, { user_id: string; name: string; email: string }>();

  if (reviewerUserIds.length > 0) {
    try {
      const reviewerUsers = await sql`
        SELECT user_id, name, email
        FROM users
        WHERE user_id::text IN ${sql(reviewerUserIds.map(String))};
      `;
      (reviewerUsers || []).forEach((u: any) => {
        reviewerMap.set(String(u.user_id), {
          user_id: String(u.user_id),
          name: u.name || u.email || String(u.user_id),
          email: u.email || ''
        });
      });
    } catch (err) {
      console.error('[submissionService] Error querying reviewer users:', err);
    }
  }

  return rawSubmissions.map((s: any) => {
    const reviewerUserId = s.reviewed_by_user_id ? String(s.reviewed_by_user_id) : null;
    let reviewerObj = null;

    if (reviewerUserId && reviewerMap.has(reviewerUserId)) {
      reviewerObj = reviewerMap.get(reviewerUserId);
    } else if (s.reviewed_by && s.reviewed_by !== 'Unassigned') {
      reviewerObj = {
        user_id: reviewerUserId || '',
        name: s.reviewed_by,
        email: ''
      };
    }

    const reviewerDisplayName = reviewerObj?.name || s.reviewed_by || 'Unassigned';

    return {
      ...s,
      reviewed_by_user_id: reviewerUserId,
      reviewed_at: s.reviewed_at || null,
      reviewed_by: reviewerDisplayName,
      reviewer_details: reviewerObj,
      reviewer_name: reviewerDisplayName,
      reviewer_email: reviewerObj?.email || ''
    };
  });
}

export const submissionService = {
  async createSubmission(input: CreateSubmissionInput) {
    await ensureSubmissionsSchema();

    const {
      userId,
      service,
      lessonId,
      activityTitle,
      submissionType,
      formData = {},
      submissionData = {},
    } = input;

    const jsonFormData = typeof formData === 'string' ? formData : JSON.stringify(formData);
    const jsonSubmissionData = typeof submissionData === 'string' ? submissionData : JSON.stringify(submissionData);

    const result = await sql`
      INSERT INTO activity_submissions (
        user_id,
        service,
        lesson_id,
        activity_title,
        submission_type,
        form_data,
        submission_data,
        status,
        reviewed_by,
        created_at,
        updated_at
      )
      VALUES (
        ${userId},
        ${service || null},
        ${lessonId},
        ${activityTitle},
        ${submissionType},
        ${jsonFormData}::jsonb,
        ${jsonSubmissionData}::jsonb,
        'pending',
        'Unassigned',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;

    const enriched = await enrichSubmissions(result);
    return enriched[0];
  },

  async getAnalytics(options: { range?: string; startDate?: string; endDate?: string }) {
    await ensureSubmissionsSchema();

    const now = new Date();
    let filterDate: Date | null = null;

    if (options.startDate) {
      filterDate = new Date(options.startDate);
    } else if (options.range) {
      switch (options.range.toLowerCase()) {
        case '7d':
        case '7days':
          filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
        case '30days':
          filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
        case '90days':
          filterDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          filterDate = null;
          break;
        default:
          filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    let allSubmissions = await sql`
      SELECT * FROM activity_submissions
      ORDER BY created_at DESC;
    `;

    if (filterDate) {
      const minTime = filterDate.getTime();
      allSubmissions = allSubmissions.filter((s: any) => new Date(s.created_at).getTime() >= minTime);
    }

    if (options.endDate) {
      const maxTime = new Date(options.endDate).getTime();
      allSubmissions = allSubmissions.filter((s: any) => new Date(s.created_at).getTime() <= maxTime);
    }

    const activityCountMap = new Map<string, { activityId: string; activityName: string; count: number }>();
    const videoSubmissionMap = new Map<string, { activityId: string; activityName: string; total: number; uploaded: number; skipped: number }>();
    const providerIds = new Set<string>();

    allSubmissions.forEach((s: any) => {
      if (s.user_id) providerIds.add(s.user_id);

      const actKey = s.lesson_id || s.activity_title || 'unknown-activity';
      const actTitle = s.activity_title || s.lesson_id || 'Unknown Activity';
      if (!activityCountMap.has(actKey)) {
        activityCountMap.set(actKey, { activityId: actKey, activityName: actTitle, count: 0 });
      }
      activityCountMap.get(actKey)!.count += 1;

      const subDataStr = JSON.stringify(s.submission_data || {}).toLowerCase();
      const formDataStr = JSON.stringify(s.form_data || {}).toLowerCase();
      const subType = (s.submission_type || '').toLowerCase();

      const hasVideo = subDataStr.includes('video') || formDataStr.includes('video') || subDataStr.includes('cloudinary');
      const isSkipped = subDataStr.includes('skipped') || formDataStr.includes('skipped');

      if (hasVideo || isSkipped || subType.includes('video') || (s.lesson_id || '').includes('market-yourself') || (s.lesson_id || '').includes('growth')) {
        const lessonId = s.lesson_id || 'video-activity';
        const name = s.activity_title || lessonId;
        const key = lessonId;

        if (!videoSubmissionMap.has(key)) {
          videoSubmissionMap.set(key, { activityId: lessonId, activityName: name, total: 0, uploaded: 0, skipped: 0 });
        }

        const item = videoSubmissionMap.get(key)!;
        item.total += 1;
        if (hasVideo) {
          item.uploaded += 1;
        } else if (isSkipped) {
          item.skipped += 1;
        }
      }
    });

    const activityCompletionsList = Array.from(activityCountMap.values()).sort((a, b) => b.count - a.count);
    const videoSubmissionsList = Array.from(videoSubmissionMap.values()).sort((a, b) => b.total - a.total);

    const totalCompletions = activityCompletionsList.reduce((acc, curr) => acc + curr.count, 0);
    const totalVideoSubmissions = videoSubmissionsList.reduce((acc, curr) => acc + curr.total, 0);

    return {
      overview: {
        totalCompletions,
        uniqueProviders: providerIds.size,
        activitiesCompleted: activityCompletionsList.length,
        videoSubmissions: totalVideoSubmissions,
      },
      activityCompletions: activityCompletionsList,
      videoSubmissions: videoSubmissionsList,
    };
  },

  async getReviewers() {
    try {
      const userReviewers = await sql`
        SELECT DISTINCT name, email
        FROM users
        WHERE is_reviewer IS TRUE AND name IS NOT NULL AND name != ''
        ORDER BY name ASC;
      `;

      const submissionReviewers = await sql`
        SELECT DISTINCT reviewed_by
        FROM activity_submissions
        WHERE reviewed_by IS NOT NULL AND reviewed_by != '' AND reviewed_by != 'Unassigned';
      `;

      const set = new Set<string>();
      set.add('Unassigned');

      userReviewers.forEach((r: any) => {
        if (r.name && r.name.trim()) set.add(r.name.trim());
      });

      submissionReviewers.forEach((r: any) => {
        if (r.reviewed_by && r.reviewed_by.trim()) set.add(r.reviewed_by.trim());
      });

      return Array.from(set);
    } catch (err) {
      console.error('[submissionService] Error fetching reviewers from users table:', err);
      return ['Unassigned'];
    }
  },

  async addReviewer(identifier: string) {
    const trimmed = identifier ? identifier.trim() : '';
    if (!trimmed) throw new Error('Reviewer identifier cannot be empty');

    await sql`
      UPDATE users
      SET is_reviewer = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id::text = ${trimmed} OR LOWER(name) = ${trimmed.toLowerCase()} OR LOWER(email) = ${trimmed.toLowerCase()};
    `;

    return this.getReviewers();
  },

  async deleteReviewer(identifier: string) {
    const trimmed = identifier ? identifier.trim() : '';
    if (!trimmed || trimmed === 'Unassigned') {
      throw new Error('Cannot delete default Unassigned option');
    }

    await sql`
      UPDATE users
      SET is_reviewer = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id::text = ${trimmed} OR LOWER(name) = ${trimmed.toLowerCase()} OR LOWER(email) = ${trimmed.toLowerCase()};
    `;

    return this.getReviewers();
  },

  async getUniqueActivities() {
    try {
      const activities = await sql`
        SELECT DISTINCT lesson_id, activity_title
        FROM activity_submissions
        WHERE lesson_id IS NOT NULL AND lesson_id != ''
        ORDER BY activity_title ASC, lesson_id ASC;
      `;
      return activities.map((a: any) => ({
        id: a.lesson_id,
        title: a.activity_title || a.lesson_id
      }));
    } catch (err) {
      console.error('[submissionService] Error fetching unique activities:', err);
      return [];
    }
  },

  async getAllSubmissions(options: GetSubmissionsQuery = {}) {
    await ensureSubmissionsSchema();

    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 50;
    const offset = (page - 1) * limit;

    const status = options.status?.trim();
    const reviewedBy = options.reviewedBy?.trim();
    const lessonId = options.lessonId?.trim();
    const submissionType = options.submissionType?.trim();
    const search = options.search?.trim();

    let rawSubmissions = await sql`
      SELECT * FROM activity_submissions
      ORDER BY created_at DESC;
    `;

    let submissions = await enrichSubmissions(rawSubmissions);

    // Exclude skipped video submissions for Mantra intro video or related activities from dashboard list
    submissions = submissions.filter((s: any) => !isVideoSkippedSubmission(s));

    if (status) {
      submissions = submissions.filter((s: any) => (s.status || 'pending').toLowerCase() === status.toLowerCase());
    }

    if (reviewedBy) {
      if (reviewedBy === 'Unassigned') {
        submissions = submissions.filter((s: any) => !s.reviewed_by || s.reviewed_by === 'Unassigned');
      } else {
        submissions = submissions.filter((s: any) => 
          (s.reviewed_by || '').toLowerCase() === reviewedBy.toLowerCase() ||
          (s.reviewed_by_user_id || '').toLowerCase() === reviewedBy.toLowerCase()
        );
      }
    }

    if (lessonId) {
      submissions = submissions.filter((s: any) => s.lesson_id === lessonId);
    }

    if (submissionType) {
      submissions = submissions.filter((s: any) => s.submission_type === submissionType);
    }

    if (search) {
      const q = search.toLowerCase();
      submissions = submissions.filter((s: any) =>
        s.activity_title?.toLowerCase().includes(q) ||
        s.user_id?.toLowerCase().includes(q) ||
        s.lesson_id?.toLowerCase().includes(q) ||
        (s.reviewed_by || '').toLowerCase().includes(q) ||
        (s.reviewer_email || '').toLowerCase().includes(q) ||
        JSON.stringify(s.form_data || {}).toLowerCase().includes(q) ||
        JSON.stringify(s.submission_data || {}).toLowerCase().includes(q)
      );
    }

    const sortBy = options.sortBy || 'created_at';
    const isAsc = options.order?.toUpperCase() === 'ASC';

    submissions.sort((a: any, b: any) => {
      let valA = a[sortBy] ?? a.created_at;
      let valB = b[sortBy] ?? b.created_at;
      if (valA instanceof Date) valA = valA.getTime();
      if (valB instanceof Date) valB = valB.getTime();

      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });

    const totalRecords = submissions.length;
    const totalPages = Math.ceil(totalRecords / limit);

    // Compute consolidated status counts across ALL records in DB (All pages included)
    let pendingCount = 0;
    let underReviewCount = 0;
    let reviewedCount = 0;
    let mailSentCount = 0;

    submissions.forEach((s: any) => {
      const st = String(s.status || 'pending').toLowerCase().trim();
      if (st === 'pending' || st === '') {
        pendingCount++;
      } else if (st === 'under_review') {
        underReviewCount++;
      } else if (st === 'reviewed' || st === 'approved') {
        reviewedCount++;
      } else if (st === 'mail_sent') {
        mailSentCount++;
      }
    });

    const paginatedSubmissions = submissions.slice(offset, offset + limit);

    return {
      submissions: paginatedSubmissions,
      statusCounts: {
        pending: pendingCount,
        underReview: underReviewCount,
        reviewed: reviewedCount,
        mailSent: mailSentCount,
        total: totalRecords
      },
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  },

  async getSubmissionById(id: string) {
    await ensureSubmissionsSchema();

    const rows = await sql`
      SELECT * FROM activity_submissions 
      WHERE id::text = ${String(id).trim()};
    `;
    if (!rows || rows.length === 0) return null;
    const enriched = await enrichSubmissions(rows);
    return enriched[0];
  },

  async getSubmissionsByUser(userId: string) {
    await ensureSubmissionsSchema();

    const rows = await sql`
      SELECT * FROM activity_submissions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC;
    `;
    return await enrichSubmissions(rows);
  },

  async claimSubmission(id: string, reviewerUserId: string, reviewerName: string) {
    await ensureSubmissionsSchema();

    const cleanId = String(id).trim();
    const cleanUserId = String(reviewerUserId).trim();
    const cleanName = String(reviewerName || reviewerUserId).trim();

    // Concurrency protection: Only assign if reviewed_by_user_id IS NULL or 'Unassigned'
    const rows = await sql`
      UPDATE activity_submissions
      SET reviewed_by_user_id = ${cleanUserId},
          reviewed_by = ${cleanName},
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id::text = ${cleanId}
        AND (
          reviewed_by_user_id IS NULL OR 
          reviewed_by_user_id = '' OR
          reviewed_by IS NULL OR 
          reviewed_by = 'Unassigned' OR
          reviewed_by_user_id::text = ${cleanUserId}
        )
      RETURNING *;
    `;

    if (!rows || rows.length === 0) {
      // Check if already claimed by someone else
      const existing = await sql`SELECT * FROM activity_submissions WHERE id::text = ${cleanId};`;
      if (existing && existing.length > 0) {
        const currentAssigned = existing[0];
        const enrichedCurrent = await enrichSubmissions(existing);
        const name = enrichedCurrent[0]?.reviewed_by || 'another reviewer';
        throw new Error(`This submission has already been assigned to ${name}.`);
      }
      throw new Error(`Submission '${cleanId}' not found.`);
    }

    const enriched = await enrichSubmissions(rows);
    return enriched[0];
  },

  async reviewSubmission(id: string, input: ReviewSubmissionInput) {
    await ensureSubmissionsSchema();

    const { status, reviewerUserId, reviewerName, reviewNotes, forceReassign } = input;

    const cleanStatus = status ? String(status).toLowerCase().trim() : null;
    const cleanNotes = reviewNotes !== undefined ? String(reviewNotes).trim() : null;
    const stringId = String(id).trim();
    const targetUserId = reviewerUserId ? String(reviewerUserId).trim() : null;
    const targetName = reviewerName ? String(reviewerName).trim() : null;

    // Check existing submission first
    const existingRows = await sql`SELECT * FROM activity_submissions WHERE id::text = ${stringId};`;
    if (!existingRows || existingRows.length === 0) {
      return null;
    }
    const current = existingRows[0];
    const prevReviewerId = current.reviewed_by_user_id ? String(current.reviewed_by_user_id).trim() : null;
    const prevReviewerName = current.reviewed_by ? String(current.reviewed_by).trim() : null;

    let rows;

    if (cleanStatus === 'pending') {
      // Reverting to Pending resets reviewer assignment to Unassigned
      rows = await sql`
        UPDATE activity_submissions
        SET 
          status = 'pending',
          reviewed_by_user_id = NULL,
          reviewed_by = 'Unassigned',
          reviewed_at = NULL,
          review_notes = COALESCE(${cleanNotes}, review_notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id::text = ${stringId}
        RETURNING *;
      `;
    } else {
      // If already claimed by another reviewer and forceReassign is false, prevent overwrite
      if (
        !forceReassign &&
        targetUserId &&
        current.reviewed_by_user_id &&
        String(current.reviewed_by_user_id) !== targetUserId
      ) {
        // Keep existing assignment if already assigned
      }

      rows = await sql`
        UPDATE activity_submissions
        SET 
          status = COALESCE(${cleanStatus}, status),
          reviewed_by_user_id = COALESCE(reviewed_by_user_id, ${targetUserId}),
          reviewed_by = CASE 
            WHEN reviewed_by IS NULL OR reviewed_by = 'Unassigned' THEN COALESCE(${targetName}, 'Unassigned')
            ELSE reviewed_by 
          END,
          reviewed_at = COALESCE(reviewed_at, CURRENT_TIMESTAMP),
          review_notes = COALESCE(${cleanNotes}, review_notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id::text = ${stringId}
        RETURNING *;
      `;

      const finalRow = rows && rows[0];
      const activeUserId = finalRow?.reviewed_by_user_id || targetUserId;
      const activeName = finalRow?.reviewed_by || targetName;

      if (activeUserId || activeName) {
        await sql`
          UPDATE users
          SET is_reviewer = TRUE, updated_at = CURRENT_TIMESTAMP
          WHERE (user_id::text = ${activeUserId || ''} OR LOWER(name) = ${String(activeName || '').toLowerCase()} OR LOWER(email) = ${String(activeName || '').toLowerCase()});
        `.catch(() => null);
      }
    }

    // Sync is_reviewer = FALSE in users table if previous reviewer has 0 remaining active reviews
    if (prevReviewerName && prevReviewerName !== 'Unassigned') {
      const check = await sql`
        SELECT COUNT(*)::int as count 
        FROM activity_submissions 
        WHERE (reviewed_by_user_id::text = ${prevReviewerId || ''} OR LOWER(reviewed_by) = ${prevReviewerName.toLowerCase()})
          AND reviewed_by IS NOT NULL 
          AND reviewed_by != 'Unassigned'
          AND status != 'pending';
      `;
      const count = check[0]?.count || 0;
      if (count === 0) {
        await sql`
          UPDATE users
          SET is_reviewer = FALSE, updated_at = CURRENT_TIMESTAMP
          WHERE user_id::text = ${prevReviewerId || ''} 
             OR LOWER(name) = ${prevReviewerName.toLowerCase()} 
             OR LOWER(email) = ${prevReviewerName.toLowerCase()};
        `.catch(() => null);
      }
    }

    const enriched = await enrichSubmissions(rows);
    return enriched[0] || null;
  }
};
