import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, PenTool, Sun, Sparkles, BookOpen } from 'lucide-react';
import { getUserJournalEntries } from '../../services/journalService';
import { getActiveUserId } from '../../services/authService';

const SETUP_OPTIONS = [
  {
    id: 'free_write',
    emoji: '✍️',
    title: 'Write Freely',
    description: 'Put your thoughts into words, without any structure.',
    accentColor: '#0F766E',
    bgColor: '#EDF7F6',
    borderColor: '#D5ECE9'
  },
  {
    id: 'reflect_today',
    emoji: '☀️',
    title: 'Reflect on Today',
    description: 'Look back on your experiences, thoughts and feelings from today.',
    accentColor: '#B45309',
    bgColor: '#FAF3E8',
    borderColor: '#EFE2CE'
  },
  {
    id: 'guided_prompt',
    emoji: '✨',
    title: 'Guided Reflection',
    description: 'Start with a thoughtful prompt and explore what comes up.',
    accentColor: '#7C3AED',
    bgColor: '#F5F1FA',
    borderColor: '#E8E0F2'
  }
];

export default function JournalSetupScreen({
  onBack,
  onSelectOption,
  onViewHistory,
  latestCheckIn,
  hasCompletedCheckIn
}) {
  const shouldReduceMotion = useReducedMotion();
  const userId = getActiveUserId();
  const emotion = latestCheckIn?.primary_emotion || null;

  const [savedCount, setSavedCount] = useState(0);

  // Check if user has saved journal entries
  useEffect(() => {
    let isMounted = true;
    async function checkEntries() {
      try {
        const entries = await getUserJournalEntries(userId, 5);
        if (isMounted && Array.isArray(entries)) {
          setSavedCount(entries.length);
        }
      } catch {}
    }
    checkEntries();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        background: '#FAF7F2',
        color: '#1E293B',
        fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        .journal-setup-container {
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: 16px 20px 60px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 26px;
        }

        .setup-option-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 22px;
          border-radius: 20px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          box-sizing: border-box;
          gap: 16px;
        }

        .setup-option-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
        }

        .history-bridge-card {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #EBE5DB;
          border-radius: 18px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          box-sizing: border-box;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.015);
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .history-bridge-card:hover {
          transform: translateY(-1px);
          border-color: #CBD5E1;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
        }

        @media (min-width: 680px) {
          .journal-setup-container {
            padding: 28px 28px 72px;
            gap: 30px;
          }
          .setup-option-card {
            padding: 24px 26px;
          }
          .history-bridge-card {
            padding: 18px 22px;
          }
        }
      `}</style>

      {/* Atmospheric Soft Light Ambient Wash */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '760px',
          height: '400px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(243, 238, 228, 0.9) 0%, rgba(250, 247, 242, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="journal-setup-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header Bar */}
        <header style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <motion.button
              type="button"
              onClick={onBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Back"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E6E1D8',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
                outline: 'none'
              }}
            >
              <ArrowLeft size={18} strokeWidth={2.2} />
            </motion.button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              JOURNAL
            </span>

            <h1
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: 'clamp(2.1rem, 5.5vw, 2.75rem)',
                fontWeight: 600,
                color: '#0F172A',
                margin: 0,
                lineHeight: 1.15,
                letterSpacing: '-0.025em'
              }}
            >
              How would you like to reflect?
            </h1>

            <p style={{ fontSize: '0.94rem', color: '#64748B', margin: '2px 0 0', lineHeight: 1.5 }}>
              Choose what feels right for you today.
            </p>
          </div>
        </header>

        {/* Check-in Context Banner if available */}
        {hasCompletedCheckIn && emotion && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 118, 110, 0.06)',
              border: '1px solid rgba(15, 118, 110, 0.14)',
              borderRadius: '14px',
              padding: '8px 14px',
              fontSize: '0.84rem',
              color: '#0F766E'
            }}
          >
            <span style={{ fontSize: '1rem' }}>🫧</span>
            <span>Today you've checked in feeling <strong>{emotion}</strong></span>
          </div>
        )}

        {/* Three Reflection Option Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {SETUP_OPTIONS.map((opt) => (
            <motion.div
              key={opt.id}
              className="setup-option-card"
              style={{
                background: opt.bgColor,
                border: `1px solid ${opt.borderColor}`
              }}
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)' }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onSelectOption(opt.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{opt.emoji}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                    {opt.title}
                  </span>
                  <span style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.45 }}>
                    {opt.id === 'reflect_today' && hasCompletedCheckIn && emotion
                      ? `Explore what shaped feeling ${emotion.toLowerCase()} today.`
                      : opt.description}
                  </span>
                </div>
              </div>

              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: opt.accentColor,
                  flexShrink: 0,
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)'
                }}
              >
                <ArrowRight size={16} strokeWidth={2.4} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary History Bridge (Only shown if user has saved reflections) */}
        {savedCount > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              YOUR JOURNAL
            </span>

            <motion.div
              className="history-bridge-card"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={onViewHistory}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.94rem', fontWeight: 600, color: '#0F172A' }}>
                  Your reflections
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Revisit your thoughts and reflections.
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#0284C7',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                <span>View all</span>
                <ArrowRight size={14} strokeWidth={2.2} />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
