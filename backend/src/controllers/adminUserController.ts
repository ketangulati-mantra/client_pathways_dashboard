import { Response } from 'express';
import { AuthRequest } from '../types/auth.js';
import {
  getAllAdmins,
  createAdminRecord,
  updateAdminRecord,
  deleteAdminRecord
} from '../services/adminAuthService.js';

// GET /api/admin/users - List all admin users
export async function listAdmins(req: AuthRequest, res: Response) {
  try {
    const admins = await getAllAdmins();
    return res.json({
      success: true,
      admins
    });
  } catch (err) {
    console.error('❌ Error in listAdmins controller:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch admin users.'
    });
  }
}

// POST /api/admin/users - Create new admin user
export async function createAdmin(req: AuthRequest, res: Response) {
  try {
    const { name, email, role, allowed_pages } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required.'
      });
    }

    const created = await createAdminRecord({
      name,
      email,
      role: role || 'user',
      allowed_pages
    });

    return res.status(201).json({
      success: true,
      message: 'Admin user created successfully.',
      admin: created
    });
  } catch (err: any) {
    console.error('❌ Error in createAdmin controller:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to create admin user.'
    });
  }
}

// PUT /api/admin/users/:id - Update admin user
export async function updateAdmin(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, role, is_active, is_reviewer, allowed_pages } = req.body || {};

    const updated = await updateAdminRecord(id, {
      name,
      email,
      role,
      is_active,
      is_reviewer,
      allowed_pages
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Admin user updated successfully.',
      admin: updated
    });
  } catch (err) {
    console.error('❌ Error in updateAdmin controller:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update admin user.'
    });
  }
}

// DELETE /api/admin/users/:id - Delete admin user
export async function deleteAdmin(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const deleted = await deleteAdminRecord(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Admin user deleted successfully.'
    });
  } catch (err) {
    console.error('❌ Error in deleteAdmin controller:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete admin user.'
    });
  }
}
