import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  Menu
} from 'lucide-react';
import { Challenge } from '../../services/challengeService';
import { ChallengeVisual, getThemeForChallenge } from './ChallengeVisual';

const MANTRA_LOGO_URL = 'https://res.cloudinary.com/hxbamdqf/image/upload/v1785828110/therapymantraIcon_kie5d3.png';

interface ChallengeCatalogueViewProps {
  challenges: Challenge[];
  onEnroll: (challengeId: string) => Promise<void>;
  isEnrolling: boolean;
  enrollmentError?: string;
  onNavigateToDetail?: (challenge: Challenge) => void;
}

export default function ChallengeCatalogueView({
  challenges,
  onEnroll,
  isEnrolling,
  enrollmentError
}: ChallengeCatalogueViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);
  const [activeDetailChallenge, setActiveDetailChallenge] = useState<Challenge | null>(null);
  const [isHeroHovered, setIsHeroHovered] = useState<boolean>(false);

  const mainRailRef = useRef<HTMLDivElement>(null);
  const categoryRailRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Mental Wellness', 'Daily Grounding', 'Rest & Recovery'];

  const filteredChallenges = selectedCategory === 'All'
    ? challenges
    : challenges.filter((c) => c.category.toLowerCase() === selectedCategory.toLowerCase());

  const heroItems = challenges.length > 0 ? challenges : [];
  const currentHero = heroItems[activeHeroIndex] || heroItems[0] || null;
  const currentHeroTheme = currentHero ? getThemeForChallenge(currentHero.id) : getThemeForChallenge();

  const nextHero = () => {
    setActiveHeroIndex((prev) => (prev + 1) % Math.max(1, heroItems.length));
  };

  const prevHero = () => {
    setActiveHeroIndex((prev) => (prev - 1 + heroItems.length) % Math.max(1, heroItems.length));
  };

  // 3-second Auto-advancing Carousel Timer (works continuously on desktop and mobile)
  useEffect(() => {
    if (heroItems.length <= 1 || activeDetailChallenge) return;

    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroItems.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [heroItems.length, activeDetailChallenge]);

  const scrollMainRail = (direction: 'left' | 'right') => {
    if (mainRailRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      mainRailRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        background: '#FFFFFF',
        color: '#090D16',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        position: 'relative',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        paddingBottom: '100px'
      }}
    >
      {/* ─── 1. REAL THERAPYMANTRA BRAND HEADER ─── */}
      <header
        style={{
          width: '100%',
          borderBottom: '1px solid #F1F5F9',
          background: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          paddingTop: 'env(safe-area-inset-top, 0px)'
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Exact TherapyMantra Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={MANTRA_LOGO_URL}
              alt="TherapyMantra"
              style={{ height: '38px', width: 'auto', maxHeight: '42px', objectFit: 'contain' }}
            />
          </div>

        
        </div>
      </header>

      {/* ─── 2. EDITORIAL DISCOVERY TITLE ─── */}
      <section
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '24px 20px 16px 20px'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.18em',
            color: '#64748B',
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}
        >
          MANTRA EXPERIENCES
        </div>
        <h1
          style={{
            fontSize: 'clamp(26px, 6vw, 36px)',
            fontWeight: 950,
            color: '#090D16',
            letterSpacing: '-0.03em',
            margin: 0,
            lineHeight: 1.15
          }}
        >
          Find something<br className="sm:hidden" /> worth showing up for.
        </h1>
      </section>

      {/* ─── 3. PURPOSE-BUILT MOBILE & DESKTOP HERO (FULL-BLEED CINEMATIC ARTWORK) ─── */}
      {currentHero && (
        <section
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '8px 20px 24px 20px'
          }}
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div
            onClick={() => {
              if (currentHero.id === 'mantra_21') {
                setActiveDetailChallenge(currentHero);
              }
            }}
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              minHeight: 'clamp(230px, 32vw, 420px)',
              cursor: currentHero.id === 'mantra_21' ? 'pointer' : 'default'
            }}
          >
            <ChallengeVisual
              challengeId={currentHero.id}
              variant="hero"
              height="clamp(230px, 32vw, 420px)"
              borderRadius="20px"
            >
              {/* Top Carousel Navigation & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  {currentHero.id === 'mantra_21' ? (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(34, 197, 94, 0.16)',
                        border: '1.5px solid rgba(34, 197, 94, 0.45)',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)'
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#22C55E',
                          boxShadow: '0 0 10px #22C55E',
                          display: 'inline-block',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                      />
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 900,
                          letterSpacing: '0.14em',
                          color: '#4ADE80',
                          textTransform: 'uppercase'
                        }}
                      >
                        LIVE NOW
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: '1.5px solid rgba(255, 255, 255, 0.22)',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        backdropFilter: 'blur(12px)'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 900,
                          letterSpacing: '0.14em',
                          color: 'rgba(255, 255, 255, 0.9)',
                          textTransform: 'uppercase'
                        }}
                      >
                        COMING SOON
                      </span>
                    </div>
                  )}
                </div>

                {heroItems.length > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(9, 13, 22, 0.45)',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={prevHero}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.75)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.08em' }}>
                      {String(activeHeroIndex + 1).padStart(2, '0')}/{String(heroItems.length).padStart(2, '0')}
                    </span>
                    <button
                      onClick={nextHero}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.75)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Hero Content positioned over the gradient */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHero.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  style={{ maxWidth: '580px', marginTop: 'auto', paddingTop: '16px' }}
                >
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    FEATURED EXPERIENCE • {currentHero.category}
                  </div>

                  <h2
                    style={{
                      fontSize: 'clamp(22px, 4vw, 40px)',
                      fontWeight: 950,
                      color: '#FFFFFF',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.1,
                      margin: '0 0 6px 0',
                      textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}
                  >
                    {currentHero.name}
                  </h2>

                  <p
                    style={{
                      fontSize: 'clamp(12.5px, 1.6vw, 15px)',
                      color: 'rgba(255, 255, 255, 0.85)',
                      margin: '0 0 12px 0',
                      lineHeight: 1.4,
                      maxWidth: '460px',
                      textShadow: '0 1px 6px rgba(0,0,0,0.4)'
                    }}
                  >
                    {currentHero.tagline || currentHero.description}
                  </p>

                  {/* Action row with metadata & centered CTA button */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.9)', fontSize: '11.5px', fontWeight: 700 }}>
                      <span>{currentHero.durationDays} DAYS</span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
                      <span>~{currentHero.dailyTimeMinutes} MIN / DAY</span>
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: '#38BDF8',
                        color: '#090D16',
                        padding: '7px 16px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 900,
                        letterSpacing: '0.03em',
                        boxShadow: '0 6px 16px -3px rgba(56, 189, 248, 0.5)'
                      }}
                    >
                      <span>EXPLORE CHALLENGE</span>
                      <ArrowRight size={13} color="#090D16" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </ChallengeVisual>
          </div>
        </section>
      )}

      {/* ─── 4. SWIPEABLE CATEGORY RAIL (LEFT ALIGNED) ─── */}
      <section
        style={{
          width: '100%',
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '12px 20px 24px 20px',
          boxSizing: 'border-box'
        }}
      >
        <div
          ref={categoryRailRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '4px'
          }}
        >
          <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.14em', color: '#94A3B8', textTransform: 'uppercase', marginRight: '4px', flexShrink: 0 }}>
            EXPLORE
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 15px',
                  borderRadius: '9999px',
                  background: isSelected ? '#090D16' : '#F8FAFC',
                  border: isSelected ? '1px solid #090D16' : '1px solid #E2E8F0',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── 5. CURATED EXPERIENCES (LARGE HORIZONTAL SWIPE RAIL WITH NEXT PEEK) ─── */}
      <section
        style={{
          width: '100%',
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '8px 20px 40px 20px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 900, color: '#090D16', letterSpacing: '-0.025em', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Curated Experiences
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Built around tiny, non-judgmental daily anchors.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={() => scrollMainRail('left')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#090D16',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollMainRail('right')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#090D16',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Swipeable Horizontal Rail: Mobile = 82vw for Intentional Peek */}
        <div
          ref={mainRailRef}
          style={{
            display: 'flex',
            gap: '18px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingBottom: '12px'
          }}
        >
          {filteredChallenges.map((item) => {
            const theme = getThemeForChallenge(item.id);
            const isLive = item.id === 'mantra_21';

            return (
              <motion.div
                key={item.id}
                whileTap={isLive ? { scale: 0.98 } : undefined}
                onClick={() => {
                  if (isLive) {
                    setActiveDetailChallenge(item);
                  }
                }}
                style={{
                  flex: '0 0 clamp(280px, 82vw, 360px)',
                  scrollSnapAlign: 'start',
                  cursor: isLive ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxSizing: 'border-box'
                }}
              >
                {/* Visual Canvas Area with seamless 16:9 aspect ratio */}
                <ChallengeVisual
                  challengeId={item.id}
                  variant="card"
                  height="auto"
                  borderRadius="20px"
                  style={{
                    aspectRatio: '16 / 9',
                    width: '100%'
                  }}
                >
                  {!theme.imageUrl && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.14em',
                            color: theme.accent,
                            textTransform: 'uppercase'
                          }}
                        >
                          {theme.badge}
                        </span>
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)', fontWeight: 700 }}>
                          {item.durationDays}D
                        </span>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
                          ~{item.dailyTimeMinutes} MIN / DAY
                        </div>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <ArrowRight size={13} color="#FFFFFF" />
                        </div>
                      </div>
                    </>
                  )}
                </ChallengeVisual>

                {/* Direct Typography Content */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {item.id === 'mantra_21' ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'rgba(34, 197, 94, 0.12)',
                          color: '#16A34A',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          fontSize: '11px',
                          fontWeight: 900,
                          letterSpacing: '0.12em',
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          textTransform: 'uppercase'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                        LIVE NOW
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#F1F5F9',
                          color: '#64748B',
                          border: '1px solid #E2E8F0',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.12em',
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          textTransform: 'uppercase'
                        }}
                      >
                        COMING SOON
                      </span>
                    )}
                    <span style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 600 }}>
                      {item.durationDays} Days
                    </span>
                  </div>

                  <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#090D16', margin: '0 0 3px 0', letterSpacing: '-0.02em' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    {item.tagline || item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── 6. DETAIL MODAL & ENROLLMENT FLOW ─── */}
      <AnimatePresence>
        {activeDetailChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(9, 13, 22, 0.82)',
              backdropFilter: 'blur(12px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxSizing: 'border-box'
            }}
            onClick={() => setActiveDetailChallenge(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '560px',
                maxHeight: '90vh',
                background: '#FFFFFF',
                borderRadius: '26px',
                overflow: 'hidden',
                boxShadow: '0 30px 60px -20px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Modal Art Canvas Header */}
              <div style={{ position: 'relative', height: '190px', width: '100%' }}>
                <ChallengeVisual
                  challengeId={activeDetailChallenge.id}
                  variant="card"
                  height="190px"
                  borderRadius="26px 26px 0 0"
                  style={{ padding: '20px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(9, 13, 22, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        padding: '4px 11px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 900,
                        letterSpacing: '0.12em',
                        color: activeDetailChallenge.id === 'mantra_21' ? '#4ADE80' : '#FFFFFF',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {activeDetailChallenge.id === 'mantra_21' && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                      )}
                      {getThemeForChallenge(activeDetailChallenge.id).badge}
                    </span>

                    <button
                      onClick={() => setActiveDetailChallenge(null)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'rgba(9, 13, 22, 0.65)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: 'auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(9, 13, 22, 0.65)',
                      backdropFilter: 'blur(10px)',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      width: 'fit-content'
                    }}
                  >
                    {activeDetailChallenge.durationDays} Days • ~{activeDetailChallenge.dailyTimeMinutes} min/day
                  </div>
                </ChallengeVisual>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '24px', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', color: '#0284C7', textTransform: 'uppercase' }}>
                  {activeDetailChallenge.category}
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 950, color: '#090D16', margin: '4px 0 8px 0', letterSpacing: '-0.02em' }}>
                  {activeDetailChallenge.name}
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.55, margin: '0 0 20px 0' }}>
                  {activeDetailChallenge.description}
                </p>

                {activeDetailChallenge.keyMilestones && activeDetailChallenge.keyMilestones.length > 0 && (
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#090D16', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Milestones
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                      {activeDetailChallenge.keyMilestones.map((m, idx) => (
                        <div key={idx} style={{ background: '#FFFFFF', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#0284C7' }}>DAY {String(m.day).padStart(2, '0')}</div>
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#090D16', marginTop: '2px' }}>{m.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {enrollmentError && (
                  <div style={{ padding: '12px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
                    {enrollmentError}
                  </div>
                )}

                {activeDetailChallenge.id === 'mantra_21' ? (
                  <button
                    disabled={isEnrolling}
                    onClick={async () => {
                      await onEnroll(activeDetailChallenge.id);
                    }}
                    style={{
                      width: '100%',
                      padding: '15px',
                      borderRadius: '14px',
                      background: '#090D16',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      border: 'none',
                      cursor: isEnrolling ? 'not-allowed' : 'pointer',
                      opacity: isEnrolling ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 24px -6px rgba(9, 13, 22, 0.4)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{isEnrolling ? 'JOINING...' : 'JOIN MANTRA 21 →'}</span>
                  </button>
                ) : (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '15px',
                      borderRadius: '14px',
                      background: '#F1F5F9',
                      color: '#94A3B8',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      border: '1px solid #E2E8F0',
                      cursor: 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>COMING SOON</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
