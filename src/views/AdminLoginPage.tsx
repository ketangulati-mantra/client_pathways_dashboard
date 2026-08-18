import React, { useState } from 'react';
import { User, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const MANTRA_CARE_LOGO_URL = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1786010770/MantraCareLogo_jjuy1c.png';

export default function AdminLoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to /admin/pathways
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.hash = '#/admin/pathways';
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

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
      setErrorMessage(result.error || 'Invalid email or password.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
        boxSizing: 'border-box'
      }}
    >
      {/* TOP HEADER */}
      <header
        style={{
          height: '60px',
          padding: '0 32px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          background: '#ffffff'
        }}
      >
        <img
          src={MANTRA_CARE_LOGO_URL}
          alt="MantraCare"
          style={{ height: '34px', objectFit: 'contain' }}
        />
      </header>

      {/* CENTERED LOGIN CONTAINER */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '320px',
            textAlign: 'center'
          }}
        >
          {/* TITLE & SUBTITLE */}
          <h1
            style={{
              margin: '0 0 6px 0',
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.02em'
            }}
          >
            Log in to your account
          </h1>

          <p
            style={{
              margin: '0 0 20px 0',
              fontSize: '0.8rem',
              color: '#64748b',
              lineHeight: 1.4
            }}
          >
            Log in to continue your therapy journey towards a happier, healthier you.
          </p>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                textAlign: 'left',
                boxSizing: 'border-box'
              }}
            >
              <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM WITH PASSWORD FIELD */}
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              required
              placeholder="ketan.gulati@mantra.care"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #dbeafe',
                background: '#eff6ff',
                fontSize: '0.86rem',
                outline: 'none',
                color: '#1e293b',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 14px',
                  borderRadius: '6px',
                  border: '1px solid #dbeafe',
                  background: '#eff6ff',
                  fontSize: '0.86rem',
                  outline: 'none',
                  color: '#1e293b',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
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

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '6px',
                border: 'none',
                background: '#4f46e5',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '6px',
                boxShadow: '0 3px 10px rgba(79, 70, 229, 0.2)',
                transition: 'background 0.15s ease',
                opacity: isSubmitting ? 0.75 : 1
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <User size={14} color="#ffffff" />
              </div>
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
