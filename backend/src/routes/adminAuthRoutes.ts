import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, getMe, getStatus } from '../controllers/adminAuthController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';

const router = Router();

// Rate limiter for admin login endpoint: max 10 requests per 15 minutes
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public authentication routes
router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);
router.get('/status', getStatus);

// Protected authentication route
router.get('/me', getMe);

export default router;
