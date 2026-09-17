import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import OrganicParticleBreathingSphere from '../components/breathing/OrganicParticleBreathingSphere';
import BreathingHeader from '../components/breathing/BreathingHeader';
import { completeLesson } from '../mantra/api';
import '../components/breathing/FourSevenEightBreathing.css';

const LESSON_ID = 'ocd_478_breathing';

export default function FourSevenEightBreathingActivity({ onBack, onNavigate }) {
  const { t } = useTranslation('ocd_478_breathing');

  const REFLECTION_CHOICES = [
    { id: 'settled', label: t('reflection.choices.settled', { defaultValue: 'More settled' }) },
    { id: 'present', label: t('reflection.choices.present', { defaultValue: 'More present' }) },
    { id: 'same', label: t('reflection.choices.same', { defaultValue: 'Just the same' }) }
  ];

  const TIME_OPTIONS = [
    { id: '30s', label: t('time_options.opt_30s', { defaultValue: '30 sec' }), cycles: 2, hint: t('time_options.opt_30s_hint', { defaultValue: '2 cycles · ≈ 38 sec' }) },
    { id: '1m', label: t('time_options.opt_1m', { defaultValue: '1 min' }), cycles: 3, hint: t('time_options.opt_1m_hint', { defaultValue: '3 cycles · ≈ 1 min' }) },
    { id: '2m', label: t('time_options.opt_2m', { defaultValue: '2 min' }), cycles: 6, hint: t('time_options.opt_2m_hint', { defaultValue: '6 cycles · ≈ 2 min' }) },
    { id: '3m', label: t('time_options.opt_3m', { defaultValue: '3 min' }), cycles: 10, hint: t('time_options.opt_3m_hint', { defaultValue: '10 cycles · ≈ 3 min' }) },
    { id: '5m', label: t('time_options.opt_5m', { defaultValue: '5 min' }), cycles: 16, hint: t('time_options.opt_5m_hint', { defaultValue: '16 cycles · ≈ 5 min' }) },
  ];

  const [stage, setStage] = useState(1);
  const [selectedTimeId, setSelectedTimeId] = useState('1m');
  const [guidance, setGuidance] = useState('standard'); // 'standard' | 'gentle'
  const [currentCycle, setCurrentCycle] = useState(1);
  const [phase, setPhase] = useState('rest'); // 'inhale' | 'hold' | 'exhale' | 'rest'
  const [phaseProgress, setPhaseProgress] = useState(0); // 0 to 1
  const [selectedReflection, setSelectedReflection] = useState(null);

  const selectedOption = TIME_OPTIONS.find(opt => opt.id === selectedTimeId) || TIME_OPTIONS[1];
  const totalCycles = selectedOption.cycles;

  const startTimeRef = useRef(null);
  const animRef = useRef(null);

  // Exact 4-7-8 Breathing Ratio Engine
  // Inhale: 4000ms | Hold: 7000ms | Exhale: 8000ms (Total per cycle: 19000ms)
  const CYCLE_DURATION = 19000;
  const INHALE_DURATION = 4000;
  const HOLD_DURATION = 7000;
  const EXHALE_DURATION = 8000;

  // Start active breathing loop once preparation animation reaches original resting state
  const startBreathingCycle = useCallback(() => {
    setStage(3);
    setPhase('inhale');
    setPhaseProgress(0);
    setCurrentCycle(1);
  }, []);

  useEffect(() => {
    if (stage !== 3) return;

    startTimeRef.current = performance.now();

    const loop = (now) => {
      const elapsedTotal = now - startTimeRef.current;
      const cycleIndex = Math.floor(elapsedTotal / CYCLE_DURATION) + 1;

      if (cycleIndex > totalCycles) {
        // Selected cycles completed!
        setPhase('rest');
        setPhaseProgress(0);
        setTimeout(() => setStage(4), 800);
        return;
      }

      setCurrentCycle(cycleIndex);
      const cycleElapsed = elapsedTotal % CYCLE_DURATION;

      if (cycleElapsed < INHALE_DURATION) {
        setPhase('inhale');
        setPhaseProgress(cycleElapsed / INHALE_DURATION);
      } else if (cycleElapsed < INHALE_DURATION + HOLD_DURATION) {
        setPhase('hold');
        setPhaseProgress((cycleElapsed - INHALE_DURATION) / HOLD_DURATION);
      } else {
        setPhase('exhale');
        setPhaseProgress((cycleElapsed - INHALE_DURATION - HOLD_DURATION) / EXHALE_DURATION);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [stage, totalCycles]);

  // Handle Begin - Enter controlled Settling Preparation
  const handleBegin = () => {
    setStage(2); // Enter Stage 2: Pre-session Settling
  };

  // Safe completion trigger
  const handleComplete = useCallback(async () => {
    try {
      await completeLesson(LESSON_ID);
      await completeLesson('406');
    } catch (e) {
      console.warn('Completion warning:', e);
    }
    if (onBack) {
      onBack();
    } else {
      handleExit();
    }
  }, [onBack]);

  return (
    <div className="breathing-activity">
      {/* Header */}
      <BreathingHeader onBack={onBack} />

      {/* Main Experience Arena */}
      <main className="breathing-activity__main">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* SCREEN 1: PRODUCT DESIGNED INTRO & SETUP SCREEN */}
          {/* ============================================================ */}
          {stage === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '440px' }}
            >
              {/* Refined Two-Line Editorial Heading with Optical Alignment */}
              <h1 className="breathing-heading">
                <span className="breathing-heading__numbers">{t('hero.title_num', { defaultValue: '4–7–8' })}</span>
                <span className="breathing-heading__title">{t('hero.title_text', { defaultValue: 'BREATHING' })}</span>
              </h1>

              <p className="breathing-subcopy">
                {t('hero.subtitle', { defaultValue: 'A simple rhythm to guide your breathing.' })}
              </p>

              <div className="breathing-rhythm-badge">
                {t('hero.rhythm_badge', { defaultValue: 'Inhale for 4 · hold for 7 · exhale for 8' })}
              </div>

              {/* Prominent Living 3D Breathing Sphere with Subtle Idle Preview */}
              <OrganicParticleBreathingSphere
                phase="preview"
                phaseProgress={0}
                guidance={guidance}
              />

              {/* Session Setup Controls */}
              <div className="breathing-setup-container">
                {/* How Long Control */}
                <div className="breathing-setup-row">
                  <span className="breathing-setup-label">{t('hero.label_how_long', { defaultValue: 'HOW LONG?' })}</span>
                  <div className="breathing-segmented-control" role="tablist" aria-label="Select practice time">
                    {TIME_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedTimeId(opt.id)}
                        className={`breathing-segment-btn ${selectedTimeId === opt.id ? 'active' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <span className="breathing-duration-hint">
                    {selectedOption.hint}
                  </span>
                </div>
              </div>

              {/* Restrained Begin CTA */}
              <button
                type="button"
                onClick={handleBegin}
                className="breathing-action-btn"
              >
                <span>{t('hero.btn_begin', { defaultValue: 'Begin' })}</span>
                <span style={{ fontSize: '15px' }}>→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 2: GET SETTLED (PRE-SESSION TRANSITION) */}
          {/* ============================================================ */}
          {stage === 2 && (
            <motion.div
              key="stage-2-settling"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                width: '100%',
                maxWidth: '440px',
                minHeight: '380px'
              }}
            >
              {/* Single Soft Organic Dot with Breath-Like Gesture */}
              <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                  className="breathing-settling-dot"
                  initial={{ scale: 1, opacity: 0.85 }}
                  animate={{
                    scale: [1, 2.8, 2.8, 1],
                    opacity: [0.85, 1, 0.95, 0.85]
                  }}
                  transition={{
                    duration: 4.4,
                    times: [0, 0.42, 0.60, 1],
                    ease: [0.37, 0, 0.63, 1]
                  }}
                  onAnimationComplete={startBreathingCycle}
                />
              </div>

              {/* Minimal Text */}
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="breathing-settling-title"
              >
                {t('settling.title', { defaultValue: 'Get settled' })}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="breathing-settling-subcopy"
              >
                {t('settling.subcopy', { defaultValue: 'Take a moment.' })}
              </motion.p>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 3: ACTIVE 4-7-8 BREATHING EXPERIENCE */}
          {/* ============================================================ */}
          {stage === 3 && (
            <motion.div
              key="stage-3-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}
            >
              {/* Organic Breathing Particle Sphere with Active 4-7-8 Curve */}
              <OrganicParticleBreathingSphere
                phase={phase}
                phaseProgress={phaseProgress}
                guidance={guidance}
              />

              {/* Dynamic Phase Text */}
              <div style={{ minHeight: '68px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AnimatePresence mode="wait">
                  {phase === 'inhale' && (
                    <motion.div
                      key="inhale-text"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <h2 className="breathing-phase-title">{t('phases.inhale_title', { defaultValue: 'Inhale' })}</h2>
                      <span className="breathing-phase-subtitle">{t('phases.inhale_sub', { defaultValue: 'Slowly breathe in' })}</span>
                    </motion.div>
                  )}

                  {phase === 'hold' && (
                    <motion.div
                      key="hold-text"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <h2 className="breathing-phase-title">{t('phases.hold_title', { defaultValue: 'Hold' })}</h2>
                      <span className="breathing-phase-subtitle">{t('phases.hold_sub', { defaultValue: 'Stay here' })}</span>
                    </motion.div>
                  )}

                  {phase === 'exhale' && (
                    <motion.div
                      key="exhale-text"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <h2 className="breathing-phase-title">{t('phases.exhale_title', { defaultValue: 'Exhale' })}</h2>
                      <span className="breathing-phase-subtitle">{t('phases.exhale_sub', { defaultValue: 'Slowly breathe out' })}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cycle Indicator */}
              <div className="breathing-cycle-indicator">
                {currentCycle} / {totalCycles}
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 4: REFLECTION (WHAT DO YOU NOTICE?) */}
          {/* ============================================================ */}
          {stage === 4 && (
            <motion.div
              key="stage-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '440px' }}
            >
              <h2 className="breathing-heading" style={{ fontSize: '36px' }}>
                {t('reflection.title', { defaultValue: 'Well done.' })}
              </h2>

              <p className="breathing-subcopy" style={{ marginBottom: '14px' }}>
                {t('reflection.subtitle', { defaultValue: 'Take a moment before you move on. Notice how you feel right now.' })}
              </p>

              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', color: '#005387', textTransform: 'uppercase', marginBottom: '8px' }}>
                {t('reflection.question', { defaultValue: 'What do you notice?' })}
              </div>

              {/* Choices */}
              <div className="breathing-choices-list">
                {REFLECTION_CHOICES.map((choice) => {
                  const isSelected = selectedReflection === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => setSelectedReflection(choice.id)}
                      className={`breathing-choice-item ${isSelected ? 'selected' : ''}`}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStage(5)}
                className="breathing-action-btn"
              >
                <span>{t('reflection.btn_continue', { defaultValue: 'Continue' })}</span>
                <span style={{ fontSize: '15px' }}>→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 5: FINAL TAKEAWAY & COMPLETION */}
          {/* ============================================================ */}
          {stage === 5 && (
            <motion.div
              key="stage-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '440px' }}
            >
              <h2 className="breathing-heading">
                {t('takeaway.title', { defaultValue: '4–7–8' })}
              </h2>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#005387',
                letterSpacing: '0.08em',
                marginBottom: '16px'
              }}>
                <span>{t('takeaway.step_inhale', { defaultValue: 'INHALE 4' })}</span>
                <span style={{ color: '#0284C7', opacity: 0.6 }}>·</span>
                <span>{t('takeaway.step_hold', { defaultValue: 'HOLD 7' })}</span>
                <span style={{ color: '#0284C7', opacity: 0.6 }}>·</span>
                <span>{t('takeaway.step_exhale', { defaultValue: 'EXHALE 8' })}</span>
              </div>

              <p className="breathing-subcopy" style={{ marginBottom: '28px' }}>
                {t('takeaway.subtitle', { defaultValue: 'Return to this practice whenever you want a quiet moment to reset your attention.' })}
              </p>

              <button
                type="button"
                onClick={handleComplete}
                className="breathing-action-btn"
              >
                <span>{t('takeaway.btn_continue', { defaultValue: 'Continue' })}</span>
                <span style={{ fontSize: '15px' }}>→</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
