import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sun, Sparkles } from 'lucide-react';
import { extractCheckInContext, getPersonalizedCoverPrompt } from '../../services/journalPersonalization';

export default function JournalIntroScreen({
  userName = null,
  latestCheckIn,
  hasCompletedCheckIn,
  onBack,
  onBeginWriting,
  onNavigateToCheckIn
}) {
  const shouldReduceMotion = useReducedMotion();
  const context = useMemo(() => extractCheckInContext(latestCheckIn, { completedToday: hasCompletedCheckIn }), [latestCheckIn, hasCompletedCheckIn]);
  const emotion = context?.emotion || latestCheckIn?.primary_emotion || null;

  // Dynamic emotional prompt enriched by check-in context
  const promptText = useMemo(() => {
    return getPersonalizedCoverPrompt(context);
  }, [context]);

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
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        @keyframes floatLeaves1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes floatLeaves2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes ambientSunPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.04); }
        }
        @keyframes driftClouds {
          0% { transform: translateX(0); }
          50% { transform: translateX(14px); }
          100% { transform: translateX(0); }
        }

        .journal-screen-wrapper {
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          padding: 16px 18px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          min-height: 100dvh;
          box-sizing: border-box;
          position: relative;
          z-index: 2;
        }

        /* Immersive Journal Cover */
        .journal-book-cover {
          width: 100%;
          border-radius: 28px;
          background: linear-gradient(165deg, #FBF9F4 0%, #F5EFEB 100%);
          border: 1px solid #ECE5D8;
          box-shadow: 
            0 20px 44px -14px rgba(28, 25, 23, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.02),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          padding: 38px 20px 34px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .journal-book-cover:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 26px 52px -14px rgba(28, 25, 23, 0.1),
            0 2px 6px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }

        .primary-begin-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0F172A;
          color: #FFFFFF;
          border: none;
          border-radius: 9999px;
          padding: 12px 28px;
          font-size: 0.92rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.16);
          cursor: pointer;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .primary-begin-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.22);
          background: #020617;
        }

        .primary-begin-btn:active {
          transform: scale(0.98);
        }

        /* Balanced Check-in Bridge Card */
        .checkin-bridge-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid #ECE7DF;
          border-radius: 20px;
          padding: 16px 18px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.015);
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-sizing: border-box;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .checkin-bridge-card:hover {
          transform: translateY(-1px);
          border-color: #CBD5E1;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
        }

        @media (min-width: 680px) {
          .journal-screen-wrapper {
            padding: 24px 28px 56px;
            gap: 24px;
          }
          .journal-book-cover {
            padding: 56px 44px 46px;
            border-radius: 32px;
          }
          .checkin-bridge-card {
            padding: 18px 22px;
          }
          .primary-begin-btn {
            padding: 13px 30px;
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
          height: '520px',
          background: 'radial-gradient(ellipse at 50% 15%, rgba(254, 243, 199, 0.45) 0%, rgba(240, 253, 250, 0.35) 45%, rgba(250, 247, 242, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      <div className="journal-screen-wrapper">
        {/* 1. TOP HEADER NAVIGATION */}
        <header
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2px 0 6px'
          }}
        >
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

          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#64748B',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            Your Journal
          </span>

          <div style={{ width: '38px' }} />
        </header>

        {/* 2. IMMERSIVE MAIN JOURNAL COVER */}
        <motion.div
          className="journal-book-cover"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          onClick={() => onBeginWriting(promptText)}
        >
          {/* Soft Atmospheric Sun Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-35px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(254, 215, 170, 0.5) 0%, rgba(254, 243, 199, 0.2) 55%, rgba(255, 255, 255, 0) 72%)',
              animation: shouldReduceMotion ? 'none' : 'ambientSunPulse 7s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          {/* Drifting Soft Cloud */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '8%',
              width: '70px',
              height: '18px',
              background: 'rgba(255, 255, 255, 0.55)',
              borderRadius: '9999px',
              filter: 'blur(2px)',
              animation: shouldReduceMotion ? 'none' : 'driftClouds 12s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          {/* Floating Organic Leaves */}
          <div
            style={{
              position: 'absolute',
              top: '16%',
              right: '12%',
              fontSize: '1.2rem',
              opacity: 0.4,
              animation: shouldReduceMotion ? 'none' : 'floatLeaves1 8s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: 0
            }}
          >
            🍃
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '20%',
              left: '10%',
              fontSize: '1.05rem',
              opacity: 0.35,
              animation: shouldReduceMotion ? 'none' : 'floatLeaves2 10s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: 0
            }}
          >
            🌿
          </div>

          {/* Editorial Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '480px'
            }}
          >
            {/* Title Hierarchy: Delicate "Your" + Bold Editorial "JOURNAL" */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(1.35rem, 3.2vw, 1.7rem)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: '#64748B',
                  letterSpacing: '0.02em'
                }}
              >
                {userName ? `${userName}'s` : 'Your'}
              </span>
              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(2.35rem, 6.2vw, 3.2rem)',
                  fontWeight: 600,
                  color: '#0F172A',
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  margin: 0,
                  lineHeight: 1
                }}
              >
                Journal
              </h1>
            </div>

            {/* Subtle Divider */}
            <div
              style={{
                width: '36px',
                height: '2px',
                background: 'rgba(15, 23, 42, 0.12)',
                borderRadius: '9999px',
                margin: '12px 0 16px'
              }}
            />

            {/* Intimate Reflection Prompt */}
            <h2
              style={{
                fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                fontSize: 'clamp(1.38rem, 4vw, 1.85rem)',
                fontWeight: 500,
                color: '#1E293B',
                lineHeight: 1.35,
                margin: '0 0 24px',
                letterSpacing: '-0.015em',
                maxWidth: '420px'
              }}
            >
              “{promptText}”
            </h2>

            {/* Refined Primary "Begin writing" CTA */}
            <motion.button
              type="button"
              className="primary-begin-btn"
              onClick={(e) => {
                e.stopPropagation();
                onBeginWriting(promptText);
              }}
            >
              <span>Begin writing</span>
              <ArrowRight size={15} strokeWidth={2.4} />
            </motion.button>
          </div>
        </motion.div>

        {/* 3. TODAY'S CHECK-IN BRIDGE (Refined Mobile-Friendly Layout) */}
        {hasCompletedCheckIn && emotion ? (
          /* State A: Already Checked In */
          <motion.div
            className="checkin-bridge-card"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onBeginWriting(promptText)}
            style={{
              background: 'rgba(237, 247, 246, 0.85)',
              borderColor: '#D5ECE9'
            }}
          >
            {/* Top Row: Tag & Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1px solid #D5ECE9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0F766E'
                  }}
                >
                  <Check size={11} strokeWidth={2.8} />
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#0F766E',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  TODAY'S CHECK-IN
                </span>
              </div>

              <span
                style={{
                  color: '#0F766E',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Reflect <ArrowRight size={13} strokeWidth={2.2} />
              </span>
            </div>

            {/* Bottom Row: Emotion Status */}
            <span style={{ fontSize: '0.94rem', fontWeight: 600, color: '#0F172A' }}>
              You're feeling <strong>{emotion}</strong> today
            </span>
          </motion.div>
        ) : (
          /* State B: Not Yet Checked In */
          <motion.div
            className="checkin-bridge-card"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={onNavigateToCheckIn}
          >
            {/* Top Row: Tag & Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#FAF3E8',
                    border: '1px solid #EFE2CE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#B45309'
                  }}
                >
                  <Sun size={12} strokeWidth={2.4} />
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#B45309',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  TODAY'S CHECK-IN
                </span>
              </div>

              <span
                style={{
                  color: '#0284C7',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Check in <ArrowRight size={13} strokeWidth={2.2} />
              </span>
            </div>

            {/* Bottom Content: Question & Subtext */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A' }}>
                How are you feeling right now?
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                A quick check-in can help guide your reflection.
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
