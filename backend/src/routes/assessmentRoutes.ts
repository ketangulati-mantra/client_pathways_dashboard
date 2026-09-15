import { Router } from 'express';
import { assessmentController } from '../controllers/assessmentController.js';

const router = Router();

// Save and retrieve 21-Day Personalized Focus Assessment
router.post('/focus', assessmentController.saveFocusAssessment);
router.get('/focus/:userId', assessmentController.getLatestFocusAssessment);
router.get('/focus', assessmentController.getLatestFocusAssessment);

export default router;
