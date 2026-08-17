import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { User, X, Plus, Trash2, ChevronDown, Loader2, AlertCircle, Search, Check } from 'lucide-react';
import { MANTRA_CONFIG } from '../../mantra';

const API_BASE = MANTRA_CONFIG.apiBaseUrl !== undefined && MANTRA_CONFIG.apiBaseUrl !== null 
  ? MANTRA_CONFIG.apiBaseUrl 
  : (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default function ManageReviewersModal({ isOpen, onClose, onReviewersChange }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activeReviewers, setActiveReviewers] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'empty' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & custom dropdown state
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setStatus('loading');
      setErrorMessage('');
      setSelectedUser(null);
      setSearchTerm('');

      const [availRes, activeRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/reviewers/available-users`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/reviewers`, { credentials: 'include' })
      ]);

      const availJson = await availRes.json();
      const activeJson = await activeRes.json();

      if (availJson.success && Array.isArray(availJson.users)) {
        setAvailableUsers(availJson.users);
        if (availJson.users.length === 0) {
          setStatus('empty');
        } else {
          setStatus('success');
        }
      } else {
        setStatus('error');
        setErrorMessage(availJson.error || 'Failed to fetch available users.');
      }

      if (activeJson && activeJson.success) {
        let reviewersList = [];
        if (Array.isArray(activeJson.reviewers)) {
          reviewersList = activeJson.reviewers;
        } else if (Array.isArray(activeJson.data)) {
          reviewersList = activeJson.data
            .filter((r) => r && r !== 'Unassigned')
            .map((r, i) => {
              if (typeof r === 'string') {
                return { user_id: r, name: r, email: '', role: 'reviewer' };
              }
              return {
                user_id: String(r.user_id || r.id || r.name || i),
                name: r.name || r.email || 'Reviewer',
                email: r.email || '',
                role: r.role || 'reviewer'
              };
            });
        }
        setActiveReviewers(reviewersList);
        if (onReviewersChange) {
          const names = ['Unassigned', ...reviewersList.map(r => r.name || r.email || r.user_id).filter(Boolean)];
          onReviewersChange(Array.from(new Set(names)));
        }
      }
    } catch (err) {
      console.error('[ManageReviewersModal] Fetch error:', err);
      setStatus('error');
      setErrorMessage('Unable to load users. Please check server connectivity.');
    }
  };

  const handleAddReviewer = async (e) => {
    e.preventDefault();
    if (!selectedUser || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const payload = {
        userId: selectedUser.user_id,
        user_id: selectedUser.user_id,
        name: selectedUser.name || selectedUser.email || selectedUser.user_id,
        email: selectedUser.email || ''
      };

      let res = await fetch(`${API_BASE}/api/admin/reviewers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      let json = await res.json().catch(() => null);

      if (!json || !json.success) {
        res = await fetch(`${API_BASE}/api/submissions/admin/reviewers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        json = await res.json().catch(() => null);
      }

      if (json && json.success) {
        setSelectedUser(null);
        setSearchTerm('');
        await fetchData();
      } else {
        alert((json && json.error) || 'Failed to add reviewer.');
      }
    } catch (err) {
      console.error('[ManageReviewersModal] Error adding reviewer:', err);
      alert('Failed to add reviewer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveReviewer = async (user_id) => {
    if (!user_id || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/api/admin/reviewers/${encodeURIComponent(user_id)}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const json = await res.json();
      if (json.success) {
        await fetchData();
      } else {
        alert(json.error || 'Failed to remove reviewer.');
      }
    } catch (err) {
      console.error('[ManageReviewersModal] Error removing reviewer:', err);
      alert('Failed to remove reviewer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter available users based on search term
  const filteredUsers = availableUsers.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = u.name && u.name.toLowerCase().includes(term);
    const emailMatch = u.email && u.email.toLowerCase().includes(term);
    const roleMatch = u.role && u.role.toLowerCase().includes(term);
    return nameMatch || emailMatch || roleMatch;
  });

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          animation: 'scaleUp 0.15s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <User size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                Manage Reviewers
              </h3>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Search and select registered users to assign as reviewers</div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Searchable Add Reviewer Selector Section */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
          <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
            Search & Select User to Add as Reviewer
          </label>

          <form onSubmit={handleAddReviewer} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <div ref={dropdownRef} style={{ position: 'relative', flex: 1 }}>
              {/* Search Input Box */}
              <div 
                onClick={() => {
                  if (status === 'success' && availableUsers.length > 0 && !isSubmitting) {
                    setIsDropdownOpen(true);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '36px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: isDropdownOpen ? '1px solid #2563eb' : '1px solid #cbd5e1',
                  background: (status !== 'success' || availableUsers.length === 0 || isSubmitting) ? '#f1f5f9' : '#f8fafc',
                  boxShadow: isDropdownOpen ? '0 0 0 2px rgba(37, 99, 235, 0.15)' : 'none',
                  cursor: (status !== 'success' || availableUsers.length === 0 || isSubmitting) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Search size={14} color="#64748b" style={{ flexShrink: 0 }} />
                
                {selectedUser ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedUser.name || selectedUser.email} {selectedUser.email ? `(${selectedUser.email})` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(null);
                        setSearchTerm('');
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b', display: 'flex', alignItems: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (status === 'success' && availableUsers.length > 0 && !isSubmitting) {
                        setIsDropdownOpen(true);
                      }
                    }}
                    disabled={status !== 'success' || availableUsers.length === 0 || isSubmitting}
                    placeholder={
                      status === 'loading'
                        ? 'Loading users from database...'
                        : status === 'error'
                        ? 'Unable to load users'
                        : status === 'empty'
                        ? 'No eligible users available'
                        : 'Search by name or email...'
                    }
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#0f172a'
                    }}
                  />
                )}

                <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
              </div>

              {/* Dropdown Options Popup List */}
              {isDropdownOpen && status === 'success' && availableUsers.length > 0 && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                    zIndex: 10000,
                    padding: '4px'
                  }}
                >
                  {filteredUsers.length === 0 ? (
                    <div style={{ padding: '10px 12px', fontSize: '0.74rem', color: '#64748b', textAlign: 'center' }}>
                      No matching user found for "{searchTerm}"
                    </div>
                  ) : (
                    filteredUsers.map((u) => {
                      const displayName = u.name || u.email || u.user_id;
                      const isSelected = selectedUser && selectedUser.user_id === u.user_id;

                      return (
                        <div
                          key={u.user_id}
                          onClick={() => {
                            setSelectedUser(u);
                            setIsDropdownOpen(false);
                          }}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: isSelected ? '#eff6ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'background 0.1s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {displayName.slice(0, 1).toUpperCase()}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {displayName}
                              </div>
                              {u.email && u.email !== displayName && (
                                <div style={{ fontSize: '0.68rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {u.email}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              {u.role || 'user'}
                            </span>
                            {isSelected && <Check size={14} color="#2563eb" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Submit Add Reviewer Button */}
            <button
              type="submit"
              disabled={!selectedUser || isSubmitting}
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '8px',
                border: 'none',
                background: selectedUser && !isSubmitting ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#e2e8f0',
                color: selectedUser && !isSubmitting ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: selectedUser && !isSubmitting ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Reviewer
            </button>
          </form>

          {status === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#dc2626', marginTop: '6px' }}>
              <AlertCircle size={12} /> {errorMessage}
            </div>
          )}

          {status === 'empty' && (
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
              All registered users in the database are currently assigned as reviewers.
            </div>
          )}
        </div>

        {/* Active Reviewers List Section */}
        <div style={{ padding: '14px 18px', maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
            Active Reviewers ({activeReviewers.length + 1})
          </div>

          {/* System Default: Unassigned */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: '#f8fafc', 
              padding: '8px 12px', 
              borderRadius: '8px', 
              border: '1px solid #f1f5f9',
              fontSize: '0.78rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                U
              </div>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Unassigned</span>
              <span style={{ fontSize: '0.62rem', color: '#64748b', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Default</span>
            </div>
          </div>

          {/* Database Active Reviewers */}
          {activeReviewers.map((rev) => {
            const revName = rev.name || rev.email || rev.user_id;
            return (
              <div 
                key={rev.user_id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  background: '#f8fafc', 
                  padding: '8px 12px', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {revName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{revName}</div>
                    {rev.email && rev.email !== revName && (
                      <div style={{ fontSize: '0.66rem', color: '#64748b' }}>{rev.email}</div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveReviewer(rev.user_id)}
                  disabled={isSubmitting}
                  title={`Remove ${revName} from reviewers`}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#dc2626',
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 18px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button 
            onClick={onClose} 
            style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontWeight: 700, cursor: 'pointer', fontSize: '0.76rem' }}
          >
            Done
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
