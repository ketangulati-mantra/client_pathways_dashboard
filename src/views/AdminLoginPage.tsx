import React, { useState, useEffect } from 'react';
import { User, AlertCircle, Loader2, Eye, EyeOff, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const MANTRA_CARE_LOGO_URL = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1786010770/MantraCareLogo_jjuy1c.png';

export default function AdminLoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to pathways dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.hash = '#/admin/pathways';
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        sessionStorage.setItem('user_id', email.trim());
        sessionStorage.setItem('admin_user', JSON.stringify({
          email: email.trim(),
          name: email.split('@')[0],
          role: email.includes('admin') || email.includes('ketan') ? 'super_admin' : 'user'
        }));
        window.location.hash = '#/admin/pathways';
        window.location.reload();
      } else {
        setErrorMessage(result.error || 'Invalid email address or password.');
      }
    } catch (err) {
      console.error('[AdminLoginPage] Login error:', err);
      setErrorMessage('Unable to connect to authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(180deg, #FAFCFF 0%, #F0F7FF 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        boxSizing: 'border-box'
      }}
    >
      {/* TOP HEADER */}
      <header
        style={{
          height: '64px',
          padding: '0 32px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={MANTRA_CARE_LOGO_URL}
            alt="MantraCare"
            style={{ height: '34px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#006FF5', background: '#E0F2FE', padding: '2px 8px', borderRadius: '6px' }}>
            USER PATHWAYS
          </span>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
          Secure Authentication
        </div>
      </header>

      {/* CENTERED LOGIN CONTAINER */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '380px',
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid rgba(0, 111, 245, 0.15)',
            padding: '36px 32px',
            boxShadow: '0 16px 40px -10px rgba(0, 111, 245, 0.12)',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          {/* ICON BADGE */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: '#F0F7FF',
              color: '#006FF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 12px rgba(0, 111, 245, 0.15)'
            }}
          >
            <ShieldCheck size={24} />
          </div>

          {/* TITLE & SUBTITLE */}
          <h1
            style={{
              margin: '0 0 8px 0',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em'
            }}
          >
            Sign in to User Pathways
          </h1>

          <p
            style={{
              margin: '0 0 24px 0',
              fontSize: '0.86rem',
              color: '#64748B',
              lineHeight: 1.5,
              fontWeight: 500
            }}
          >
            Log in to continue your personal wellness journey and manage your pathway activities.
          </p>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
                textAlign: 'left',
                boxSizing: 'border-box'
              }}
            >
              <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="xyz@mantra.care"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease'
                }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    color: '#0F172A',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #006FF5 0%, #0056C6 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '6px',
                boxShadow: '0 8px 20px -4px rgba(0, 111, 245, 0.35)',
                transition: 'opacity 0.15s ease',
                opacity: isSubmitting ? 0.8 : 1
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
