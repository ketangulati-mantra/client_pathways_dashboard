import { Router } from 'express';
import { ocdMoodController } from '../controllers/ocdMoodController.js';

const router = Router();

// CRUD endpoints for OCD Mood Logs
router.post('/logs', ocdMoodController.createLog);
router.get('/logs', ocdMoodController.getUserLogs);
router.get('/logs/:id', ocdMoodController.getLogById);
router.put('/logs/:id', ocdMoodController.updateLog);
router.delete('/logs/:id', ocdMoodController.deleteLog);

// Analytics / Trends aggregation
router.get('/trends', ocdMoodController.getTrends);

export default router;
