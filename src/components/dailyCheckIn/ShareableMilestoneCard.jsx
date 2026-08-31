import React from 'react';
import { Flame } from 'lucide-react';
import { getMilestoneDetails } from './milestoneConfig';

export default React.forwardRef(function ShareableMilestoneCard(
  { milestoneNumber = 7, achievedAt, isExporting = false },
  ref
) {
  const config = getMilestoneDetails(milestoneNumber);
  const { shareHeadline, shareSubtitle, closing, theme } = config;

  const dateObj = achievedAt ? new Date(achievedAt) : new Date();
  const dateStr = dateObj.toLocaleDateString([], { month: 'long', year: 'numeric' });

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        maxWidth: '340px',
        aspectRatio: '9 / 16',
        maxHeight: '600px',
        background: '#0B1522',
        borderRadius: '24px',
        border: '1.5px solid rgba(245, 158, 11, 0.3)',
        boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(249, 115, 22, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(22px, 4vh, 32px) clamp(20px, 4.5vw, 28px)',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif'
      }}
    >
      {/* Background Flame Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 32%, rgba(249, 115, 22, 0.28) 0%, rgba(245, 158, 11, 0.08) 45%, rgba(11, 21, 34, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-15%',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(249, 115, 22, 0.35)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* 1. Header: Official Mantra Logo on Clean White Background */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          borderRadius: '9999px',
          padding: '6px 16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 255, 255, 0.2)'
        }}
      >
        <img
          src="https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg"
          alt="Mantra"
          style={{
            height: '16px',
            width: 'auto',
            display: 'block',
            objectFit: 'contain'
          }}
          crossOrigin="anonymous"
        />
      </div>

      {/* 2. Visual Centerpiece: Huge Glowing Fire Flame & Streak Number */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '160px',
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto 0'
        }}
      >
        {/* Soft Ambient Halo */}
        <div
          style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.5) 0%, rgba(245, 158, 11, 0.15) 55%, transparent 75%)',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }}
        />

        {/* Outer Warm Border Ring */}
        <div
          style={{
            position: 'absolute',
            inset: '-8px',
            borderRadius: '50%',
            border: '2px solid rgba(251, 191, 36, 0.45)',
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)'
          }}
        />

        {/* Inner Flame Sphere */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fde047 0%, #f97316 55%, #ea580c 100%)',
            border: '2px solid rgba(255, 255, 255, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 32px -4px rgba(249, 115, 22, 0.7), 0 0 25px rgba(251, 191, 36, 0.6), inset 0 2px 6px rgba(255, 255, 255, 0.6)'
          }}
        >
          <Flame size={36} fill="#ffffff" strokeWidth={1.2} color="#ffffff" />
          <span
            style={{
              fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
              fontSize: milestoneNumber >= 100 ? '1.85rem' : '2.25rem',
              fontWeight: 800,
              fontStyle: 'italic',
              color: '#ffffff',
              lineHeight: 1,
              marginTop: '2px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            {milestoneNumber}
          </span>
        </div>
      </div>

      {/* 3. Main Headline & Affirmation */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '8px',
          width: '100%'
        }}
      >
        <h3
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.5rem, 5.2vw, 1.85rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#f8fafc',
            margin: 0,
            lineHeight: 1.22
          }}
        >
          {shareHeadline || `${milestoneNumber} Day Check-In Streak`}
        </h3>

        <p
          style={{
            fontSize: 'clamp(0.88rem, 2.9vw, 0.94rem)',
            color: '#fed7aa',
            margin: 0,
            fontWeight: 500,
            lineHeight: 1.5
          }}
        >
          {shareSubtitle || `I've made time for myself for ${milestoneNumber} days in a row.`}
        </p>

        <span
          style={{
            fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            color: '#cbd5e1',
            marginTop: '2px'
          }}
        >
          {closing || 'One moment at a time.'}
        </span>
      </div>

      {/* 4. Footer: Date & Subtitle */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.74rem',
          color: '#94a3b8',
          fontWeight: 600
        }}
      >
        <span>{dateStr}</span>
        <span>Daily Check-In</span>
      </div>
    </div>
  );
});
