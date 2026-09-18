import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EMOTION_WHEEL_TAXONOMY,
  ALL_EMOTIONS_FLAT,
  searchEmotions
} from '../data/emotionWheelTaxonomy';
import { getDiscoveryConfig } from '../data/emotionDiscoveryConfig';
import InteractiveEmotionWheel from '../components/emotionWheel/InteractiveEmotionWheel';
import EmotionIntensityStep from '../components/emotionWheel/EmotionIntensityStep';
import EmotionContextStep from '../components/emotionWheel/EmotionContextStep';
import EmotionNeedStep from '../components/emotionWheel/EmotionNeedStep';
import EmotionalSnapshotView from '../components/emotionWheel/EmotionalSnapshotView';
import { completeLesson } from '../mantra/api';
import { goToDashboard } from '../mantra/navigation';
import { logUserActivityToDB, PLATFORM_ACTIVITIES } from '../services/activityLogger';
import { getActiveUserId } from '../services/authService';
import { trackEmotionWheelEvent } from '../utils/emotionAnalytics';
import {
  Search,
  ArrowLeft,
  ChevronRight,
  Compass,
  Sparkles,
  X,
  RotateCcw
} from 'lucide-react';

/**
 * EmotionWheelPage:
 * Final UX Architecture — ONE Continuous, Immersive Page with Sticky Camera Wheel.
 * 
 * Flow:
 * 1. Single Mounted Wheel that never unmounts or reloads between states.
 * 2. Section 1: "What are you feeling right now?" (Full Wheel).
 * 3. Section 2: "Exploring [Family]" (Camera gently focuses on family branch).
 * 4. Section 3: "Let's get more specific" (Camera focuses on nuance category / emotions).
 * 5. Section 4: Intensity & Discovery Journey smoothly appears on the same continuous page.
 * 6. Sticky/pinned presentation keeps the emotional anchor visible at all times.
 */
export default function EmotionWheelPage({ onBack, onNavigate, service }) {
  // Continuous Exploration State
  // explorationLevel: 1 (Full Wheel) | 2 (Family focus) | 3 (Nuance/Specific emotion) | 4 (Intensity & Discovery Flow)
  const [explorationLevel, setExplorationLevel] = useState(1);

  // Active Hierarchical Selections
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  // Discovery Journey States
  const [flowStep, setFlowStep] = useState('intensity'); // 'intensity' | 'context' | 'needs' | 'snapshot'
  const [intensity, setIntensity] = useState(3);
  const [selectedContexts, setSelectedContexts] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState([]);

  // Search Sheet State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Refs for smooth vertical scrolling
  const containerRef = useRef(null);
  const explorationSectionRef = useRef(null);
  const wheelWrapperRef = useRef(null);
  const flowSectionRef = useRef(null);

  // Search Results
  const searchResults = useMemo(() => {
    return searchEmotions(searchQuery);
  }, [searchQuery]);

  // Resolved Discovery Config
  const discoveryConfig = useMemo(() => {
    if (!selectedFamily) return getDiscoveryConfig('sadness');
    return getDiscoveryConfig(selectedFamily.id, selectedEmotion?.id);
  }, [selectedFamily, selectedEmotion]);

  // Track initial page open
  useEffect(() => {
    trackEmotionWheelEvent('emotion_wheel_opened', {
      service: service || 'mental_wellness'
    });
  }, [service]);

  // =========================================================================
  // SELECTION HANDLERS (PROGRAMMATIC SMOOTH CAMERA + SCROLL)
  // =========================================================================

  const handleSelectFamily = (family) => {
    if (!family) {
      setSelectedFamily(null);
      setSelectedCategory(null);
      setSelectedEmotion(null);
      setExplorationLevel(1);
      return;
    }

    trackEmotionWheelEvent('emotion_family_selected', { familyId: family?.id, familyName: family?.name });
    setSelectedFamily(family);
    setSelectedCategory(null);
    setSelectedEmotion(null);
    setExplorationLevel(2);

    // Smooth programmatic scroll so wheel fills the screen comfortably
    setTimeout(() => {
      wheelWrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleSelectCategory = (category) => {
    if (!category) {
      setSelectedCategory(null);
      setSelectedEmotion(null);
      setExplorationLevel(2);
      return;
    }

    setSelectedCategory(category);
    setSelectedEmotion(null);
    setExplorationLevel(3);

    // Smooth auto-scroll to center the focused nuance wheel
    setTimeout(() => {
      wheelWrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleSelectEmotion = (emotion) => {
    trackEmotionWheelEvent('emotion_selected', {
      emotionId: emotion?.id,
      emotionName: emotion?.name,
      familyId: selectedFamily?.id || emotion?.familyId
    });

    // Resolve full taxonomy branch if not active
    const flatMatch = ALL_EMOTIONS_FLAT.find((e) => e.id === emotion.id);
    if (flatMatch) {
      const fam = EMOTION_WHEEL_TAXONOMY.find((f) => f.id === flatMatch.familyId);
      if (fam) {
        setSelectedFamily(fam);
        const cat = fam.categories.find((c) => c.id === flatMatch.categoryId);
        if (cat) setSelectedCategory(cat);
      }
    }

    setSelectedEmotion(emotion);
    setExplorationLevel(3);

    setTimeout(() => {
      wheelWrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleProceedToDiscovery = () => {
    if (!selectedEmotion) return;
    setExplorationLevel(4);
    setFlowStep('context');

    // Smooth scroll down to the continuous discovery form section
    setTimeout(() => {
      flowSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDirectSearchSelect = (item) => {
    trackEmotionWheelEvent('emotion_search_used', {
      searchQuery,
      selectedEmotionId: item.id
    });
    trackEmotionWheelEvent('emotion_selected', {
      emotionId: item.id,
      emotionName: item.name,
      familyId: item.familyId
    });

    const fam = EMOTION_WHEEL_TAXONOMY.find((f) => f.id === item.familyId);
    if (fam) {
      setSelectedFamily(fam);
      const cat = fam.categories.find((c) => c.id === item.categoryId);
      if (cat) setSelectedCategory(cat);
    }
    setSelectedEmotion(item);
    setExplorationLevel(3);
    setIsSearchOpen(false);

    setTimeout(() => {
      explorationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleBackNavigation = () => {
    if (explorationLevel === 4) {
      if (flowStep === 'snapshot') setFlowStep('needs');
      else if (flowStep === 'needs') setFlowStep('intensity');
      else if (flowStep === 'intensity') setFlowStep('context');
      else {
        setExplorationLevel(3);
        explorationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (explorationLevel === 3) {
      if (selectedEmotion) {
        setSelectedEmotion(null);
      } else {
        setSelectedCategory(null);
        setExplorationLevel(2);
      }
    } else if (explorationLevel === 2) {
      setSelectedFamily(null);
      setSelectedCategory(null);
      setSelectedEmotion(null);
      setExplorationLevel(1);
    } else {
      if (onBack) onBack();
    }
  };

  const handleToggleContext = (label) => {
    setSelectedContexts((prev) => {
      const next = prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label];
      trackEmotionWheelEvent('emotion_context_selected', { contextsCount: next.length });
      return next;
    });
  };

  const handleToggleNeed = (label) => {
    setSelectedNeeds((prev) => {
      const next = prev.includes(label) ? prev.filter((n) => n !== label) : [...prev, label];
      trackEmotionWheelEvent('emotion_need_selected', { needsCount: next.length });
      return next;
    });
  };

  const handleResetFlow = () => {
    setSelectedFamily(null);
    setSelectedCategory(null);
    setSelectedEmotion(null);
    setExplorationLevel(1);
    setFlowStep('context');
    setIntensity(3);
    setSelectedContexts([]);
    setFreeText('');
    setSelectedNeeds([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishReflection = async () => {
    try {
      trackEmotionWheelEvent('emotion_wheel_completed', {
        familyId: selectedFamily?.id,
        emotionId: selectedEmotion?.id,
        intensity,
        contextsCount: selectedContexts.length,
        needsCount: selectedNeeds.length
      });

      const userId = getActiveUserId();
      const explorationData = {
        userId,
        activityId: PLATFORM_ACTIVITIES.EMOTION_WHEEL || 'emotion-wheel',
        activityType: 'emotion_wheel',
        lessonId: 'emotion-wheel',
        service: service || 'mental_wellness',
        emotionZone: selectedFamily?.id || null,
        primaryEmotion: selectedEmotion?.name || null,
        additionalEmotions: selectedCategory?.name ? [selectedCategory.name] : [],
        intensity,
        contexts: selectedContexts,
        reflection: freeText,
        resultSummary: {
          family: selectedFamily?.name,
          category: selectedCategory?.name,
          emotion: selectedEmotion?.name,
          intensity,
          needs: selectedNeeds
        },
        rewardPoints: 25
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mantra_last_emotion_wheel', JSON.stringify({
            ...explorationData,
            timestamp: new Date().toISOString()
          }));
        } catch (e) {
          console.warn('[EmotionWheel] LocalStorage error:', e);
        }
      }

      await logUserActivityToDB(explorationData).catch((err) => console.warn('[EmotionWheel] DB log non-blocking error:', err));
      await completeLesson('emotion-wheel').catch((err) => console.warn('[EmotionWheel] Completion non-blocking error:', err));
    } catch (err) {
      console.error('[EmotionWheel] Finish error:', err);
    }

    goToDashboard();
  };

  const activeThemeColor = selectedFamily?.color || '#38bdf8';

  return (
    <div
      ref={containerRef}
      className="emotion-wheel-continuous-experience"
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#0a0f1d',
        color: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: 'relative',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(700px, 90vw)',
          height: 'min(700px, 90vw)',
          borderRadius: '50%',
          background: selectedFamily?.glowColor || 'rgba(56, 189, 248, 0.16)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />

      {/* STICKY TOP APP HEADER */}
      <header
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(10, 15, 29, 0.88)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 60
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleBackNavigation}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'background 0.2s ease'
            }}
          >
            <ArrowLeft size={15} />
            <span>{explorationLevel === 1 ? 'Exit' : 'Back'}</span>
          </button>
        </div>

        {/* Global Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '8px 14px',
            color: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500'
          }}
        >
          <Search size={14} color="#38bdf8" />
          <span>Search</span>
        </button>
      </header>

      {/* CONTINUOUS STORYTELLING JOURNEY */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '860px',
          margin: '0 auto',
          padding: '12px 14px 60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* =================================================================== */}
        {/* HERO SECTION 1, 2, 3: TYPOGRAPHY & MAP NAVIGATION */}
        {/* =================================================================== */}
        {explorationLevel < 4 && (
          <div
            ref={explorationSectionRef}
            style={{
              textAlign: 'center',
              marginBottom: '16px',
              width: '100%',
              maxWidth: '640px',
              transition: 'all 0.4s ease'
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(26px, 5.5vw, 36px)',
                fontWeight: '900',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                margin: '0 0 8px 0',
                color: '#ffffff'
              }}
            >
              {explorationLevel === 1
                ? 'What are you feeling right now?'
                : explorationLevel === 2
                ? `Exploring ${selectedFamily?.name}`
                : explorationLevel === 3
                ? `Let's get more specific`
                : `You've found the feeling`}
            </h1>

            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.72)',
                margin: '0 auto 12px',
                maxWidth: '480px',
                lineHeight: 1.45
              }}
            >
              {explorationLevel === 1
                ? 'Explore the wheel or tap a feeling below to zoom in.'
                : explorationLevel === 2
                ? `Which ${selectedFamily?.name} category feels closest to your state?`
                : `Tap the nuance that best captures what you are experiencing.`}
            </p>

            {/* Quick Family Selector (Level 1) */}
            {explorationLevel === 1 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}
              >
                {EMOTION_WHEEL_TAXONOMY.map((fam) => (
                  <button
                    key={fam.id}
                    onClick={() => handleSelectFamily(fam)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${fam.color}45`,
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '13px',
                      color: fam.color,
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {fam.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* THE HERO WHEEL: 100% PERSISTENT & CONTINUOUSLY MOUNTED */}
        {/* =================================================================== */}
        {explorationLevel < 4 && (
          <div
            ref={wheelWrapperRef}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <InteractiveEmotionWheel
              selectedFamily={selectedFamily}
              selectedCategory={selectedCategory}
              selectedEmotion={selectedEmotion}
              onSelectFamily={handleSelectFamily}
              onSelectCategory={handleSelectCategory}
              onSelectEmotion={handleSelectEmotion}
              onBackLevel={handleBackNavigation}
              isDimmedForFlow={false}
            />

            {/* Contextual Callout */}
            <div
              style={{
                width: '100%',
                maxWidth: '600px',
                textAlign: 'center',
                padding: '16px 20px',
                marginTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                boxSizing: 'border-box',
                zIndex: 5
              }}
            >
              {selectedEmotion ? (
                <div>
                  <span
                    style={{
                      fontSize: '12.5px',
                      fontWeight: '700',
                      color: selectedFamily?.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      marginBottom: '4px'
                    }}
                  >
                    {selectedFamily?.name} · {selectedCategory?.name}
                  </span>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>
                    {selectedEmotion.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '15px', color: 'rgba(255, 255, 255, 0.85)', fontStyle: 'italic', lineHeight: 1.45 }}>
                    "{selectedEmotion.nuance || selectedEmotion.def}"
                  </p>
                </div>
              ) : selectedCategory ? (
                <div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: selectedFamily?.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      marginBottom: '4px'
                    }}
                  >
                    {selectedFamily?.name}
                  </span>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>
                    {selectedCategory.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14.5px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.4 }}>
                    {selectedCategory.description || 'Tap any feeling on the outer ring to explore.'}
                  </p>
                </div>
              ) : selectedFamily ? (
                <div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: selectedFamily.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      display: 'block',
                      marginBottom: '4px'
                    }}
                  >
                    Primary Feeling
                  </span>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>
                    {selectedFamily.subtitle}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14.5px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.4 }}>
                    {selectedFamily.description}
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
                    Take a gentle breath and explore the wheel
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    Tap any primary feeling to start discovering what is present.
                  </p>
                </div>
              )}

              {/* Full-Width Mobile-Optimized Action Button */}
              {selectedEmotion && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToDiscovery}
                  style={{
                    width: '100%',
                    maxWidth: '420px',
                    background: `linear-gradient(135deg, ${selectedFamily?.color || '#38bdf8'} 0%, #2563eb 100%)`,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 28px',
                    fontSize: '16.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: `0 8px 28px ${selectedFamily?.color || '#38bdf8'}40`,
                    transition: 'transform 0.2s ease',
                    marginTop: '8px'
                  }}
                >
                  <span>Explore what might be behind {selectedEmotion.name}</span>
                  <ChevronRight size={18} />
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION 4: CONTINUOUS INTENSITY & DISCOVERY STEPS (SAME PAGE) */}
        {/* =================================================================== */}
        {explorationLevel === 4 && selectedEmotion && (
          <div
            ref={flowSectionRef}
            style={{
              width: '100%',
              maxWidth: '680px',
              marginTop: '36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {flowStep === 'context' && (
              <EmotionContextStep
                key="context-step"
                emotion={selectedEmotion}
                family={selectedFamily}
                config={discoveryConfig}
                selectedContexts={selectedContexts}
                freeText={freeText}
                onToggleContext={handleToggleContext}
                onChangeFreeText={setFreeText}
                onContinue={() => setFlowStep('intensity')}
              />
            )}

            {flowStep === 'intensity' && (
              <EmotionIntensityStep
                key="intensity-step"
                emotion={selectedEmotion}
                family={selectedFamily}
                intensity={intensity}
                onSelectIntensity={setIntensity}
                onContinue={() => setFlowStep('needs')}
              />
            )}

            {flowStep === 'needs' && (
              <EmotionNeedStep
                key="needs-step"
                emotion={selectedEmotion}
                family={selectedFamily}
                config={discoveryConfig}
                selectedNeeds={selectedNeeds}
                onToggleNeed={handleToggleNeed}
                onContinue={() => setFlowStep('snapshot')}
              />
            )}

            {flowStep === 'snapshot' && (
              <EmotionalSnapshotView
                key="snapshot-step"
                emotion={selectedEmotion}
                family={selectedFamily}
                intensity={intensity}
                selectedContexts={selectedContexts}
                freeText={freeText}
                selectedNeeds={selectedNeeds}
                config={discoveryConfig}
                onReset={handleResetFlow}
                onFinish={handleFinishReflection}
                onNavigate={onNavigate}
              />
            )}
          </div>
        )}
      </main>

      {/* SEARCH OVERLAY MODAL */}
      <AnimatePresence>
        {isSearchOpen && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.78)',
              backdropFilter: 'blur(10px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '40px 20px'
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              style={{
                width: '100%',
                maxWidth: '540px',
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Search Emotion Map</h3>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Type an emotion (e.g. anxious, overwhelmed, loving)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(searchQuery ? searchResults : ALL_EMOTIONS_FLAT.slice(0, 30)).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleDirectSearchSelect(item)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '14.5px', fontWeight: '600', color: '#ffffff', marginRight: '8px' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '11px', color: item.familyColor, fontWeight: '700' }}>
                        {item.familyName}
                      </span>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
                        {item.nuance || item.def}
                      </p>
                    </div>
                    <ChevronRight size={15} color="rgba(255, 255, 255, 0.4)" />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
