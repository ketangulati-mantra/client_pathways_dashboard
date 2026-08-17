import { Router } from 'express';
import { submissionController } from '../controllers/submissionController.js';
import { authenticateAdmin, optionalAuthenticateAdmin } from '../middleware/authenticateAdmin.js';

const router = Router();

// GET /api/activity-submissions/analytics & GET /api/admin/submissions/analytics - Aggregated analytics
router.get('/activity-submissions/analytics', submissionController.getAnalytics);
router.get('/admin/submissions/analytics', submissionController.getAnalytics);

// GET /api/activity-submissions/activities - Distinct submitted activities across all pages
router.get('/activity-submissions/activities', submissionController.getActivities);
router.get('/admin/submissions/activities', submissionController.getActivities);

// GET, POST, DELETE /api/admin/reviewers - Reviewers CRUD
router.get('/admin/reviewers', submissionController.getReviewers);
router.get('/admin/available-users', submissionController.getAvailableUsers);
router.post('/admin/reviewers', optionalAuthenticateAdmin, submissionController.addReviewer);
router.delete('/admin/reviewers/:name', optionalAuthenticateAdmin, submissionController.deleteReviewer);

// GET /api/activity-submissions/export/csv - Download all submissions in CSV format (Excel & Google Sheets compatible)
router.get('/activity-submissions/export/csv', submissionController.exportSubmissionsCSV);

// POST /api/activity-submissions - Create new activity submission
router.post('/activity-submissions', submissionController.createSubmission);

// GET /api/activity-submissions - List submissions with pagination, filtering, searching & sorting
router.get('/activity-submissions', submissionController.getAllSubmissions);

// GET /api/activity-submissions/user/:userId - Get submissions for specific user
router.get('/activity-submissions/user/:userId', submissionController.getSubmissionsByUser);

// GET /api/activity-submissions/:id - Get single submission by ID
router.get('/activity-submissions/:id', submissionController.getSubmissionById);

// POST /api/activity-submissions/:id/claim - Claim submission for current logged in reviewer
router.post('/activity-submissions/:id/claim', optionalAuthenticateAdmin, submissionController.claimSubmission);

// PATCH & PUT /api/activity-submissions/:id/review - Review submission (approve, reject, add notes)
router.patch('/activity-submissions/:id/review', optionalAuthenticateAdmin, submissionController.reviewSubmission);
router.put('/activity-submissions/:id/review', optionalAuthenticateAdmin, submissionController.reviewSubmission);
router.patch('/activity-submissions/:id/status', optionalAuthenticateAdmin, submissionController.reviewSubmission);

export default router;
