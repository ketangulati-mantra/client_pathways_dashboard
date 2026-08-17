import { sql } from '../db/client.js';
import bcrypt from 'bcryptjs';

export interface AdminRecord {
  id: string;
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  is_reviewer?: boolean;
  is_active: boolean;
  allowed_pages?: string[];
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function findAdminByEmail(email: string): Promise<AdminRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const rows = await sql`
    SELECT user_id as id, user_id, name, email, password_hash, role, is_reviewer, is_active, allowed_pages, last_login_at, created_at, updated_at
    FROM users
    WHERE LOWER(email) = ${normalizedEmail}
    LIMIT 1
  `;

  if (rows.length === 0) return null;
  const admin = rows[0] as AdminRecord;
  if (!Array.isArray(admin.allowed_pages)) {
    admin.allowed_pages = ['submissions', 'corporate_admin', 'campus_admin', 'lessons'];
  }
  return admin;
}

export async function findAdminById(id: string | number): Promise<AdminRecord | null> {
  const strId = String(id);

  const rows = await sql`
    SELECT user_id as id, user_id, name, email, password_hash, role, is_reviewer, is_active, allowed_pages, last_login_at, created_at, updated_at
    FROM users
    WHERE user_id::text = ${strId} OR LOWER(email) = ${strId.toLowerCase()}
    LIMIT 1
  `;

  if (rows.length === 0) return null;
  const admin = rows[0] as AdminRecord;
  if (!Array.isArray(admin.allowed_pages)) {
    admin.allowed_pages = ['submissions', 'corporate_admin', 'campus_admin', 'lessons'];
  }
  return admin;
}

export async function updateAdminLastLogin(id: string | number): Promise<void> {
  const strId = String(id);
  await sql`
    UPDATE users
    SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE user_id::text = ${strId} OR LOWER(email) = ${strId.toLowerCase()}
  `;
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hash);
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainText, salt);
}

export async function getAllAdmins(): Promise<Omit<AdminRecord, 'password_hash'>[]> {
  const rows = await sql`
    SELECT user_id as id, user_id, name, email, role, is_reviewer, is_active, allowed_pages, last_login_at, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `;
  return rows.map((r: Record<string, any>) => ({
    ...r,
    allowed_pages: Array.isArray(r.allowed_pages) ? r.allowed_pages : ['submissions', 'corporate_admin', 'campus_admin', 'lessons']
  })) as Omit<AdminRecord, 'password_hash'>[];
}

export async function countSuperAdmins(): Promise<number> {
  try {
    const rows = await sql`
      SELECT COUNT(*)::int as count
      FROM users
      WHERE (role::text = 'super_admin' OR role::text = 'Super Admin' OR role::text = 'superadmin') AND is_active = TRUE
    `;
    return rows[0]?.count || 0;
  } catch (err) {
    return 1;
  }
}

export async function createAdminRecord(data: {
  name: string;
  email: string;
  password_hash: string;
  role?: string;
  allowed_pages?: string[];
}): Promise<Omit<AdminRecord, 'password_hash'>> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedRole = data.role === 'super_admin' || data.role === 'Super Admin' || data.role === 'superadmin' ? 'super_admin' : 'admin';
  const newUserId = `admin_${Date.now()}`;
  const pagesJson = JSON.stringify(data.allowed_pages && data.allowed_pages.length > 0 ? data.allowed_pages : ['submissions', 'corporate_admin', 'campus_admin', 'lessons']);

  const rows = await sql`
    INSERT INTO users (user_id, name, email, password_hash, role, is_active, is_reviewer, allowed_pages)
    VALUES (${newUserId}, ${data.name.trim()}, ${normalizedEmail}, ${data.password_hash}, ${normalizedRole}, TRUE, FALSE, ${pagesJson}::jsonb)
    RETURNING user_id as id, user_id, name, email, role, is_reviewer, is_active, allowed_pages, last_login_at, created_at, updated_at
  `;

  return rows[0] as Omit<AdminRecord, 'password_hash'>;
}

export async function updateAdminRecord(
  id: string | number,
  data: { name?: string; email?: string; role?: string; is_active?: boolean; is_reviewer?: boolean; allowed_pages?: string[] }
): Promise<Omit<AdminRecord, 'password_hash'> | null> {
  const strId = String(id);
  const existing = await findAdminById(strId);
  if (!existing) return null;

  const newName = data.name !== undefined && data.name.trim() ? data.name.trim() : existing.name;
  const newEmail = data.email !== undefined && data.email.trim() ? data.email.trim().toLowerCase() : existing.email;
  const newRole = data.role !== undefined ? (data.role === 'super_admin' || data.role === 'Super Admin' || data.role === 'superadmin' ? 'super_admin' : 'admin') : existing.role;
  const newActive = data.is_active !== undefined ? Boolean(data.is_active) : existing.is_active;
  const newReviewer = data.is_reviewer !== undefined ? Boolean(data.is_reviewer) : Boolean(existing.is_reviewer);
  const newPagesJson = data.allowed_pages ? JSON.stringify(data.allowed_pages) : (existing.allowed_pages ? JSON.stringify(existing.allowed_pages) : '["submissions", "corporate_admin", "campus_admin", "lessons"]');

  const rows = await sql`
    UPDATE users
    SET name = ${newName}, email = ${newEmail}, role = ${newRole}, is_active = ${newActive}, is_reviewer = ${newReviewer}, allowed_pages = ${newPagesJson}::jsonb, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${existing.user_id}
    RETURNING user_id as id, user_id, name, email, role, is_reviewer, is_active, allowed_pages, last_login_at, created_at, updated_at
  `;

  if (!rows || rows.length === 0) return existing;
  const resRecord = rows[0] as Omit<AdminRecord, 'password_hash'>;
  if (!Array.isArray(resRecord.allowed_pages)) {
    resRecord.allowed_pages = data.allowed_pages || ['submissions', 'corporate_admin', 'campus_admin', 'lessons'];
  }
  return resRecord;
}

export async function updateAdminStatusRecord(id: string | number, is_active: boolean): Promise<boolean> {
  const strId = String(id);
  await sql`
    UPDATE users
    SET is_active = ${is_active}, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${strId}
  `;
  return true;
}

export async function resetAdminPasswordRecord(id: string | number, password_hash: string): Promise<boolean> {
  const strId = String(id);
  await sql`
    UPDATE users
    SET password_hash = ${password_hash}, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${strId}
  `;
  return true;
}

export async function deleteAdminRecord(id: string | number): Promise<boolean> {
  const strId = String(id);
  await sql`
    DELETE FROM users
    WHERE user_id = ${strId}
  `;
  return true;
}
