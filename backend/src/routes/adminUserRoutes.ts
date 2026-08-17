import { Router } from 'express';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/authenticateAdmin.js';
import {
  listAdmins,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  resetAdminPassword,
  deleteAdmin
} from '../controllers/adminUserController.js';

const router = Router();

// Protect all admin management routes with authenticateAdmin & requireSuperAdmin middleware
router.use(authenticateAdmin);
router.use(requireSuperAdmin);

// GET /api/admin/users
router.get('/', listAdmins);

// POST /api/admin/users
router.post('/', createAdmin);

// PUT /api/admin/users/:id
router.put('/:id', updateAdmin);

// PATCH /api/admin/users/:id/status
router.patch('/:id/status', updateAdminStatus);

// PATCH /api/admin/users/:id/password
router.patch('/:id/password', resetAdminPassword);

// DELETE /api/admin/users/:id
router.delete('/:id', deleteAdmin);

export default router;
