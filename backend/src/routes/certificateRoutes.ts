import { Router } from 'express';
import { certificateController } from '../controllers/certificateController.js';

const router = Router();

// POST /api/certificates/check-eligibility - Check eligibility & generate certificate automatically
router.post('/certificates/check-eligibility', certificateController.checkEligibility);

// POST /api/certificates/generate - Generate & log certificate metadata
router.post('/certificates/generate', certificateController.generateCertificate);

// GET /api/certificates/user/:userId - Get all certificates for a user
router.get('/certificates/user/:userId', certificateController.getCertificatesByUser);

// GET /api/certificates/:certificateId/download - Download certificate API
router.get('/certificates/:certificateId/download', certificateController.downloadCertificate);

// GET /api/certificates/:certificateId - Get single certificate by ID
router.get('/certificates/:certificateId', certificateController.getCertificateById);

export default router;
