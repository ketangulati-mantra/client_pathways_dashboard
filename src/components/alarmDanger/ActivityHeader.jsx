import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { handleExit } from '../../mantra/navigation';

const OCDMANTRA_LOGO_URL =
  'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

export default function ActivityHeader({ onBack, onNavigate, stepText = '3 / 5' }) {
  return (
    <header
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 30,
        boxSizing: 'border-box'
      }}
    >
      {/* Left: Back button */}
      <button
        type="button"
        onClick={() => handleExit(onBack, onNavigate)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#182B3A',
          fontSize: '0.88rem',
          fontWeight: 700,
          cursor: 'pointer',
          padding: '8px 14px',
          borderRadius: '999px',
          backgroundColor: 'rgba(24, 43, 58, 0.05)',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(24, 43, 58, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(24, 43, 58, 0.05)';
        }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Center: Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img
          src={OCDMANTRA_LOGO_URL}
          alt="OCDMantra"
          style={{
            height: 'clamp(26px, 3.5vw, 32px)',
            width: 'auto',
            objectFit: 'contain'
          }}
        />
        <span
          style={{
            fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '-0.02em',
            color: '#182B3A'
          }}
        >
          OCDMantra
        </span>
      </div>

      {/* Right: Understated Step Progress (3 / 5) */}
      <div
        style={{
          minWidth: '60px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#78919B',
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {stepText}
        </span>
      </div>
    </header>
  );
}
