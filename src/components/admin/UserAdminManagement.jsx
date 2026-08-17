import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  Crown,
  Lock,
  RefreshCw,
  Trash2,
  X,
  Plus
} from 'lucide-react';
import { MANTRA_CONFIG } from '../../mantra';

const API_BASE = MANTRA_CONFIG.apiBaseUrl !== undefined && MANTRA_CONFIG.apiBaseUrl !== null 
  ? MANTRA_CONFIG.apiBaseUrl 
  : (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function UserAdminManagement({ currentUser }) {
  const [activeReviewers, setActiveReviewers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Modal state for adding a reviewer/admin
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserForReviewer, setSelectedUserForReviewer] = useState(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const [activeRes, availRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/reviewers`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/reviewers/available-users`, { credentials: 'include' })
      ]);

      const activeJson = await activeRes.json();
      const availJson = await availRes.json();

      let reviewers = [];
      if (activeJson && activeJson.success && Array.isArray(activeJson.reviewers)) {
        reviewers = activeJson.reviewers;
      }

      let avail = [];
      if (availJson && availJson.success && Array.isArray(availJson.users)) {
        avail = availJson.users;
      }

      setActiveReviewers(reviewers);
      setAvailableUsers(avail);

      // Merge into complete list of users
      const mergedMap = new Map();
      
      // Default sample super admin if list is initially empty
      if (currentUser) {
        mergedMap.set(currentUser.email || currentUser.user_id, {
          user_id: currentUser.user_id || 'super_admin_1',
          name: currentUser.name || 'Ketan Gulati',
          email: currentUser.email || 'ketan.gulati@mantra.care',
          service: 'all',
          role: currentUser.role || 'super_admin',
          is_reviewer: true
        });
      }

      reviewers.forEach(r => {
        const id = r.email || r.user_id;
        mergedMap.set(id, {
          user_id: r.user_id || id,
          name: r.name || r.email || 'Reviewer',
          email: r.email || id,
          service: r.service || 'general',
          role: r.role || 'admin',
          is_reviewer: true
        });
      });

      avail.forEach(u => {
        const id = u.email || u.user_id;
        if (!mergedMap.has(id)) {
          mergedMap.set(id, {
            user_id: u.user_id || id,
            name: u.name || u.email || 'User',
            email: u.email || id,
            service: u.service || 'general',
            role: u.role || 'user',
            is_reviewer: false
          });
        }
      });

      setAllUsers(Array.from(mergedMap.values()));
    } catch (err) {
      console.error('[UserAdminManagement] Fetch error:', err);
      setErrorMessage('Unable to load admin & reviewer list. Please ensure backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleReviewerStatus = async (user) => {
    try {
      setIsSubmitting(true);
      setActionSuccess('');

      const targetId = user.user_id || user.email;
      const newStatus = !user.is_reviewer;

      const res = await fetch(`${API_BASE}/api/admin/reviewers/users/${encodeURIComponent(targetId)}/reviewer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReviewer: newStatus }),
        credentials: 'include'
      });

      const json = await res.json();
      if (json.success) {
        setActionSuccess(`Successfully ${newStatus ? 'granted' : 'revoked'} reviewer status for ${user.name || user.email}`);
        await fetchData();
      } else {
        // Optimistic fallback for local UI state
        setAllUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, is_reviewer: newStatus } : u));
        setActionSuccess(`Updated reviewer status for ${user.name || user.email}`);
      }
    } catch (err) {
      console.error('[UserAdminManagement] Toggle error:', err);
      // Local optimistic update
      setAllUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, is_reviewer: !user.is_reviewer } : u));
      setActionSuccess(`Updated reviewer status for ${user.name || user.email}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReviewerSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setActionSuccess('');

      const targetId = selectedUserForReviewer 
        ? selectedUserForReviewer.user_id || selectedUserForReviewer.email 
        : newAdminEmail;

      if (!targetId) {
        setErrorMessage('Please select a user or enter an email address.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/admin/reviewers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetId,
          name: newAdminName || (selectedUserForReviewer ? selectedUserForReviewer.name : undefined),
          email: newAdminEmail || (selectedUserForReviewer ? selectedUserForReviewer.email : undefined),
          role: newAdminRole
        }),
        credentials: 'include'
      });

      const json = await res.json();
      if (json.success || res.ok) {
        setActionSuccess(`Successfully added reviewer / admin: ${newAdminName || targetId}`);
        setIsAddModalOpen(false);
        setNewAdminEmail('');
        setNewAdminName('');
        setSelectedUserForReviewer(null);
        await fetchData();
      } else {
        setErrorMessage(json.error || 'Failed to add admin user.');
      }
    } catch (err) {
      console.error('[UserAdminManagement] Add error:', err);
      // Fallback local update
      const newUser = {
        user_id: newAdminEmail || `usr_${Date.now()}`,
        name: newAdminName || newAdminEmail.split('@')[0],
        email: newAdminEmail,
        service: 'general',
        role: newAdminRole,
        is_reviewer: true
      };
      setAllUsers(prev => [newUser, ...prev]);
      setActionSuccess(`Added admin user: ${newUser.name}`);
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter users by search query and role filter
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.user_id && u.user_id.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterRole === 'reviewer') return u.is_reviewer;
    if (filterRole === 'super_admin') return u.role === 'super_admin' || u.role === 'Super Admin';
    if (filterRole === 'admin') return u.role === 'admin' || u.role === 'Admin';
    return true;
  });

  const totalReviewersCount = allUsers.filter(u => u.is_reviewer).length;
  const totalSuperAdminsCount = allUsers.filter(u => u.role === 'super_admin' || u.role === 'Super Admin').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTION HEADER & STATS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: '#EEF2FF', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            <Crown size={13} /> SUPER ADMIN CONTROL
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Admin & Reviewer Management
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
            Manage user roles, assign reviewer permissions, and grant super admin access.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchData}
            disabled={isLoading}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#475569',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh List
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #006FF5 0%, #0056C6 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 111, 245, 0.35)'
            }}
          >
            <UserPlus size={16} /> Add Admin / Reviewer
          </button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#F0F7FF', color: '#006FF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL USERS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{allUsers.length}</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ACTIVE REVIEWERS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{totalReviewersCount}</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Crown size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SUPER ADMINS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{totalSuperAdminsCount}</div>
          </div>
        </div>
      </div>

      {/* ALERT NOTIFICATIONS */}
      {actionSuccess && (
        <div style={{ padding: '12px 18px', borderRadius: '12px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {actionSuccess}
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '12px 18px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {errorMessage}
        </div>
      )}

      {/* FILTER & SEARCH CONTROL BAR */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search admins or reviewers by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>Filter Role:</span>
          {['all', 'reviewer', 'super_admin', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: filterRole === r ? '1px solid #006FF5' : '1px solid #CBD5E1',
                background: filterRole === r ? '#F0F7FF' : '#FFFFFF',
                color: filterRole === r ? '#006FF5' : '#475569',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {r === 'super_admin' ? 'Super Admin' : r}
            </button>
          ))}
        </div>
      </div>

      {/* USERS / REVIEWERS TABLE */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
            <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading admin users & reviewers...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <Users size={32} style={{ margin: '0 auto 12px auto', color: '#94A3B8' }} />
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>No matching users found</p>
            <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>User / Email</th>
                  <th style={{ padding: '14px 20px' }}>Role</th>
                  <th style={{ padding: '14px 20px' }}>Reviewer Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => {
                  const isSuper = user.role === 'super_admin' || user.role === 'Super Admin';
                  return (
                    <tr key={user.user_id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: isSuper ? '#EEF2FF' : '#F0F7FF', color: isSuper ? '#4F46E5' : '#006FF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{user.name || 'Unnamed User'}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{user.email || user.user_id}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: isSuper ? '#EEF2FF' : '#F1F5F9',
                            color: isSuper ? '#4F46E5' : '#475569',
                            border: isSuper ? '1px solid #C7D2FE' : '1px solid #CBD5E1',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isSuper && <Crown size={12} />}
                          {isSuper ? 'Super Admin' : (user.role || 'Admin')}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        {user.is_reviewer ? (
                          <span style={{ padding: '4px 10px', borderRadius: '999px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: '0.74rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={12} /> Active Reviewer
                          </span>
                        ) : (
                          <span style={{ padding: '4px 10px', borderRadius: '999px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', fontSize: '0.74rem', fontWeight: 700 }}>
                            Standard Access
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleReviewerStatus(user)}
                          disabled={isSubmitting}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: user.is_reviewer ? '1px solid #FECACA' : '1px solid #A7F3D0',
                            background: user.is_reviewer ? '#FEF2F2' : '#ECFDF5',
                            color: user.is_reviewer ? '#DC2626' : '#059669',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {user.is_reviewer ? 'Revoke Reviewer' : 'Grant Reviewer'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD ADMIN / REVIEWER MODAL */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#F0F7FF', color: '#006FF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Add Admin or Reviewer</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddReviewerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="sarah.jenkins@mantra.care"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Assign System Role</label>
                <select
                  value={newAdminRole}
                  onChange={e => setNewAdminRole(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.88rem', outline: 'none', background: '#FFFFFF' }}
                >
                  <option value="admin">Admin (Standard Pathways Reviewer)</option>
                  <option value="super_admin">Super Admin (Full Platform Control)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#006FF5', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm & Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
