import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyCheckInHeader({
  currentStepIndex,
  totalSteps = 6,
  onBack,
  onClose,
  canGoBack = true
}) {
  return (
    <header
      style={{
        height: '56px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'rgba(13, 27, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        zIndex: 30,
        boxSizing: 'border-box'
      }}
    >
      {/* Left Back Button */}
      <div style={{ width: '40px', display: 'flex', alignItems: 'center' }}>
        {canGoBack && onBack ? (
          <motion.button
            type="button"
            onClick={onBack}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={16} strokeWidth={2.4} />
          </motion.button>
        ) : null}
      </div>

      {/* Center Refined Progress System */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <span
          style={{
            fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: '#ffffff',
            textTransform: 'uppercase'
          }}
        >
          Daily Check-In
        </span>

        {/* Minimal Segmented Progress */}
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <motion.div
                key={idx}
                animate={{
                  width: isCurrent ? '20px' : isCompleted ? '10px' : '6px',
                  opacity: isCurrent ? 1 : isCompleted ? 0.8 : 0.4,
                  background: isCurrent
                    ? '#38bdf8'
                    : isCompleted
                    ? '#ffffff'
                    : 'rgba(255, 255, 255, 0.3)'
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  height: '3.5px',
                  borderRadius: '9999px'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Right Close Button */}
      <div style={{ width: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        {onClose ? (
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.4} />
          </motion.button>
        ) : null}
      </div>
    </header>
  );
}
