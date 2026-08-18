import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, Menu, Clock, ArrowRight, Filter, X, ChevronRight, LogOut, ShieldCheck, CheckCircle2, UserCheck, Crown, User } from 'lucide-react';
import UserAdminManagement from '../components/admin/UserAdminManagement';
import { activities as mantraActivities, getCurrentService, setServiceContext, preserveQueryParams, SUPPORTED_SERVICES, normalizeService } from '../mantra';
import { useAuth } from '../auth/AuthContext';

const MANTRA_LOGO_URL = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg';
const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5001';

export default function DeveloperLessonsPage({ onNavigate }) {
  const { admin: currentAdmin, logout } = useAuth();
  const [dbUser, setDbUser] = useState(null);

  // Fetch actual user profile directly from database (/api/admin/auth/me)
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/auth/me`, { credentials: 'include' });
        const json = await res.json();
        if (json.success && json.admin) {
          setDbUser(json.admin);
          sessionStorage.setItem('admin_user', JSON.stringify(json.admin));
        }
      } catch (e) {
        console.error('Failed to fetch user profile from DB:', e);
      }
    }
    fetchMe();
  }, []);

  const storedAdminJson = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_user') : null;
  let storedAdmin = null;
  try {
    storedAdmin = storedAdminJson ? JSON.parse(storedAdminJson) : null;
  } catch (e) {
    storedAdmin = null;
  }

  const displayAdmin = dbUser || currentAdmin || storedAdmin || {
    name: 'Ketan Gulati',
    email: (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('user_id')) || 'ketan.gulati@mantra.care',
    role: 'SuperAdmin'
  };

  const rawRole = (displayAdmin?.role || 'user').trim();
  const isSuperAdmin = rawRole === 'SuperAdmin' || rawRole.toLowerCase().includes('super');
  const roleDisplay = isSuperAdmin ? 'SuperAdmin' : (rawRole.toLowerCase() === 'admin' ? 'admin' : 'user');

  const [selectedService, setSelectedService] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = (window.location.hash || '').toLowerCase();
      if (hash.includes('users') || hash.includes('management')) return 'users';
      if (hash.includes('lessons') || hash.includes('pathways')) return 'lessons';

      const savedTab = sessionStorage.getItem('mantra_active_tab');
      if (savedTab) return savedTab;
    }
    return 'lessons';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchInputRef = useRef(null);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mantra_active_tab', tabName);
      if (tabName === 'users') window.location.hash = '#/admin/users';
      else if (tabName === 'lessons') window.location.hash = '#/admin/pathways';
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = (window.location.hash || '').toLowerCase();
      if (hash.includes('users') || hash.includes('management') || hash.includes('admin')) setActiveTab('users');
      else if (hash.includes('lessons') || hash.includes('pathways')) setActiveTab('lessons');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!isSuperAdmin && activeTab === 'users') {
      handleTabChange('lessons');
    }
  }, [isSuperAdmin, activeTab]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search || '');
    let serviceInUrl = searchParams.get('service') || searchParams.get('source');

    if (!serviceInUrl && window.location.hash) {
      const hashQueryIndex = window.location.hash.indexOf('?');
      if (hashQueryIndex !== -1) {
        const hashParams = new URLSearchParams(window.location.hash.substring(hashQueryIndex));
        serviceInUrl = hashParams.get('service') || hashParams.get('source');
      }
    }

    if (serviceInUrl) {
      setSelectedService(normalizeService(serviceInUrl));
    } else {
      setSelectedService('all');
    }

    const handleServiceChange = (e) => {
      if (e.detail && e.detail.service) {
        setSelectedService(normalizeService(e.detail.service));
      }
    };

    window.addEventListener('mantra_service_changed', handleServiceChange);

    return () => {
      window.removeEventListener('mantra_service_changed', handleServiceChange);
    };
  }, []);

  const handleServiceSelect = (svc) => {
    setSelectedService(svc);
    if (svc !== 'all') {
      setServiceContext(svc);
    }
  };

  const serviceOptions = ['all', ...(SUPPORTED_SERVICES || ['therapy', 'listener', 'yoga', 'diet', 'physiotherapy', 'coaching', 'women_wellness'])];

  const filteredActivities = (mantraActivities || []).filter(act => {
    if (!act) return false;
    const actServices = Array.isArray(act.services) ? act.services : (act.services ? [act.services] : ['*']);

    const normSelected = normalizeService(selectedService);
    const matchesService =
      selectedService === 'all' ||
      normSelected === 'all' ||
      actServices.includes('*') ||
      actServices.some(s => normalizeService(s) === normSelected) ||
      (act.service && normalizeService(act.service) === normSelected);

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      act.title?.toLowerCase().includes(query) ||
      act.lessonId?.toLowerCase().includes(query) ||
      act.route?.toLowerCase().includes(query);

    return matchesService && matchesSearch;
  });

  const handleLogoutAction = async () => {
    if (logout) {
      await logout();
    }
    sessionStorage.clear();
    window.location.href = '#/admin/login';
    window.location.reload();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* TOP NAVBAR HEADER */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Left Logo Section & Single Pathways Navigation Tab */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            title="Open Menu"
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              cursor: 'pointer',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F172A'
            }}
          >
            <Menu size={20} />
          </button>

          {/* Logo only */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={MANTRA_LOGO_URL}
              alt="Mantra Care"
              style={{ height: '30px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </header>

      {/* SIDEBAR NAVIGATION DRAWER WITH USER PROFILE & SIGN OUT AT BOTTOM */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            transition: 'opacity 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              background: '#FFFFFF',
              boxShadow: '8px 0 30px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '18px 16px',
              position: 'relative'
            }}
          >
            {/* Sidebar Top Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={MANTRA_LOGO_URL}
                  alt="Mantra Care"
                  style={{ height: '24px', objectFit: 'contain' }}
                />
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <button
                onClick={() => { handleTabChange('lessons'); setIsSidebarOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'lessons' ? '#006FF5' : '#F8FAFC',
                  color: activeTab === 'lessons' ? '#FFFFFF' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={18} />
                  <span>User Pathways</span>
                </div>
                <ChevronRight size={16} opacity={0.6} />
              </button>

              {isSuperAdmin && (
                <button
                  onClick={() => { handleTabChange('users'); setIsSidebarOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'users' ? '#4F46E5' : '#EEF2FF',
                    color: activeTab === 'users' ? '#FFFFFF' : '#4F46E5',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={18} />
                    <span>Admin Management</span>
                  </div>
                  <ChevronRight size={16} opacity={0.6} />
                </button>
              )}
            </div>

            {/* USER PROFILE & SIGN OUT AT END OF SIDE MENU */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 4px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: isSuperAdmin ? '#EEF2FF' : '#F0F7FF', color: isSuperAdmin ? '#4F46E5' : '#006FF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', border: isSuperAdmin ? '1px solid #C7D2FE' : '1px solid #BAE6FD' }}>
                  {isSuperAdmin ? <Crown size={20} /> : <User size={20} />}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayAdmin?.name || 'Ketan Gulati'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                    {displayAdmin?.email || 'ketan.gulati@mantra.care'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isSuperAdmin ? '#4F46E5' : '#006FF5', background: isSuperAdmin ? '#EEF2FF' : '#F0F7FF', padding: '1px 6px', borderRadius: '4px', border: isSuperAdmin ? '1px solid #C7D2FE' : '1px solid #BAE6FD' }}>
                      {roleDisplay}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogoutAction}
                title="Sign Out"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #FECACA',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.15s ease'
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '28px 24px' }}>

        {/* TAB 1: PATHWAYS CATALOG */}
        {activeTab === 'lessons' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Catalog Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ margin: '0 0 4px', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  User Pathways ({filteredActivities.length})
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0, fontWeight: 500 }}>
                  Practical pathways and practical activities to guide your wellness journey
                </p>
              </div>

              {/* Service Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
                  <Filter size={14} /> Service:
                </span>
                {serviceOptions.map(svc => {
                  const isActive = selectedService === svc;
                  return (
                    <button
                      key={svc}
                      onClick={() => handleServiceSelect(svc)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        border: isActive ? '1px solid #006FF5' : '1px solid #CBD5E1',
                        background: isActive ? '#006FF5' : '#FFFFFF',
                        color: isActive ? '#FFFFFF' : '#475569',
                        fontWeight: isActive ? 800 : 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {svc === 'all' ? 'All Services' : svc.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input Bar */}
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search pathways by title or activity route..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 46px',
                  borderRadius: '14px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Pathways Grid / Empty State */}
            {filteredActivities.length === 0 ? (
              <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                <BookOpen size={48} color="#94A3B8" style={{ margin: '0 auto 16px auto', display: 'block' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>No User Pathways Found</h3>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>
                  {searchQuery ? `No pathways matching "${searchQuery}".` : 'No active pathways available for this service category.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filteredActivities.map((act) => (
                  <div
                    key={act.lessonId || act.route}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '20px',
                      border: '1px solid #E2E8F0',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      transition: 'transform 0.15s ease, boxShadow 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '999px', background: '#E0F2FE', color: '#006FF5', fontSize: '0.74rem', fontWeight: 800 }}>
                          +{act.rewardPoints || 10} PTS
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {act.estimatedDuration || '3 min'}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                        {act.title}
                      </h3>

                      {act.description && (
                        <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45 }}>
                          {act.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600, textTransform: 'capitalize' }}>
                        {Array.isArray(act.services) ? act.services.join(', ') : (act.services || 'all')}
                      </span>

                      <button
                        onClick={() => launchPathway(act)}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#006FF5',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(0, 111, 245, 0.25)'
                        }}
                      >
                        Start Pathway <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADMIN & USER MANAGEMENT */}
        {activeTab === 'users' && isSuperAdmin && (
          <UserAdminManagement currentUser={displayAdmin} />
        )}
      </main>
    </div>
  );
}
