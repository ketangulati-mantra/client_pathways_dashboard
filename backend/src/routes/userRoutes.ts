import { Router } from 'express';
import { userController } from '../controllers/userController.js';

const router = Router();

import { activityController } from '../controllers/activityController.js';

router.get('/non-reviewers', userController.getNonReviewers);
router.get('/available-reviewers', userController.getNonReviewers);
router.post('/', userController.upsertUser);

// Centralized Canonical Daily Check-in State & Mutations
router.get('/:userId/check-in-state', activityController.getCheckInState);
router.delete('/:userId/check-in/:id?', activityController.deleteCheckIn);

router.get('/:userId', userController.getUser);

export default router;
