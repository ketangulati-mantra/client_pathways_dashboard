import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import { reviewerController } from '../controllers/reviewerController.js';

const router = Router();

// Protect all reviewer management routes with authenticateAdmin middleware
router.use(authenticateAdmin);

// GET /api/admin/reviewers/available-users
router.get('/available-users', reviewerController.getAvailableUsers);

// GET /api/admin/reviewers
router.get('/', reviewerController.getActiveReviewers);

// POST /api/admin/reviewers
router.post('/', reviewerController.addReviewer);

// DELETE /api/admin/reviewers/:userId
router.delete('/:userId', reviewerController.removeReviewer);

// PATCH /api/admin/users/:userId/reviewer
router.patch('/users/:userId/reviewer', reviewerController.setReviewerStatus);

export default router;
