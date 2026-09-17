import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import SignalTrace from './SignalTrace';

export default function SignalScene() {
  const [sendStatus, setSendStatus] = useState('sending'); // 'sending' -> 'sent'
  const [signalActive, setSignalActive] = useState(false);
  const [showThought, setShowThought] = useState(false);

  useEffect(() => {
    // 1. Message status sends at 1.4s
    const timer1 = setTimeout(() => {
      setSendStatus('sent');
      setSignalActive(true);
    }, 1400);

    // 2. Subtle internal thought appears at 2.4s
    const timer2 = setTimeout(() => {
      setShowThought(true);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1400px'
      }}
      aria-label="Translucent acrylic smartphone floating in a cool digital environment"
    >
      {/* Cool Ambient Shadow / Reflection Layer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          bottom: '-24px',
          width: '88%',
          height: '90px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(49, 85, 255, 0.14) 0%, rgba(139, 135, 255, 0.05) 45%, transparent 70%)',
          filter: 'blur(12px)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* Signal Transmission Trace Animation */}
      <SignalTrace active={signalActive} />

      {/* Cool Translucent / Acrylic Smartphone */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96, rotateX: 10, rotateY: -10, rotateZ: 2 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 6, rotateY: -7, rotateZ: 1.5 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ rotateX: 2, rotateY: -3, y: -6 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '310px',
          height: '470px',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          borderRadius: '38px',
          padding: '10px',
          boxSizing: 'border-box',
          boxShadow: `
            0 28px 60px -12px rgba(17, 24, 39, 0.16),
            0 14px 28px -6px rgba(49, 85, 255, 0.08),
            inset 0 1px 2px rgba(255, 255, 255, 1),
            inset 0 -2px 6px rgba(49, 85, 255, 0.04)
          `,
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          transformStyle: 'preserve-3d',
          zIndex: 5
        }}
      >
        {/* Subtle Dark Charcoal Rim & Cobalt Edge Accent */}
        <div
          style={{
            position: 'absolute',
            left: '-4px',
            top: '84px',
            width: '3.5px',
            height: '46px',
            borderRadius: '4px 0 0 4px',
            backgroundColor: '#3155FF',
            boxShadow: '0 0 10px rgba(49, 85, 255, 0.5)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-4px',
            top: '142px',
            width: '3.5px',
            height: '56px',
            borderRadius: '4px 0 0 4px',
            backgroundColor: '#8B87FF'
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-4px',
            top: '110px',
            width: '3.5px',
            height: '62px',
            borderRadius: '0 4px 4px 0',
            backgroundColor: '#111827'
          }}
        />

        {/* High-Precision Glass Screen Display */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '18px 16px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            border: '1px solid rgba(220, 234, 243, 0.8)',
            boxShadow: 'inset 0 2px 10px rgba(238, 245, 250, 0.6)'
          }}
        >
          {/* Top Status Bar with Dynamic Indicator */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 4px 14px 4px',
                borderBottom: '1px solid #EEF5FA'
              }}
            >
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#111827' }}>
                9:41
              </span>
              {/* Ultra-clean Dynamic Speaker Capsule */}
              <div
                style={{
                  width: '52px',
                  height: '6px',
                  backgroundColor: '#111827',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '4px'
                }}
              >
                <div
                  style={{
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    backgroundColor: '#3155FF'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#3155FF' }}>
                  5G
                </span>
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#D9E85B',
                    boxShadow: '0 0 6px rgba(217, 232, 91, 0.8)'
                  }}
                />
              </div>
            </div>

            {/* Conversation Recipient Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '14px'
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3155FF 0%, #8B87FF 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: '0 3px 10px rgba(49, 85, 255, 0.25)'
                }}
              >
                A
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                  Alex
                </span>
                <span style={{ fontSize: '0.68rem', color: '#3155FF', fontWeight: 700 }}>
                  Signal Active
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '12px 0',
              flex: 1,
              justifyContent: 'flex-end'
            }}
          >
            {/* Timestamp Divider */}
            <div style={{ textAlign: 'center', margin: '4px 0' }}>
              <span
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  color: '#8B87FF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                Today · 5:48 PM
              </span>
            </div>

            {/* User Message Bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                alignSelf: 'flex-end',
                maxWidth: '88%',
                backgroundColor: '#111827',
                color: '#FFFFFF',
                borderRadius: '18px 18px 4px 18px',
                padding: '13px 16px',
                boxShadow: '0 8px 24px rgba(17, 24, 39, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  letterSpacing: '-0.01em'
                }}
              >
                Hey, are we still meeting at 6?
              </p>

              {/* Status Indicator: SENDING... -> SENT ✓ */}
              <div
                style={{
                  alignSelf: 'flex-end',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em'
                }}
              >
                {sendStatus === 'sending' ? (
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    SENDING...
                  </span>
                ) : (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      color: '#D9E85B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <span>SENT</span>
                    <Check size={11} strokeWidth={3} />
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom Chat Bar placeholder */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#EEF5FA',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #DCEAF3'
            }}
          >
            <span style={{ fontSize: '0.74rem', color: '#8B87FF', fontWeight: 600 }}>
              Message transmitted
            </span>
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#3155FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ width: '6px', height: '6px', backgroundColor: '#FFFFFF', borderRadius: '50%' }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Internal Thought Fragment (No Comic Bubble) */}
      <motion.div
        initial={{ opacity: 0, x: -16, y: 10 }}
        animate={{
          opacity: showThought ? 1 : 0,
          x: showThought ? 0 : -16,
          y: showThought ? 0 : 10
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: '32px',
          left: '-24px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 16px 36px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(139, 135, 255, 0.25)',
          zIndex: 10,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <span
          style={{
            fontSize: '0.62rem',
            fontFamily: "'Inter', monospace",
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#8B87FF'
          }}
        >
          INTERNAL THOUGHT
        </span>
        <span
          style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.02em',
            borderBottom: '2px solid #8B87FF',
            paddingBottom: '2px'
          }}
        >
          Did that sound weird?
        </span>
      </motion.div>
    </div>
  );
}
