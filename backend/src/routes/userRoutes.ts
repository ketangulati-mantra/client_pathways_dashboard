import { Router } from 'express';
import { userController } from '../controllers/userController.js';

const router = Router();

router.get('/non-reviewers', userController.getNonReviewers);
router.get('/available-reviewers', userController.getNonReviewers);
router.post('/', userController.upsertUser);
router.get('/:userId', userController.getUser);

export default router;
