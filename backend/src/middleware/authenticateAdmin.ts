import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthRequest, AdminJwtPayload } from '../types/auth.js';

export function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 1. Extract token from HttpOnly cookie or Authorization header
    let token = req.cookies?.admin_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to access admin resources.'
      });
    }

    // 2. Verify JWT Token
    const decoded = jwt.verify(token, config.jwtSecret) as AdminJwtPayload;

    if (!decoded || (!decoded.id && !(decoded as any).user_id)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token.'
      });
    }

    // 3. Attach authenticated admin payload to request
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication session.'
    });
  }
}

/**
 * Optional authentication middleware that attaches admin payload if token exists,
 * but does not block requests if unauthenticated.
 */
export function optionalAuthenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.admin_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as AdminJwtPayload;
      if (decoded && (decoded.id || (decoded as any).user_id)) {
        req.admin = decoded;
      }
    }
  } catch (err) {
    // Silently continue for optional auth
  }
  next();
}

/**
 * Middleware to enforce super_admin role requirement
 */
export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.'
    });
  }

  const role = req.admin.role;
  if (role !== 'super_admin' && role !== 'Super Admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Super Admin role is required for this action.'
    });
  }

  next();
}
