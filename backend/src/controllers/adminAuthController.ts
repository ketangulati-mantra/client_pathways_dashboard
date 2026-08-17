import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthRequest, AdminJwtPayload } from '../types/auth.js';
import { findAdminByEmail, findAdminById, verifyPassword, updateAdminLastLogin } from '../services/adminAuthService.js';

const COOKIE_NAME = 'admin_token';

// Helper to set HttpOnly Cookie securely
function setAuthCookie(res: Response, token: string) {
  const isProduction = config.nodeEnv === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
}

// POST /api/admin/auth/login
export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const admin = await findAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been disabled. Please contact the system administrator.'
      });
    }

    const isValid = await verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    // Update last login timestamp in DB
    await updateAdminLastLogin(admin.id);

    const payload: AdminJwtPayload = {
      id: String(admin.user_id || admin.id) as any,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active,
      allowed_pages: admin.allowed_pages || ['submissions', 'corporate_admin', 'campus_admin', 'lessons']
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
    setAuthCookie(res, token);

    return res.json({
      success: true,
      token,
      message: 'Signed in successfully.',
      admin: payload
    });
  } catch (err: any) {
    console.error('❌ Login Error:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during authentication.'
    });
  }
}

// POST /api/admin/auth/logout
export async function logout(req: AuthRequest, res: Response) {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      path: '/'
    });
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to logout.' });
  }
}

// GET /api/admin/auth/me
export async function getMe(req: AuthRequest, res: Response) {
  try {
    let token = req.cookies?.[COOKIE_NAME];
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        admin: null
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AdminJwtPayload;
    if (!decoded || !decoded.id) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        admin: null
      });
    }

    const admin = await findAdminById(decoded.id);
    if (!admin || !admin.is_active) {
      res.clearCookie(COOKIE_NAME);
      return res.status(200).json({
        success: true,
        authenticated: false,
        admin: null
      });
    }

    return res.json({
      success: true,
      authenticated: true,
      admin: {
        id: String(admin.user_id || admin.id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        is_active: admin.is_active,
        allowed_pages: Array.isArray(admin.allowed_pages) ? admin.allowed_pages : ['submissions', 'corporate_admin', 'campus_admin', 'lessons'],
        last_login_at: admin.last_login_at
      }
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      authenticated: false,
      admin: null
    });
  }
}

// GET /api/admin/auth/status
export async function getStatus(req: AuthRequest, res: Response) {
  try {
    let token = req.cookies?.[COOKIE_NAME];
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.json({
        authenticated: false
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AdminJwtPayload;
    if (!decoded) {
      return res.json({
        authenticated: false
      });
    }

    return res.json({
      authenticated: true,
      admin: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (err) {
    return res.json({
      authenticated: false
    });
  }
}
