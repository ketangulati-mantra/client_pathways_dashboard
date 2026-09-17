import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { handleExit } from '../../mantra/navigation';

const OCDMANTRA_LOGO_URL =
  'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

export default function AlarmHeader({ onBack, onNavigate }) {
  return (
    <header
      style={{
        width: '100%',
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 30,
        boxSizing: 'border-box'
      }}
    >
      {/* Left: Precise Back Navigation */}
      <button
        type="button"
        onClick={() => handleExit(onBack, onNavigate)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: '#111827',
          fontSize: '0.88rem',
          fontWeight: 600,
          cursor: 'pointer',
          padding: '6px 12px',
          borderRadius: '8px',
          transition: 'background-color 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#DCEAF3';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <ArrowLeft size={16} strokeWidth={2.2} />
        <span>Back</span>
      </button>

      {/* Center: Real OCDMantra Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={OCDMANTRA_LOGO_URL}
          alt="OCDMantra"
          style={{
            height: 'clamp(26px, 3.5vw, 32px)',
            width: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Right: Step Indicator */}
      <div style={{ minWidth: '70px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: '0.86rem',
            fontWeight: 700,
            color: '#78919B',
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          3 / 5
        </span>
      </div>
    </header>
  );
}
