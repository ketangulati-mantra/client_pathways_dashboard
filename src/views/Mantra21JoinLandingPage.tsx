import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Smartphone,
  Globe,
  Award,
  Flame,
  Users,
  Compass
} from 'lucide-react';
import {
  IOS_APP_URL,
  ANDROID_APP_URL,
  MANTRA21_WEB_URL,
  trackInviteEvent
} from '../config/mantra21ShareConfig';

interface Mantra21JoinLandingPageProps {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
}

export default function Mantra21JoinLandingPage({
  onNavigate,
  onBack
}: Mantra21JoinLandingPageProps) {
  const [inviterName, setInviterName] = useState<string>('Your friend');
  const [refToken, setRefToken] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const inviter = urlParams.get('inviter');
      const ref = urlParams.get('ref') || '';
      if (inviter) {
        setInviterName(decodeURIComponent(inviter));
      }
      if (ref) {
        setRefToken(ref);
      }
      trackInviteEvent('invite_opened', { ref, inviter });
    }
  }, []);

  const handleJoinWeb = () => {
    trackInviteEvent('invite_joined', { channel: 'web', ref: refToken });
    if (onNavigate) {
      onNavigate('/task/depression-mantra21-invitation');
    } else if (typeof window !== 'undefined') {
      window.location.href = MANTRA21_WEB_URL;
    }
  };

  const handleAppInstall = (platform: 'ios' | 'android') => {
    trackInviteEvent('invite_app_install', { platform, ref: refToken });
    const targetUrl = platform === 'ios' ? IOS_APP_URL : ANDROID_APP_URL;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#07080D',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(255, 87, 34, 0.22) 0%, transparent 60%),
          radial-gradient(circle at 100% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 0% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)
        `,
        color: '#F8FAFC',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(19, 23, 38, 0.7)',
          border: '1px solid rgba(255, 87, 34, 0.3)',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 87, 34, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Top Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 87, 34, 0.15)',
            border: '1px solid rgba(255, 87, 34, 0.4)',
            color: '#FF7A45',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}
        >
          <Sparkles size={12} />
          <span>YOU'VE BEEN INVITED</span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(26px, 6vw, 36px)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            color: '#FFFFFF',
            margin: '0 0 12px 0'
          }}
        >
          <span style={{ color: '#FF7A45' }}>{inviterName}</span> is taking on Mantra 21.
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: '#94A3B8',
            lineHeight: 1.5,
            margin: '0 0 24px 0'
          }}
        >
          21 days of small steps, practical experiences, and showing up for yourself.
        </p>

        {/* 3 Core Highlights */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            textAlign: 'left',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
            <Flame size={16} color="#FF7A45" />
            <span>~5–10 minutes a day at your own pace</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
            <Award size={16} color="#FFB020" />
            <span>Build a personalized toolkit you can keep</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
            <ShieldCheck size={16} color="#38BDF8" />
            <span>100% private responses, zero pressure</span>
          </div>
        </div>

        {/* Main CTA */}
        <button
          onClick={handleJoinWeb}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #FF5722 0%, #FF7A45 50%, #FFB020 100%)',
            border: 'none',
            borderRadius: '16px',
            padding: '18px 24px',
            color: '#FFFFFF',
            fontSize: '16.5px',
            fontWeight: 900,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 10px 30px rgba(255, 87, 34, 0.5)',
            marginBottom: '16px'
          }}
        >
          <span>JOIN MANTRA 21 →</span>
        </button>

        {/* App Acquisition Links */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: '8px' }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
            PREFER TO USE THE MOBILE APP?
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <button
              onClick={() => handleAppInstall('ios')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px 12px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Smartphone size={14} />
              <span>App Store</span>
            </button>

            <button
              onClick={() => handleAppInstall('android')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px 12px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Smartphone size={14} />
              <span>Google Play</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
