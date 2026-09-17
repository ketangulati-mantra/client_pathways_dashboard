import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function PhoneScene() {
  const [sendStatus, setSendStatus] = useState('sending'); // 'sending' -> 'sent'
  const [showThought, setShowThought] = useState(false);

  useEffect(() => {
    // 1. Sending -> Sent after 1.8s
    const timer1 = setTimeout(() => {
      setSendStatus('sent');
    }, 1800);

    // 2. Thought enters scene after 2.8s
    const timer2 = setTimeout(() => {
      setShowThought(true);
    }, 2800);

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
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px'
      }}
      aria-label="Smartphone on a desk showing a sent message: Hey, are we still meeting at 6?"
    >
      {/* Subtle Physical Surface (Desk / Table Mat) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          bottom: '-28px',
          width: '92%',
          height: '110px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(24, 43, 58, 0.12) 0%, rgba(24, 43, 58, 0.04) 50%, transparent 75%)',
          filter: 'blur(10px)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* Minor Ambient Surface Accent: Stylized Notebook edge */}
      <motion.div
        initial={{ opacity: 0, x: 20, rotate: 6 }}
        animate={{ opacity: 0.85, x: 0, rotate: 8 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          right: '-12px',
          bottom: '24px',
          width: '130px',
          height: '150px',
          backgroundColor: '#EAE1D5',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(24, 43, 58, 0.08)',
          border: '1px solid rgba(24, 43, 58, 0.08)',
          zIndex: 2,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px',
          boxSizing: 'border-box',
          gap: '8px'
        }}
      >
        <div style={{ width: '60%', height: '4px', backgroundColor: 'rgba(24, 43, 58, 0.15)', borderRadius: '2px' }} />
        <div style={{ width: '80%', height: '4px', backgroundColor: 'rgba(24, 43, 58, 0.1)', borderRadius: '2px' }} />
        <div style={{ width: '45%', height: '4px', backgroundColor: 'rgba(24, 43, 58, 0.1)', borderRadius: '2px' }} />
      </motion.div>

      {/* 2.5D Physical Stylized Smartphone */}
      <motion.div
        initial={{ opacity: 0, y: 36, rotateX: 12, rotateY: -8, rotateZ: 3 }}
        animate={{ opacity: 1, y: 0, rotateX: 8, rotateY: -6, rotateZ: 2 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ rotateX: 4, rotateY: -2, y: -4 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '300px',
          height: '460px',
          backgroundColor: '#FAF7F2',
          borderRadius: '38px',
          padding: '12px',
          boxSizing: 'border-box',
          boxShadow: `
            0 24px 48px -12px rgba(24, 43, 58, 0.22),
            0 12px 24px -6px rgba(24, 43, 58, 0.12),
            inset 0 1px 2px rgba(255, 255, 255, 0.9),
            inset 0 -2px 6px rgba(24, 43, 58, 0.08)
          `,
          border: '4px solid #EAE3D9',
          transformStyle: 'preserve-3d',
          zIndex: 5
        }}
      >
        {/* Subtle Coral Side Detail Accent */}
        <div
          style={{
            position: 'absolute',
            left: '-6px',
            top: '80px',
            width: '4px',
            height: '42px',
            borderRadius: '4px 0 0 4px',
            backgroundColor: '#D96F5C',
            boxShadow: '0 2px 6px rgba(217, 111, 92, 0.4)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-6px',
            top: '136px',
            width: '4px',
            height: '54px',
            borderRadius: '4px 0 0 4px',
            backgroundColor: '#D96F5C',
            boxShadow: '0 2px 6px rgba(217, 111, 92, 0.4)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '-6px',
            top: '104px',
            width: '4px',
            height: '60px',
            borderRadius: '0 4px 4px 0',
            backgroundColor: '#78919B'
          }}
        />

        {/* Inner Phone Screen Display */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '18px 16px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            border: '1px solid rgba(24, 43, 58, 0.06)',
            boxShadow: 'inset 0 2px 8px rgba(24, 43, 58, 0.03)'
          }}
        >
          {/* Top Phone Status & Speaker Notch */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 4px 14px 4px',
                borderBottom: '1px solid #F1EBE3'
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#182B3A' }}>
                9:41
              </span>
              {/* Speaker pill */}
              <div
                style={{
                  width: '42px',
                  height: '5px',
                  backgroundColor: '#E5DED4',
                  borderRadius: '999px'
                }}
              />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#78919B' }}>
                5G
              </span>
            </div>

            {/* Conversation Recipient Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '12px'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#EAE2D7',
                  color: '#182B3A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
              >
                M
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#182B3A', lineHeight: 1.2 }}>
                  Alex
                </span>
                <span style={{ fontSize: '0.68rem', color: '#78919B', fontWeight: 600 }}>
                  Active now
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
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  color: '#9EACB4',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                Today · 5:48 PM
              </span>
            </div>

            {/* Sent User Message Bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                alignSelf: 'flex-end',
                maxWidth: '85%',
                backgroundColor: '#182B3A',
                color: '#FFFFFF',
                borderRadius: '18px 18px 4px 18px',
                padding: '12px 16px',
                boxShadow: '0 6px 16px rgba(24, 43, 58, 0.16)',
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
                  lineHeight: 1.38,
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
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    SENDING...
                  </span>
                ) : (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      color: '#9BE3C1',
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

          {/* Bottom Chat Bar input placeholder */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#F8F5F0',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #ECE4DA'
            }}
          >
            <span style={{ fontSize: '0.74rem', color: '#9EACB4', fontWeight: 500 }}>
              Type a message...
            </span>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#D96F5C',
                opacity: 0.6
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Subtle Editorial Thought Annotation entering the scene */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{
          opacity: showThought ? 1 : 0,
          y: showThought ? 0 : 10,
          scale: showThought ? 1 : 0.95
        }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: '20px',
          left: '-20px',
          backgroundColor: '#FFFFFF',
          padding: '10px 18px',
          borderRadius: '16px 16px 16px 2px',
          boxShadow: '0 12px 32px rgba(24, 43, 58, 0.12), 0 2px 6px rgba(24, 43, 58, 0.04)',
          border: '1.5px solid #F1EBE3',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <span
          style={{
            fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
            fontSize: '0.86rem',
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#D96F5C',
            letterSpacing: '-0.01em'
          }}
        >
          “Did that sound weird?”
        </span>
      </motion.div>
    </div>
  );
}
