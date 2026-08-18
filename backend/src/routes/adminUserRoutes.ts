import { Router } from 'express';
import {
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from '../controllers/adminUserController.js';

const router = Router();

// GET /api/admin/users - List all admin users
router.get('/', listAdmins);

// POST /api/admin/users - Create new admin user
router.post('/', createAdmin);

// PUT /api/admin/users/:id - Update admin user details
router.put('/:id', updateAdmin);

// DELETE /api/admin/users/:id - Delete admin user
router.delete('/:id', deleteAdmin);

export default router;
