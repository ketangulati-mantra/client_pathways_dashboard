import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, Menu, Clock, ArrowRight, Filter, X, ChevronRight, LogOut, ShieldCheck, CheckCircle2, UserCheck } from 'lucide-react';
import UserAdminManagement from '../components/admin/UserAdminManagement';
import { activities as mantraActivities, getCurrentService, setServiceContext, preserveQueryParams, SUPPORTED_SERVICES, normalizeService } from '../mantra';
import { useAuth } from '../auth/AuthContext';

const MANTRA_LOGO_URL = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg';

export default function DeveloperLessonsPage({ onNavigate }) {
  const { admin: currentAdmin, logout } = useAuth();
  
  const storedAdminJson = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_user') : null;
  let storedAdmin = null;
  try {
    storedAdmin = storedAdminJson ? JSON.parse(storedAdminJson) : null;
  } catch (e) {
    storedAdmin = null;
  }
  const displayAdmin = currentAdmin || storedAdmin || {
    name: 'Ketan Gulati',
    email: (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('user_id')) || 'ketan.gulati@mantra.care',
    role: 'super_admin'
  };

  const isSuperAdmin = displayAdmin?.role === 'super_admin' || displayAdmin?.role === 'Super Admin' || displayAdmin?.role === 'superadmin';

  const [selectedService, setSelectedService] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = (window.location.hash || '').toLowerCase();
      if (hash.includes('users') || hash.includes('management') || hash.includes('admin')) return 'users';
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
    
    // 1. Check service match
    const normSelected = normalizeService(selectedService);
    const matchesService = 
      selectedService === 'all' || 
      normSelected === 'all' ||
      actServices.includes('*') || 
      actServices.some(s => normalizeService(s) === normSelected) || 
      (act.service && normalizeService(act.service) === normSelected);

    // 2. Check search query match
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      act.title?.toLowerCase().includes(query) ||
      act.lessonId?.toLowerCase().includes(query) ||
      act.route?.toLowerCase().includes(query);

    return matchesService && matchesSearch;
  });

  const launchPathway = (act) => {
    if (act.services && act.services.length > 0 && act.services[0] !== '*') {
      setServiceContext(act.services[0]);
    }
    const targetRoute = act.route || `/task/${act.lessonId}`;
    if (onNavigate) {
      onNavigate(targetRoute);
    } else {
      window.location.hash = `#${targetRoute}`;
    }
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
        {/* Left Logo Section & Navigation Tabs */}
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
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={MANTRA_LOGO_URL} 
              alt="Mantra Care" 
              style={{ height: '30px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#006FF5', background: '#E0F2FE', padding: '2px 8px', borderRadius: '6px' }}>
              PATHWAYS
            </span>
          </div>

          {/* MAIN TABS BAR */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
            <button
              onClick={() => handleTabChange('lessons')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'lessons' ? '#006FF5' : 'transparent',
                color: activeTab === 'lessons' ? '#FFFFFF' : '#475569',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <BookOpen size={16} /> Pathways
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => handleTabChange('users')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'users' ? '#4F46E5' : 'transparent',
                  color: activeTab === 'users' ? '#FFFFFF' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShieldCheck size={16} /> Admin Management
              </button>
            )}
          </nav>
        </div>

        {/* Right User Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
              {displayAdmin?.name || 'Ketan Gulati'}
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#006FF5', background: '#F0F7FF', padding: '1px 6px', borderRadius: '4px' }}>
              {isSuperAdmin ? 'SUPER ADMIN' : 'USER'}
            </span>
          </div>

          <button
            onClick={async () => {
              await logout();
              window.location.href = '#/admin/login';
            }}
            title="Sign Out"
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#64748B',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </header>

      {/* SIDEBAR NAVIGATION DRAWER */}
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
              width: '260px',
              maxWidth: '85vw',
              height: '100%',
              background: '#FFFFFF',
              boxShadow: '8px 0 30px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '18px 16px',
              gap: '16px',
              position: 'relative'
            }}
          >
            {/* Sidebar Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
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

            {/* Nav Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 6px 4px' }}>
                Dashboard Navigation
              </div>

              <button
                onClick={() => { handleTabChange('lessons'); setIsSidebarOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'lessons' ? '#006FF5' : '#F8FAFC',
                  color: activeTab === 'lessons' ? '#FFFFFF' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} />
                  <span>User Pathways</span>
                </div>
                <ChevronRight size={14} opacity={0.6} />
              </button>

              {isSuperAdmin && (
                <button
                  onClick={() => { handleTabChange('users'); setIsSidebarOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'users' ? '#4F46E5' : '#EEF2FF',
                    color: activeTab === 'users' ? '#FFFFFF' : '#4F46E5',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} />
                    <span>Admin Management</span>
                  </div>
                  <ChevronRight size={14} opacity={0.6} />
                </button>
              )}
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

            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search pathways by title or activity route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  borderRadius: '14px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              />
            </div>

            {/* Pathways Catalog Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {filteredActivities.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 16px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', color: '#64748B' }}>
                  <BookOpen size={32} style={{ margin: '0 auto 12px auto', color: '#94A3B8' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>No Pathways Found</div>
                  <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>No pathways match service <strong>"{selectedService}"</strong> and search <strong>"{searchQuery}"</strong></div>
                </div>
              ) : (
                filteredActivities.map(act => (
                  <div
                    key={act.lessonId || act.route}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '20px',
                      border: '1px solid #E2E8F0',
                      padding: '22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#006FF5', background: '#E0F2FE', padding: '3px 10px', borderRadius: '6px' }}>
                          +{act.rewardPoints || 10} PTS
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <Clock size={13} /> {act.estimatedDuration || '3 min'}
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.35 }}>
                        {act.title}
                      </h3>

                      <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5, fontWeight: 500 }}>
                        {act.description || 'Interactive pathway module to help you build your wellness skills.'}
                      </p>
                    </div>

                    <div style={{ paddingTop: '14px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'capitalize', fontWeight: 600 }}>
                        {Array.isArray(act.services) ? act.services.join(', ') : (act.services || 'All')}
                      </span>

                      <button
                        onClick={() => launchPathway(act)}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #006FF5 0%, #0056C6 100%)',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(0, 111, 245, 0.25)'
                        }}
                      >
                        Start Pathway <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN MANAGEMENT (SUPER ADMIN ONLY) */}
        {activeTab === 'users' && isSuperAdmin && (
          <UserAdminManagement currentUser={displayAdmin} />
        )}

      </main>
    </div>
  );
}
