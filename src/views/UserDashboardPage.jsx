import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Filter, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  Layers, 
  Trophy, 
  Activity as ActivityIcon,
  LogOut
} from 'lucide-react';
import { 
  activities as allActivities, 
  getCurrentService, 
  setServiceContext, 
  SUPPORTED_SERVICES, 
  normalizeService,
  goToLesson 
} from '../mantra';
import { useAuth } from '../auth/AuthContext';
import SubmissionsTable from '../components/SubmissionsTable';

export default function UserDashboardPage({ onNavigate }) {
  const { admin, logout } = useAuth();
  const [selectedService, setSelectedService] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pathways'); // 'pathways' | 'submissions'

  useEffect(() => {
    const serviceFromUrl = getCurrentService();
    if (serviceFromUrl) {
      setSelectedService(normalizeService(serviceFromUrl));
    }
  }, []);

  const handleServiceFilter = (service) => {
    setSelectedService(service);
    setServiceContext(service);
  };

  const filteredActivities = allActivities.filter((act) => {
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.lessonId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedService === 'all' || selectedService === '*') {
      return matchesSearch;
    }

    const matchesService = act.services.includes('*') || 
                           act.services.map(s => normalizeService(s)).includes(selectedService);
    return matchesSearch && matchesService;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        padding: '14px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg"
            alt="Mantra Logo"
            style={{ height: '28px' }}
          />
          <span style={{
            background: '#e0f2fe',
            color: '#0284c7',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.05em'
          }}>
            USER PATHWAYS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
            <button
              onClick={() => setActiveTab('pathways')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'pathways' ? '#ffffff' : 'transparent',
                color: activeTab === 'pathways' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'pathways' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Pathways Directory
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'submissions' ? '#ffffff' : 'transparent',
                color: activeTab === 'submissions' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'submissions' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Submissions Admin
            </button>
          </div>

          {admin && (
            <button
              onClick={() => logout()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1040px', margin: '0 auto', width: '100%', padding: '28px 20px 60px' }}>
        {activeTab === 'submissions' ? (
          <SubmissionsTable />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Hero Header */}
            <div style={{
              background: 'linear-gradient(135deg, #009fe3 0%, #005387 100%)',
              borderRadius: '20px',
              padding: '32px 28px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'var(--shadow-premium)'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800, width: 'fit-content' }}>
                <Sparkles size={14} />
                <span>MANTRA CARE FOUNDATION</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
                Mantra User Pathways
              </h1>
              <p style={{ fontSize: '0.95rem', opacity: 0.9, maxWidth: '640px', lineHeight: 1.6, margin: 0 }}>
                Technical foundation and pathway runner for personalized health, mindfulness, and wellness activities.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['all', 'wellness', 'mental_health', 'therapy', 'yoga', 'diet', 'fitness'].map((srv) => (
                  <button
                    key={srv}
                    onClick={() => handleServiceFilter(srv)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      border: '1px solid',
                      borderColor: selectedService === srv ? '#2563eb' : '#e2e8f0',
                      background: selectedService === srv ? '#2563eb' : '#ffffff',
                      color: selectedService === srv ? '#ffffff' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {srv.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="text"
                  placeholder="Search pathways..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 14px 9px 36px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Activities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {filteredActivities.map((activity) => (
                <div
                  key={activity.lessonId}
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate(activity.route);
                    } else {
                      goToLesson(activity.route);
                    }
                  }}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {activity.services.join(', ')}
                      </span>
                      <span style={{
                        background: '#fef3c7',
                        color: '#b45309',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        +{activity.rewardPoints} pts
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
                      {activity.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {activity.estimatedDuration}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 700 }}>
                      Start <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
