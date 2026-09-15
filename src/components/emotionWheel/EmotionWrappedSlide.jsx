import React from 'react';
import { motion } from 'framer-motion';

/**
 * EmotionWrappedSlide: Renders an individual 9:16 Instagram Story slide.
 * Uses bold editorial typography, atmospheric ambient glows, and zero UI chrome.
 */
export default React.forwardRef(function EmotionWrappedSlide(
  { slide, family, emotion, index = 0, total = 6 },
  ref
) {
  const themeColor = family?.color || '#38bdf8';

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        maxWidth: '340px',
        aspectRatio: '9 / 16',
        maxHeight: '600px',
        background: '#06090f',
        borderRadius: '28px',
        boxShadow: `0 32px 80px -16px rgba(0, 0, 0, 0.95), 0 0 45px ${themeColor}18`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(32px, 5.5vh, 44px) clamp(22px, 5.5vw, 30px)',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* 1. Atmospheric Ambient Glow Effects */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: themeColor,
          filter: 'blur(80px)',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          right: '-10%',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: themeColor,
          filter: 'blur(90px)',
          opacity: 0.18,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Subtle Grain Texture Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* 2. Top Header / Story Tagline */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%'
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.55)',
            textTransform: 'uppercase',
            letterSpacing: '0.22em'
          }}
        >
          {slide.tagline || 'MY EMOTION WRAPPED'}
        </span>
        <div
          style={{
            width: '20px',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
            marginTop: '10px'
          }}
        />
      </div>

      {/* 3. Slide Center Content (Based on Slide Type) */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          margin: 'auto 0',
          width: '100%'
        }}
      >
        {/* SLIDE 1: HOOK */}
        {slide.type === 'hook' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '32px', color: themeColor, marginBottom: '16px' }}>
              ✦
            </span>
            <h1
              style={{
                fontSize: 'clamp(38px, 9vw, 48px)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                margin: '0 0 12px 0',
                textShadow: `0 0 35px ${themeColor}60`
              }}
            >
              {slide.heroTitle}
            </h1>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: themeColor,
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}
            >
              {slide.subTitle}
            </span>
          </div>
        )}

        {/* SLIDE 2: FEELING & INTENSITY */}
        {slide.type === 'feeling' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <span
              style={{
                fontSize: 'clamp(32px, 8vw, 42px)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                textShadow: `0 0 30px ${themeColor}50`
              }}
            >
              {slide.heroTitle}
            </span>
            <span
              style={{
                fontSize: '26px',
                letterSpacing: '6px',
                color: themeColor,
                marginBottom: '12px'
              }}
            >
              {slide.subTitle}
            </span>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '16px'
              }}
            >
              {slide.accentText}
            </span>
            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.85)',
                margin: 0,
                lineHeight: 1.45,
                maxWidth: '260px'
              }}
            >
              {slide.quoteText}
            </p>
          </div>
        )}

        {/* SLIDE 3: WHAT WAS BEHIND IT */}
        {slide.type === 'context' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <h2
              style={{
                fontSize: 'clamp(20px, 5vw, 24px)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                margin: '0 0 24px 0'
              }}
            >
              {slide.heroTitle}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              {(slide.bullets || []).map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '12px',
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: themeColor }}>
                    {b.num}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'rgba(255, 255, 255, 0.92)',
                      letterSpacing: '0.02em',
                      lineHeight: 1.3
                    }}
                  >
                    {b.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 4: WHAT YOU MIGHT NEED */}
        {slide.type === 'need' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              WHAT YOU NEEDED
            </span>
            <h2
              style={{
                fontSize: 'clamp(28px, 7vw, 36px)',
                fontWeight: 900,
                color: themeColor,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                margin: '0 0 16px 0',
                textShadow: `0 0 35px ${themeColor}60`
              }}
            >
              {slide.heroTitle}
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
                lineHeight: 1.5,
                maxWidth: '260px'
              }}
            >
              {slide.quoteText}
            </p>
          </div>
        )}

        {/* SLIDE 5: PERSONAL INSIGHT */}
        {slide.type === 'insight' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <h2
              style={{
                fontSize: 'clamp(20px, 5.2vw, 24px)',
                fontWeight: 800,
                color: themeColor,
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                margin: '0 0 16px 0'
              }}
            >
              {slide.heroTitle}
            </h2>
            <p
              style={{
                fontSize: 'clamp(15px, 4vw, 17px)',
                fontWeight: 500,
                color: '#f8fafc',
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: 'pre-line',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.6)'
              }}
            >
              {slide.quoteText}
            </p>
          </div>
        )}

        {/* SLIDE 6: CLOSING / VIRAL HOOK */}
        {slide.type === 'closing' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: '32px', color: themeColor, marginBottom: '14px' }}>
              ✦
            </span>
            <h2
              style={{
                fontSize: 'clamp(22px, 5.5vw, 28px)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                margin: '0 0 12px 0'
              }}
            >
              {slide.heroTitle}
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.75)',
                margin: '0 0 20px 0',
                lineHeight: 1.45
              }}
            >
              {slide.subTitle}
            </p>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '9999px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.04em'
              }}
            >
              Explore yours →
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer Branding */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: '4px'
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.75)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}
        >
          TherapyMantra
        </span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.35)',
            letterSpacing: '0.04em'
          }}
        >
          therapymantra.co
        </span>
      </div>
    </div>
  );
});
