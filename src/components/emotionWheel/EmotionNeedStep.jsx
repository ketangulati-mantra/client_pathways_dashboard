import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

export default function EmotionNeedStep({
  emotion,
  family,
  config,
  selectedNeeds = [],
  onToggleNeed,
  onContinue
}) {
  const themeColor = family?.color || '#38bdf8';
  const parentFamilyName = family?.name || 'Feeling';
  const emotionName = emotion?.name || 'This feeling';

  const isContinueEnabled = selectedNeeds.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '100%',
        maxWidth: '640px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 auto',
        padding: '16px 8px 48px'
      }}
    >
      {/* 1. HERO EMOTION IDENTITY */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.06, duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '28px'
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: '4px'
          }}
        >
          {parentFamilyName}
        </span>
        <h1
          style={{
            fontSize: 'clamp(36px, 7vw, 52px)',
            fontWeight: '900',
            color: themeColor,
            letterSpacing: '-0.02em',
            margin: '0 0 10px 0',
            lineHeight: 1.1,
            textShadow: `0 0 32px ${themeColor}40`
          }}
        >
          {emotionName}
        </h1>
        <div
          style={{
            width: '40px',
            height: '2px',
            borderRadius: '2px',
            background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
            marginBottom: '16px'
          }}
        />
        <h2
          style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: '800',
            color: '#ffffff',
            lineHeight: 1.25,
            margin: '0 0 10px 0',
            letterSpacing: '-0.01em'
          }}
        >
          {config?.needPrompt || 'What might help right now?'}
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.72)',
            lineHeight: 1.5,
            maxWidth: '500px',
            margin: 0
          }}
        >
          {config?.needSubtitle || 'Sometimes the first step isn’t fixing the feeling, it is giving it somewhere safe to go.'}
        </p>
      </motion.div>

      {/* 2. INSTRUCTION HINT */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 4px',
          marginBottom: '16px'
        }}
      >
        <span style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.55)', fontWeight: '500' }}>
          Choose anything that would feel supportive
        </span>
      </div>

      {/* 3. OPEN CONVERSATIONAL SUPPORT CHOICES */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '36px'
        }}
      >
        {(config?.needOptions || []).map((item, idx) => {
          const isSelected = selectedNeeds.includes(item.label);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + idx * 0.03 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onToggleNeed(item.label)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '18px 20px',
                borderRadius: '18px',
                background: isSelected
                  ? `linear-gradient(90deg, ${themeColor}22 0%, rgba(255, 255, 255, 0.04) 100%)`
                  : 'rgba(255, 255, 255, 0.025)',
                borderLeft: isSelected ? `3px solid ${themeColor}` : '3px solid transparent',
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.88)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? `0 4px 24px ${themeColor}18` : 'none',
                boxSizing: 'border-box'
              }}
            >
              {/* Organic glowing pulse indicator */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isSelected ? themeColor : 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'all 0.25s ease',
                  boxShadow: isSelected ? `0 0 12px ${themeColor}80` : 'none'
                }}
              >
                {isSelected && <Check size={14} color="#0a0f1d" strokeWidth={3} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '16.5px',
                    fontWeight: isSelected ? '700' : '500',
                    color: '#ffffff',
                    display: 'block',
                    lineHeight: 1.4,
                    marginBottom: item.suggestedActionHint ? '3px' : '0'
                  }}
                >
                  {item.label}
                </span>
                {item.suggestedActionHint && (
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.65)',
                      lineHeight: 1.45,
                      display: 'block'
                    }}
                  >
                    {item.suggestedActionHint}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 4. WARM ACTION BUTTON */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        disabled={!isContinueEnabled}
        style={{
          background: isContinueEnabled
            ? `linear-gradient(135deg, ${themeColor} 0%, #2563eb 100%)`
            : 'rgba(255, 255, 255, 0.08)',
          color: isContinueEnabled ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
          border: 'none',
          borderRadius: '16px',
          padding: '16px 36px',
          fontSize: '16.5px',
          fontWeight: '700',
          cursor: isContinueEnabled ? 'pointer' : 'not-allowed',
          width: '100%',
          maxWidth: '380px',
          boxShadow: isContinueEnabled ? `0 8px 28px ${themeColor}35` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.25s ease'
        }}
      >
        <span>View My Emotional Snapshot</span>
        <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  );
}
