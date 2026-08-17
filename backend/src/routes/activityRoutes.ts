import { Router } from 'express';
import { activityController } from '../controllers/activityController.js';

const router = Router();

router.post('/complete', activityController.completeActivity);
router.get('/completions/:userId', activityController.getUserCompletions);
router.post('/progress', activityController.saveProgress);
router.get('/progress/:userId/:lessonId', activityController.getProgress);

export default router;
