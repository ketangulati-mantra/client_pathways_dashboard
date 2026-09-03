import { Router } from 'express';
import { storyController } from '../controllers/storyController.js';

const router = Router();

// Story state and initialization
router.get('/state', storyController.getStoryState);
router.get('/state/:userId', storyController.getStoryState);

// Chapter retrieval
router.get('/chapters', storyController.getStoryChapters);
router.get('/chapters/latest', storyController.getLatestChapter);

// Controlled generation endpoint (Intentional pull action only)
router.post('/generate', storyController.generateChapter);

export default router;
