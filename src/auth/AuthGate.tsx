import React, { useEffect, useState, type ReactNode } from 'react';
import { handleExit } from '../mantra/navigation';
import AdminLoginPage from '../views/AdminLoginPage';

type HandshakeState = 'pending' | 'authenticated' | 'failed';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [state, setState] = useState<HandshakeState>('pending');

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const params = new URLSearchParams(window.location.search);
    let token = params.get('token');

    // 1. Activity / Task URLs are open to non-logged-in end users (e.g. /#/task/* or /#/meal-plans)
    const isActivityRoute = hash.includes('/task/') || hash.includes('/meal-plans') || path.includes('/task/') || path.includes('/meal-plans');
    if (isActivityRoute) {
      setState('authenticated');
      return;
    }

    if (!token && hash.includes('token=')) {
      const queryIdx = hash.indexOf('?');
      if (queryIdx !== -1) {
        const hashParams = new URLSearchParams(hash.slice(queryIdx));
        token = hashParams.get('token');
      }
    }

    // 1. Process optional token handshake if provided in URL
    if (token) {
      fetch('https://api.mantracare.com/user/user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Handshake failed: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const userId = data.user_id || data.id || data.data?.user_id;
          if (userId) {
            sessionStorage.setItem('user_id', String(userId));
            if (data) sessionStorage.setItem('user_info', JSON.stringify(data));
          }

          const cleanParams = new URLSearchParams(window.location.search);
          cleanParams.delete('token');
          const cleanSearch = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
          const cleanUrl = window.location.pathname + cleanSearch + window.location.hash;
          window.history.replaceState({}, '', cleanUrl);
          setState('authenticated');
        })
        .catch(() => {
          // Continue loading activity page even if optional token handshake fails
          setState('authenticated');
        });
      return;
    }

    // 2. Check if user is authenticated via sessionStorage
    const existingUserId = sessionStorage.getItem('user_id') || sessionStorage.getItem('admin_user');
    if (existingUserId) {
      setState('authenticated');
      return;
    }

    // 3. Check for explicit user_id, userId, uid, or upa_id URL query parameters
    const directUserId = params.get('user_id') || params.get('userId') || params.get('uid') || params.get('upa_id');
    if (directUserId) {
      sessionStorage.setItem('user_id', directUserId);
      setState('authenticated');
      return;
    }

    // 4. Require authentication via Auth Screen (AdminLoginPage)
    setState('failed');
  }, []);

  if (state === 'failed') {
    return <AdminLoginPage />;
  }

  if (state !== 'authenticated') {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}

function FullScreenLoader() {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '100vh',
        width: '100vw',
        background: '#f8fafc',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        color: '#0f172a'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}
        />
        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
          Loading your session…
        </div>
        <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
          Verifying security handshake
        </div>
      </div>
    </div>
  );
}
