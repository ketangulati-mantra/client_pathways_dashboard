import { Router } from 'express';
import { challengeController } from '../controllers/challengeController.js';

const router = Router();

// 1. Challenge Catalogue & Discovery
router.get('/', challengeController.getChallenges);
router.get('/catalogue', challengeController.getChallenges);
router.get('/details/:idOrSlug', challengeController.getChallengeDetails);

// 2. Aggregated Authoritative Dashboard (State 1 Catalogue vs State 2 Active)
router.get('/current', challengeController.getCurrentDashboard);

// 3. Idempotent Challenge Enrollment (Enforcing ONE active challenge rule)
router.post('/enroll', challengeController.enroll);

// 4. Fetch Challenge Enrollment
router.get('/enrollment/:userId', challengeController.getEnrollment);
router.get('/enrollment/:userId/:challengeId', challengeController.getEnrollment);

// 5. Daily Leaderboard Snapshot trigger (Cron / Admin)
router.post('/leaderboard/snapshot', challengeController.triggerLeaderboardSnapshot);

export default router;
