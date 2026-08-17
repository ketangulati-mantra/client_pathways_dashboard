import { Router } from 'express';
import { upload, handleMulterError } from '../middleware/uploadMiddleware.js';
import { uploadController } from '../controllers/uploadController.js';

const router = Router();

// Reusable file upload endpoint: POST /api/uploads
router.post('/uploads', upload.single('file'), handleMulterError, uploadController.uploadFile);

export default router;
