import React from 'react';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireSuperAdmin = false }) => {
  const { admin, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#ffffff',
          fontFamily: "'Outfit', 'Inter', sans-serif"
        }}
      >
        <Loader2 size={36} color="#38bdf8" style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94a3b8' }}>
          Verifying Admin Credentials...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to admin login
    window.location.href = '#/admin/login';
    return null;
  }

  if (requireSuperAdmin && admin?.role !== 'super_admin' && admin?.role !== 'Super Admin') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626', margin: '0 0 8px 0' }}>Access Denied</h2>
        <p style={{ color: '#64748b', margin: '0 0 20px 0' }}>Super Admin privileges are required to view this section.</p>
        <button onClick={() => { window.location.href = '#/admin/dashboard'; }} style={{ padding: '10px 20px', borderRadius: '10px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export const AdminRoute = ProtectedRoute;
