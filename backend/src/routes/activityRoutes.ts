import { Router } from 'express';
import { activityController } from '../controllers/activityController.js';

const router = Router();

// Log generic activity / daily check-in with activityId and calculate streaks
router.post('/log', activityController.logActivity);
router.post('/check-in', activityController.logActivity);

// Fetch user streak summary & milestone progress
router.get('/streak', activityController.getUserStreak);
router.get('/streak/:userId', activityController.getUserStreak);

// Fetch user activities & history by userId and optional activityId
router.get('/history/:userId', activityController.getUserActivities);
router.get('/history/:userId/:activityId', activityController.getUserActivities);
// Centralized Canonical Check-in State & Mutations
router.get('/check-in-state/:userId', activityController.getCheckInState);
router.delete('/check-in/:userId/:id?', activityController.deleteCheckIn);
router.get('/latest-check-in/:userId', activityController.getLatestCheckIn);

// Completions & progress
router.post('/complete', activityController.completeActivity);
router.get('/completions/:userId', activityController.getUserCompletions);
router.post('/progress', activityController.saveProgress);
router.get('/progress/:userId/:lessonId', activityController.getProgress);

export default router;
