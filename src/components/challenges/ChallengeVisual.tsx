import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export interface ResponsiveCropConfig {
  desktopObjectPosition: string;
  tabletObjectPosition: string;
  mobileObjectPosition: string;
}

export interface ChallengeArtworkConfig {
  coverImage?: string;
  coverImageMobile?: string;
  crop: ResponsiveCropConfig;
  bgGradient: string;
  accentColor: string;
  badge: 'LIVE' | 'COMING SOON';
}

export const CLEAN_MANTRA_21_COVER = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1789476883/7b3a608d-4b8e-4d39-94e6-18821d25e8eb_apjy3r.png';

export const CHALLENGE_ARTWORK_REGISTRY: Record<string, ChallengeArtworkConfig> = {
  mantra_21: {
    coverImage: CLEAN_MANTRA_21_COVER,
    crop: {
      // Landscape: Open panoramic sunrise on left, woman seated on right
      desktopObjectPosition: 'center center',
      tabletObjectPosition: '65% center',
      // Mobile: Centered focal sunrise and seated woman
      mobileObjectPosition: '70% center'
    },
    bgGradient: 'radial-gradient(130% 130% at 85% 15%, #1E1B4B 0%, #0C1322 55%, #050811 100%)',
    accentColor: '#38BDF8',
    badge: 'LIVE'
  },
  morning_calm_7: {
    crop: {
      desktopObjectPosition: 'center center',
      tabletObjectPosition: 'center center',
      mobileObjectPosition: 'center center'
    },
    bgGradient: 'radial-gradient(130% 130% at 80% 20%, #0E3B43 0%, #082026 50%, #030D11 100%)',
    accentColor: '#2DD4BF',
    badge: 'COMING SOON'
  },
  sleep_reset_14: {
    crop: {
      desktopObjectPosition: 'center center',
      tabletObjectPosition: 'center center',
      mobileObjectPosition: 'center center'
    },
    bgGradient: 'radial-gradient(130% 130% at 80% 20%, #171E38 0%, #0E1222 50%, #05070E 100%)',
    accentColor: '#818CF8',
    badge: 'COMING SOON'
  }
};

export const DEFAULT_ARTWORK_CONFIG: ChallengeArtworkConfig = {
  crop: {
    desktopObjectPosition: 'center center',
    tabletObjectPosition: 'center center',
    mobileObjectPosition: 'center center'
  },
  bgGradient: 'radial-gradient(130% 130% at 80% 20%, #1E293B 0%, #0F172A 50%, #050811 100%)',
  accentColor: '#38BDF8',
  badge: 'COMING SOON'
};

export function getArtworkConfig(challengeId?: string): ChallengeArtworkConfig {
  if (!challengeId) return DEFAULT_ARTWORK_CONFIG;
  return CHALLENGE_ARTWORK_REGISTRY[challengeId] || DEFAULT_ARTWORK_CONFIG;
}

export function getThemeForChallenge(challengeId?: string) {
  const art = getArtworkConfig(challengeId);
  return {
    bg: art.bgGradient,
    accent: art.accentColor,
    badge: art.badge,
    imageUrl: art.coverImage,
    pattern: art.bgGradient
  };
}

export interface ChallengeVisualProps {
  challengeId?: string;
  variant?: 'hero' | 'card' | 'modal';
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * ChallengeVisual
 * Pure artwork presentation layer. Contains zero duplicated UI typography.
 */
export const ChallengeVisual: React.FC<ChallengeVisualProps> = ({
  challengeId,
  variant = 'card',
  height = '100%',
  borderRadius = '24px',
  style,
  children
}) => {
  const config = getArtworkConfig(challengeId);
  const hasArtwork = Boolean(config.coverImage);

  return (
    <div
      style={{
        position: 'relative',
        height,
        width: '100%',
        borderRadius,
        background: config.bgGradient,
        overflow: 'hidden',
        boxShadow: variant === 'hero'
          ? '0 24px 50px -15px rgba(5, 8, 17, 0.45)'
          : '0 12px 28px -10px rgba(5, 8, 17, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: variant === 'hero' ? 'clamp(20px, 4vw, 36px)' : (hasArtwork ? 0 : '18px'),
        boxSizing: 'border-box',
        ...style
      }}
    >
      {/* ─── FULL-BLEED PURE ARTWORK (100% CLEAN - NO TEXT) ─── */}
      {hasArtwork ? (
        <>
          <picture style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
            {config.coverImageMobile && (
              <source media="(max-width: 640px)" srcSet={config.coverImageMobile} />
            )}
            <img
              src={config.coverImage}
              alt="Challenge Cover"
              className={`challenge-cover-art challenge-art-${challengeId}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: config.crop.desktopObjectPosition,
                imageRendering: '-webkit-optimize-contrast',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            />
          </picture>

          {/* ─── CARD MODE CINEMATIC DARK OVERLAY ─── */}
          {variant === 'card' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, rgba(5, 8, 17, 0.12) 0%, rgba(5, 8, 17, 0.22) 50%, rgba(5, 8, 17, 0.42) 100%)',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
          )}

          {/* ─── CINEMATIC READING SURFACE GRADIENT (HERO ONLY) ─── */}
          {variant === 'hero' && (
            <>
              {/* Desktop & Tablet: Smooth left-to-right reading surface */}
              <div
                className="hero-gradient-desktop"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(5, 8, 17, 0.94) 0%, rgba(5, 8, 17, 0.78) 35%, rgba(5, 8, 17, 0.35) 65%, rgba(5, 8, 17, 0.15) 100%)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />

              {/* Mobile: Smooth bottom-up reading surface */}
              <div
                className="hero-gradient-mobile"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(180deg, rgba(5, 8, 17, 0.1) 0%, rgba(5, 8, 17, 0.5) 45%, rgba(5, 8, 17, 0.95) 100%)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
            </>
          )}
        </>
      ) : (
        /* ─── ABSTRACT CANVAS FOR UPCOMING CHALLENGES ─── */
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 80% 25%, rgba(56, 189, 248, 0.12) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '12%',
              right: '8%',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        </>
      )}

      {/* ─── FOREGROUND CONTENT LAYER ─── */}
      {children && (
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
          {children}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .challenge-art-${challengeId} {
            object-position: ${config.crop.mobileObjectPosition} !important;
          }
          .hero-gradient-desktop {
            display: none !important;
          }
          .hero-gradient-mobile {
            display: block !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .challenge-art-${challengeId} {
            object-position: ${config.crop.tabletObjectPosition} !important;
          }
          .hero-gradient-desktop {
            display: block !important;
          }
          .hero-gradient-mobile {
            display: none !important;
          }
        }
        @media (min-width: 1025px) {
          .challenge-art-${challengeId} {
            object-position: ${config.crop.desktopObjectPosition} !important;
          }
          .hero-gradient-desktop {
            display: block !important;
          }
          .hero-gradient-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ChallengeVisual;
