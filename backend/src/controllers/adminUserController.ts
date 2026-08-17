import { Response } from 'express';
import { AuthRequest } from '../types/auth.js';
import {
  getAllAdmins,
  findAdminById,
  findAdminByEmail,
  createAdminRecord,
  updateAdminRecord,
  updateAdminStatusRecord,
  resetAdminPasswordRecord,
  deleteAdminRecord,
  hashPassword,
  countSuperAdmins
} from '../services/adminAuthService.js';

// GET /api/admin/users
export async function listAdmins(req: AuthRequest, res: Response) {
  try {
    const admins = await getAllAdmins();
    return res.json({
      success: true,
      admins
    });
  } catch (err) {
    console.error('❌ listAdmins Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve admin users list.'
    });
  }
}

// POST /api/admin/users
export async function createAdmin(req: AuthRequest, res: Response) {
  try {
    const { name, email, password, role, allowed_pages } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const existing = await findAdminByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An admin account with this email already exists.'
      });
    }

    const password_hash = await hashPassword(password);
    const newAdmin = await createAdminRecord({
      name,
      email,
      password_hash,
      role: role || 'admin',
      allowed_pages: Array.isArray(allowed_pages) ? allowed_pages : undefined
    });

    return res.status(210).json({
      success: true,
      message: 'Admin account created successfully.',
      admin: newAdmin
    });
  } catch (err) {
    console.error('❌ createAdmin Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create admin user.'
    });
  }
}

// PUT /api/admin/users/:id
export async function updateAdmin(req: AuthRequest, res: Response) {
  try {
    const targetId = req.params.id;
    const currentAdminId = req.admin?.id;
    const { name, email, role, is_active, allowed_pages } = req.body || {};

    if (!targetId) {
      return res.status(400).json({ success: false, error: 'Invalid admin ID.' });
    }

    const targetAdmin = await findAdminById(targetId);
    if (!targetAdmin) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    // Self-Protection check: A super admin cannot revoke their own super_admin role
    if (String(targetAdmin.user_id) === String(currentAdminId) && role && role !== 'super_admin' && role !== 'Super Admin') {
      return res.status(400).json({
        success: false,
        error: 'Self Protection: You cannot remove your own Super Admin role.'
      });
    }

    // Self-Protection check: A super admin cannot deactivate themselves
    if (String(targetAdmin.user_id) === String(currentAdminId) && is_active === false) {
      return res.status(400).json({
        success: false,
        error: 'Self Protection: You cannot deactivate your own account.'
      });
    }

    // System Protection check: Ensure at least one active Super Admin remains
    if (
      (targetAdmin.role === 'super_admin' || targetAdmin.role === 'Super Admin') &&
      ((role && role !== 'super_admin' && role !== 'Super Admin') || is_active === false)
    ) {
      const activeSuperAdmins = await countSuperAdmins();
      if (activeSuperAdmins <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Protection Rule: System must have at least one active Super Admin account.'
        });
      }
    }

    // Email Uniqueness check
    if (email && email.toLowerCase() !== targetAdmin.email.toLowerCase()) {
      const existing = await findAdminByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Another admin account already uses this email.'
        });
      }
    }

    const updated = await updateAdminRecord(targetId, {
      name,
      email,
      role,
      is_active,
      allowed_pages: Array.isArray(allowed_pages) ? allowed_pages : undefined
    });
    return res.json({
      success: true,
      message: 'Admin account updated successfully.',
      admin: updated
    });
  } catch (err: any) {
    console.error('❌ updateAdmin Error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to update admin account.'
    });
  }
}

// PATCH /api/admin/users/:id/status
export async function updateAdminStatus(req: AuthRequest, res: Response) {
  try {
    const targetId = req.params.id;
    const currentAdminId = req.admin?.id;
    const { is_active } = req.body || {};

    if (!targetId || typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Invalid parameters. is_active boolean required.' });
    }

    const targetAdmin = await findAdminById(targetId);
    if (!targetAdmin) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    if (String(targetAdmin.user_id) === String(currentAdminId) && !is_active) {
      return res.status(400).json({
        success: false,
        error: 'Self Protection: You cannot deactivate your own account.'
      });
    }

    if (!is_active && (targetAdmin.role === 'super_admin' || targetAdmin.role === 'Super Admin')) {
      const activeSuperAdmins = await countSuperAdmins();
      if (activeSuperAdmins <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Protection Rule: Cannot deactivate the last Super Admin.'
        });
      }
    }

    await updateAdminStatusRecord(targetId, is_active);
    return res.json({
      success: true,
      message: `Admin account ${is_active ? 'activated' : 'deactivated'} successfully.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update admin status.' });
  }
}

// PATCH /api/admin/users/:id/password
export async function resetAdminPassword(req: AuthRequest, res: Response) {
  try {
    const targetId = req.params.id;
    const { password } = req.body || {};

    if (!targetId || !password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long.'
      });
    }

    const targetAdmin = await findAdminById(targetId);
    if (!targetAdmin) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    const password_hash = await hashPassword(password);
    await resetAdminPasswordRecord(targetId, password_hash);

    return res.json({
      success: true,
      message: 'Admin password reset successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to reset admin password.' });
  }
}

// DELETE /api/admin/users/:id
export async function deleteAdmin(req: AuthRequest, res: Response) {
  try {
    const targetId = req.params.id;
    const currentAdminId = req.admin?.id;

    if (!targetId) {
      return res.status(400).json({ success: false, error: 'Invalid admin ID.' });
    }

    const targetAdmin = await findAdminById(targetId);
    if (!targetAdmin) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    if (String(targetAdmin.user_id) === String(currentAdminId)) {
      return res.status(400).json({
        success: false,
        error: 'Self Protection: You cannot delete your own account.'
      });
    }

    if (targetAdmin.role === 'super_admin' || targetAdmin.role === 'Super Admin') {
      const activeSuperAdmins = await countSuperAdmins();
      if (activeSuperAdmins <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Protection Rule: Cannot delete the last Super Admin.'
        });
      }
    }

    await deleteAdminRecord(targetId);
    return res.json({
      success: true,
      message: 'Admin account deleted successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete admin account.' });
  }
}
