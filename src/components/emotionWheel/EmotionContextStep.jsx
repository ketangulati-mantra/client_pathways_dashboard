import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Plus, ChevronUp } from 'lucide-react';

export default function EmotionContextStep({
  emotion,
  family,
  config,
  selectedContexts = [],
  freeText = '',
  onToggleContext,
  onChangeFreeText,
  onContinue
}) {
  const [isJournalOpen, setIsJournalOpen] = useState(Boolean(freeText && freeText.trim().length > 0));

  const themeColor = family?.color || '#38bdf8';
  const parentFamilyName = family?.name || 'Feeling';
  const emotionName = emotion?.name || 'This feeling';

  const notSureLabel = config?.notSureOption?.label || 'Not sure yet';
  const isNotSureSelected = selectedContexts.includes(notSureLabel);

  const handleSelectOption = (label) => {
    if (label === notSureLabel) {
      if (isNotSureSelected) {
        onToggleContext(notSureLabel);
      } else {
        selectedContexts.forEach((c) => {
          if (c !== notSureLabel) onToggleContext(c);
        });
        onToggleContext(notSureLabel);
      }
    } else {
      if (isNotSureSelected) {
        onToggleContext(notSureLabel);
      }
      onToggleContext(label);
    }
  };

  const isContinueEnabled =
    selectedContexts.length > 0 || isNotSureSelected || (freeText && freeText.trim().length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '100%',
        maxWidth: '580px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 auto',
        padding: '12px 12px 40px',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. EMOTION HERO & PROMPT */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '28px',
          width: '100%'
        }}
      >
        <span
          style={{
            fontSize: '12.5px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.45)',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: '4px'
          }}
        >
          {parentFamilyName}
        </span>

        <h1
          style={{
            fontSize: 'clamp(38px, 8vw, 54px)',
            fontWeight: '900',
            color: themeColor,
            letterSpacing: '-0.03em',
            margin: '0 0 12px 0',
            lineHeight: 1.05,
            textShadow: `0 0 35px ${themeColor}45`
          }}
        >
          {emotionName}
        </h1>

        <h2
          style={{
            fontSize: 'clamp(20px, 4.5vw, 26px)',
            fontWeight: '700',
            color: '#ffffff',
            lineHeight: 1.25,
            margin: '0 0 6px 0',
            letterSpacing: '-0.01em'
          }}
        >
          {config?.prompt || 'What might be behind this feeling?'}
        </h2>

        <p
          style={{
            fontSize: '14.5px',
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: 1.4,
            margin: 0
          }}
        >
          {config?.subtitle || 'Choose what feels closest.'}
        </p>
      </div>

      {/* 2. LARGE VISUAL EMOTIONAL CHOICES (Responsive 1-col mobile, 2-col desktop) */}
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {(config?.contextOptions || []).map((item, idx) => {
          const isSelected = selectedContexts.includes(item.label);
          return (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectOption(item.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                borderRadius: '20px',
                background: isSelected
                  ? `linear-gradient(135deg, ${themeColor}28 0%, rgba(255, 255, 255, 0.05) 100%)`
                  : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? `1.5px solid ${themeColor}` : '1px solid rgba(255, 255, 255, 0.07)',
                color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.88)',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isSelected ? `0 6px 24px ${themeColor}22` : 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: isSelected ? '700' : '500',
                  lineHeight: 1.35,
                  flex: 1,
                  paddingRight: '10px'
                }}
              >
                {item.label}
              </span>

              {/* Minimal Check Indicator */}
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: isSelected ? themeColor : 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
              >
                {isSelected && <Check size={12} color="#070c14" strokeWidth={3.5} />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* 3. NOT SURE YET (Simple text link) */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => handleSelectOption(notSureLabel)}
          style={{
            background: isNotSureSelected ? `${themeColor}20` : 'transparent',
            border: isNotSureSelected ? `1px solid ${themeColor}60` : 'none',
            borderRadius: '9999px',
            padding: '6px 16px',
            color: isNotSureSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
            fontSize: '13.5px',
            fontWeight: isNotSureSelected ? '700' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textDecoration: isNotSureSelected ? 'none' : 'underline',
            textUnderlineOffset: '3px'
          }}
        >
          {notSureLabel}
        </button>
      </div>

      {/* 4. OPTIONAL WORDS (Secondary progressive disclosure) */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '32px'
        }}
      >
        {!isJournalOpen ? (
          <button
            type="button"
            onClick={() => setIsJournalOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={14} color={themeColor} />
            <span>Add a few words</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ width: '100%' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                padding: '0 4px'
              }}
            >
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)', fontWeight: '600' }}>
                Your own words
              </span>
              <button
                type="button"
                onClick={() => setIsJournalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ChevronUp size={13} />
                <span>Hide</span>
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="Something happened..."
              value={freeText}
              onChange={(e) => onChangeFreeText(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '14px 16px',
                color: '#ffffff',
                fontSize: '15px',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = themeColor;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            />
          </motion.div>
        )}
      </div>

      {/* 5. CONTINUE ACTION BUTTON */}
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
          borderRadius: '9999px',
          padding: '15px 36px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: isContinueEnabled ? 'pointer' : 'not-allowed',
          width: '100%',
          maxWidth: '340px',
          boxShadow: isContinueEnabled ? `0 8px 24px ${themeColor}35` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.25s ease'
        }}
      >
        <span>Continue</span>
        <ArrowRight size={17} />
      </motion.button>
    </motion.div>
  );
}
