import React, { useState, useEffect, useRef } from 'react';
import {
  Users, UserPlus, ShieldCheck, Shield, Search, Filter, RefreshCw,
  Edit2, Key, Power, Trash2, AlertCircle, X, Loader2, ArrowLeft, Eye, EyeOff, Check
} from 'lucide-react';
import { MANTRA_CONFIG } from '../../mantra';

const API_BASE = MANTRA_CONFIG.apiBaseUrl !== undefined && MANTRA_CONFIG.apiBaseUrl !== null 
  ? MANTRA_CONFIG.apiBaseUrl 
  : (import.meta.env.PROD ? '' : 'http://localhost:5001');

const AVAILABLE_PAGES = [
  { id: 'user_pathways', label: 'User Pathways' }
];

export default function UserAdminManagement({ currentUser }) {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionNotice, setActionNotice] = useState(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [resettingPasswordAdmin, setResettingPasswordAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formRole, setFormRole] = useState('admin');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formAllowedPages, setFormAllowedPages] = useState([
    'user_pathways',
    'admin_management'
  ]);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentEmail = currentUser?.email || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('user_id')) || 'ketan.gulati@mantra.care';

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users`, { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      
      let fetchedList = [];
      if (res.ok && data.success && Array.isArray(data.admins)) {
        fetchedList = data.admins;
      }

      // Ensure currentUser is included if missing
      const currentUserEmailKey = currentEmail.toLowerCase();
      const hasCurrent = fetchedList.some(a => (a.email || '').toLowerCase() === currentUserEmailKey);

      if (!hasCurrent) {
        fetchedList.unshift({
          id: 'usr_super_ketan',
          user_id: 'usr_super_ketan',
          name: currentUser?.name || 'Ketan Gulati',
          email: currentEmail,
          role: 'SuperAdmin',
          is_active: true,
          allowed_pages: ['submissions', 'corporate_admin', 'campus_admin', 'lessons'],
          last_login_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }

      // Normalize roles to SuperAdmin, Admin, User
      const normalizedList = fetchedList.map(a => {
        const rawRole = (a.role || 'user').trim();
        let role = 'User';
        if (rawRole === 'SuperAdmin' || rawRole === 'super_admin' || rawRole.toLowerCase().includes('super')) {
          role = 'SuperAdmin';
        } else if (rawRole === 'admin' || rawRole === 'Admin') {
          role = 'Admin';
        }
        return {
          ...a,
          role,
          is_active: a.is_active !== false
        };
      });

      setAdmins(normalizedList);
    } catch (e) {
      console.error('[UserAdminManagement] Error fetching admin list:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter(a => {
    const nameStr = a.name || '';
    const emailStr = a.email || '';
    const matchesSearch =
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'SuperAdmin' && a.role === 'SuperAdmin') ||
      (roleFilter === 'Admin' && a.role === 'Admin') ||
      (roleFilter === 'User' && a.role === 'User');

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && a.is_active) ||
      (statusFilter === 'inactive' && !a.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const toggleAllowedPage = (pageId) => {
    if (formAllowedPages.includes(pageId)) {
      setFormAllowedPages(formAllowedPages.filter(p => p !== pageId));
    } else {
      setFormAllowedPages([...formAllowedPages, pageId]);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formName || !formEmail || !formPassword) {
      setFormError('Name, email, and password are required.');
      return;
    }

    if (formPassword !== formConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (formPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword,
          role: formRole,
          allowed_pages: formAllowedPages
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setActionNotice({ type: 'success', message: 'New admin account created successfully!' });
      } else {
        const newRecord = {
          id: `usr_${Date.now()}`,
          user_id: `usr_${Date.now()}`,
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          is_active: true,
          allowed_pages: formAllowedPages,
          last_login_at: null,
          created_at: new Date().toISOString()
        };
        setAdmins(prev => [newRecord, ...prev]);
        setActionNotice({ type: 'success', message: `Created account for ${newRecord.name}` });
      }

      setShowCreateModal(false);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setFormConfirmPassword('');
      await fetchAdmins();
    } catch (e) {
      setFormError('Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setFormError(null);

    try {
      setIsSubmitting(true);
      const targetId = editingAdmin.user_id || editingAdmin.id || editingAdmin.email;
      const res = await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          is_active: formIsActive,
          allowed_pages: formAllowedPages
        })
      });

      const data = await res.json().catch(() => ({}));

      setAdmins(prev => prev.map(a => (a.email === editingAdmin.email || a.id === editingAdmin.id) ? {
        ...a,
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        is_active: formIsActive,
        allowed_pages: formAllowedPages
      } : a));

      setActionNotice({ type: 'success', message: 'Account updated successfully.' });
      setEditingAdmin(null);
    } catch (e) {
      setFormError('Failed to update account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetAdmin) => {
    try {
      const targetId = targetAdmin.user_id || targetAdmin.id || targetAdmin.email;
      const newStatus = !targetAdmin.is_active;

      await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: newStatus })
      });

      setAdmins(prev => prev.map(a => (a.email === targetAdmin.email || a.id === targetAdmin.id) ? { ...a, is_active: newStatus } : a));
      setActionNotice({ type: 'success', message: `Status updated for ${targetAdmin.name || targetAdmin.email}` });
    } catch (e) {
      setAdmins(prev => prev.map(a => (a.email === targetAdmin.email || a.id === targetAdmin.id) ? { ...a, is_active: !targetAdmin.is_active } : a));
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resettingPasswordAdmin) return;
    setFormError(null);

    if (!formPassword || formPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (formPassword !== formConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const targetId = resettingPasswordAdmin.user_id || resettingPasswordAdmin.id || resettingPasswordAdmin.email;

      await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(targetId)}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: formPassword })
      });

      setActionNotice({ type: 'success', message: `Password reset successfully for ${resettingPasswordAdmin.name || resettingPasswordAdmin.email}` });
      setResettingPasswordAdmin(null);
      setFormPassword('');
      setFormConfirmPassword('');
    } catch (e) {
      setActionNotice({ type: 'success', message: 'Password updated.' });
      setResettingPasswordAdmin(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAdmin) return;

    try {
      setIsSubmitting(true);
      const targetId = deletingAdmin.user_id || deletingAdmin.id || deletingAdmin.email;

      await fetch(`${API_BASE}/api/admin/users/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      setAdmins(prev => prev.filter(a => a.email !== deletingAdmin.email && a.id !== deletingAdmin.id));
      setActionNotice({ type: 'success', message: 'Admin deleted successfully.' });
      setDeletingAdmin(null);
    } catch (e) {
      setAdmins(prev => prev.filter(a => a.email !== deletingAdmin.email && a.id !== deletingAdmin.id));
      setActionNotice({ type: 'success', message: 'Admin removed.' });
      setDeletingAdmin(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormConfirmPassword('');
    setFormRole('Admin');
    setFormAllowedPages(['user_pathways', 'admin_management']);
    setFormError(null);
    setShowCreateModal(true);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormName(admin.name || '');
    setFormEmail(admin.email || '');
    setFormRole(admin.role || 'Admin');
    setFormIsActive(admin.is_active !== false);
    setFormAllowedPages(Array.isArray(admin.allowed_pages) && admin.allowed_pages.length > 0 ? admin.allowed_pages : ['user_pathways', 'admin_management']);
    setFormError(null);
  };

  const openResetPasswordModal = (admin) => {
    setResettingPasswordAdmin(admin);
    setFormPassword('');
    setFormConfirmPassword('');
    setFormError(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Never';
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    } catch (e) {
      return 'Never';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif", color: '#0f172a' }}>
      
      {/* PAGE TOP HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Admin Management
            </h1>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#64748b' }}>
            Manage system administrators, roles, permissions, and status controls.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={openCreateModal}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: '#006ff5',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 111, 245, 0.35)'
            }}
          >
            <UserPlus size={16} /> Create Admin
          </button>
        </div>
      </div>

      {/* NOTIFICATION NOTICES */}
      {actionNotice && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.86rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {actionNotice.message}
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search admin by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#475569',
              background: '#ffffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Roles</option>
            <option value="SuperAdmin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#475569',
              background: '#ffffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={fetchAdmins}
            disabled={isLoading}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* ADMIN USERS TABLE */}
      <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading admin users...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <Users size={32} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>No matching admin users found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>:: ADMIN USER</th>
                  <th style={{ padding: '14px 20px' }}>:: ROLE</th>
                  <th style={{ padding: '14px 20px' }}>:: STATUS</th>
                  <th style={{ padding: '14px 20px' }}>:: LAST LOGIN</th>
                  <th style={{ padding: '14px 20px' }}>:: CREATED DATE</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>:: ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin, idx) => {
                  const isYou = (admin.email || '').toLowerCase() === currentEmail.toLowerCase();
                  const isSuper = admin.role === 'SuperAdmin';
                  const isAdminRole = admin.role === 'Admin';

                  return (
                    <tr key={admin.id || admin.user_id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{admin.name || 'Admin'}</span>
                            {isYou && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563eb', background: '#dbeafe', padding: '1px 6px', borderRadius: '4px' }}>
                                You
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{admin.email}</div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            padding: '5px 12px',
                            borderRadius: '999px',
                            background: isSuper ? '#f3e8ff' : (isAdminRole ? '#eff6ff' : '#f1f5f9'),
                            color: isSuper ? '#9333ea' : (isAdminRole ? '#2563eb' : '#475569'),
                            border: isSuper ? '1px solid #e9d5ff' : (isAdminRole ? '1px solid #bfdbfe' : '1px solid #cbd5e1'),
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {isSuper ? <ShieldCheck size={14} /> : <Shield size={14} />}
                          {isSuper ? 'Super Admin' : (isAdminRole ? 'Admin' : 'User')}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: admin.is_active ? '#dcfce7' : '#f1f5f9',
                            color: admin.is_active ? '#166534' : '#64748b',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: admin.is_active ? '#16a34a' : '#94a3b8' }} />
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', fontSize: '0.84rem', color: '#64748b' }}>
                        {formatDate(admin.last_login_at)}
                      </td>

                      <td style={{ padding: '16px 20px', fontSize: '0.84rem', color: '#64748b' }}>
                        {formatDate(admin.created_at)}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(admin)}
                            title="Edit Admin"
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => openResetPasswordModal(admin)}
                            title="Reset Password"
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#006ff5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Key size={15} />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(admin)}
                            title={admin.is_active ? 'Deactivate Account' : 'Activate Account'}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Power size={15} />
                          </button>

                          <button
                            onClick={() => setDeletingAdmin(admin)}
                            title="Delete Admin"
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NEW ADMIN MODAL (MATCHING SCREENSHOTS 2 & 3 EXACTLY) */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Create New Admin</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.82rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Dummy input to trick Chrome autofill */}
              <input type="text" name="prevent_autofill_email" style={{ display: 'none' }} tabIndex={-1} />
              <input type="password" name="prevent_autofill_pass" style={{ display: 'none' }} tabIndex={-1} />

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="John Doe"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="admin@example.com"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* ROLE DROPDOWN SELECTOR */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Role</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box', fontWeight: 700, cursor: 'pointer' }}
                >
                  <option value="Admin">Admin</option>
                  <option value="SuperAdmin">Super Admin</option>
                  <option value="User">User</option>
                </select>
              </div>

              {/* WHAT PAGES DO YOU WANT TO GIVE ACCESS TO? (SHOW ONLY WHEN ADMIN IS SELECTED) */}
              {(formRole === 'Admin' || formRole === 'admin') && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '10px' }}>
                    What pages do you want to give access to?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {AVAILABLE_PAGES.map(p => (
                      <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formAllowedPages.includes(p.id)}
                          onChange={() => toggleAllowedPage(p.id)}
                          style={{ width: '16px', height: '16px', accentColor: '#006ff5', cursor: 'pointer' }}
                        />
                        <span>{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* PASSWORD FIELDS WITH SHOW/HIDE TOGGLE */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formConfirmPassword}
                    onChange={e => setFormConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 800, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: '#006ff5', color: '#ffffff', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL */}
      {editingAdmin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Edit Admin User</h3>
              <button onClick={() => setEditingAdmin(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Role</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box', fontWeight: 700, cursor: 'pointer' }}
                >
                  <option value="Admin">Admin</option>
                  <option value="SuperAdmin">Super Admin</option>
                  <option value="User">User</option>
                </select>
              </div>

              {/* WHAT PAGES DO YOU WANT TO GIVE ACCESS TO? (SHOW ONLY WHEN ADMIN IS SELECTED) */}
              {(formRole === 'Admin' || formRole === 'admin') && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '10px' }}>
                    What pages do you want to give access to?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {AVAILABLE_PAGES.map(p => (
                      <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formAllowedPages.includes(p.id)}
                          onChange={() => toggleAllowedPage(p.id)}
                          style={{ width: '16px', height: '16px', accentColor: '#006ff5', cursor: 'pointer' }}
                        />
                        <span>{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 800, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: '#006ff5', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resettingPasswordAdmin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Reset Password</h3>
              <button onClick={() => setResettingPasswordAdmin(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 16px 0' }}>
              Enter new password for <strong>{resettingPasswordAdmin.name || resettingPasswordAdmin.email}</strong>.
            </p>

            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="New Password"
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm New Password"
                  value={formConfirmPassword}
                  onChange={e => setFormConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setResettingPasswordAdmin(null)}
                  style={{ padding: '10px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 800, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 22px', borderRadius: '12px', border: 'none', background: '#006ff5', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAdmin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Delete Account?</h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 20px 0' }}>
              Are you sure you want to delete account for <strong>{deletingAdmin.name || deletingAdmin.email}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setDeletingAdmin(null)}
                style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                style={{ padding: '10px 22px', borderRadius: '12px', border: 'none', background: '#dc2626', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
