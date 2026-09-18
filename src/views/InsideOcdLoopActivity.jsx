import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { handleExit, goToDashboard } from '../mantra/navigation';
import { completeLesson } from '../mantra/api';
import { getActiveUserId } from '../services/authService';

const LESSON_ID = 'ocd_cycle';
const OCDMANTRA_LOGO_URL =
  'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

const STAGES = [
  { id: 'thought', labelKey: 'loop.stages.thought', defaultLabel: 'Thought', x: 200, y: 56 },
  { id: 'uncertainty', labelKey: 'loop.stages.uncertainty', defaultLabel: 'Uncertainty', x: 344, y: 200 },
  { id: 'response', labelKey: 'loop.stages.response', defaultLabel: 'Response', x: 200, y: 344 },
  { id: 'relief', labelKey: 'loop.stages.relief', defaultLabel: 'Relief', x: 56, y: 200 }
];

const SCENARIOS = [
  {
    id: 'checking',
    nameKey: 'scenarios.checking.name',
    defaultName: 'Checking',
    phraseKey: 'scenarios.checking.phrase',
    defaultPhrase: '“What if I didn\'t lock the door?”',
    thoughtKey: 'scenarios.checking.thought',
    defaultThought: '“What if I didn\'t lock the door?”',
    uncertaintyKey: 'scenarios.checking.uncertainty',
    defaultUncertainty: '“Did I really lock it?”',
    responseKey: 'scenarios.checking.response',
    defaultResponse: '“Check the lock again.”',
    reliefKey: 'scenarios.checking.relief',
    defaultRelief: '“Okay, it feels safe for now.”',
    returnKey: 'scenarios.checking.return',
    defaultReturn: '“Wait... did I check properly?”',
    takeawayQuoteKey: 'scenarios.checking.takeaway_quote',
    defaultTakeawayQuote: 'I noticed that checking brings quick relief, but the doubt returns.',
    takeawayActionKey: 'scenarios.checking.takeaway_action',
    defaultTakeawayAction: 'Next time the doubt appears, pause and notice the urge before automatically checking.'
  },
  {
    id: 'responsibility',
    nameKey: 'scenarios.responsibility.name',
    defaultName: 'Responsibility',
    phraseKey: 'scenarios.responsibility.phrase',
    defaultPhrase: '“What if I made a serious mistake?”',
    thoughtKey: 'scenarios.responsibility.thought',
    defaultThought: '“What if I made a serious mistake?”',
    uncertaintyKey: 'scenarios.responsibility.uncertainty',
    defaultUncertainty: '“I have to know for sure.”',
    responseKey: 'scenarios.responsibility.response',
    defaultResponse: '“Replay every detail in my head.”',
    reliefKey: 'scenarios.responsibility.relief',
    defaultRelief: '“It seems fine for a moment.”',
    returnKey: 'scenarios.responsibility.return',
    defaultReturn: '“What if I missed a detail?”',
    takeawayQuoteKey: 'scenarios.responsibility.takeaway_quote',
    defaultTakeawayQuote: 'I noticed that mental replaying tries to create certainty, but prolongs the doubt.',
    takeawayActionKey: 'scenarios.responsibility.takeaway_action',
    defaultTakeawayAction: 'Next time the urge to replay arises, acknowledge the doubt without analyzing it.'
  },
  {
    id: 'contamination',
    nameKey: 'scenarios.contamination.name',
    defaultName: 'Contamination',
    phraseKey: 'scenarios.contamination.phrase',
    defaultPhrase: '“What if I touched something contaminated?”',
    thoughtKey: 'scenarios.contamination.thought',
    defaultThought: '“What if that surface wasn\'t clean?”',
    uncertaintyKey: 'scenarios.contamination.uncertainty',
    defaultUncertainty: '“I feel uncomfortable and contaminated.”',
    responseKey: 'scenarios.contamination.response',
    defaultResponse: '“Wash thoroughly.”',
    reliefKey: 'scenarios.contamination.relief',
    defaultRelief: '“I feel clean for now.”',
    returnKey: 'scenarios.contamination.return',
    defaultReturn: '“Did I wash well enough?”',
    takeawayQuoteKey: 'scenarios.contamination.takeaway_quote',
    defaultTakeawayQuote: 'I noticed that washing relieves the initial discomfort, but sets up the next doubt.',
    takeawayActionKey: 'scenarios.contamination.takeaway_action',
    defaultTakeawayAction: 'Next time the urge to wash hits, give yourself a moment to notice the feeling first.'
  },
  {
    id: 'symmetry',
    nameKey: 'scenarios.symmetry.name',
    defaultName: 'Just Right',
    phraseKey: 'scenarios.symmetry.phrase',
    defaultPhrase: '“What if I don\'t do this exactly right?”',
    thoughtKey: 'scenarios.symmetry.thought',
    defaultThought: '“This doesn\'t feel balanced.”',
    uncertaintyKey: 'scenarios.symmetry.uncertainty',
    defaultUncertainty: '“Something bad might happen or feel wrong.”',
    responseKey: 'scenarios.symmetry.response',
    defaultResponse: '“Redo it until it clicks.”',
    reliefKey: 'scenarios.symmetry.relief',
    defaultRelief: '“Feels right for now.”',
    returnKey: 'scenarios.symmetry.return',
    defaultReturn: '“Did I do it right the last time?”',
    takeawayQuoteKey: 'scenarios.symmetry.takeaway_quote',
    defaultTakeawayQuote: 'I noticed that repeating an action for a \'just right\' feeling keeps the urge alive.',
    takeawayActionKey: 'scenarios.symmetry.takeaway_action',
    defaultTakeawayAction: 'Next time something feels incomplete, notice the urge to redo without immediately repeating.'
  }
];

export default function InsideOcdLoopActivity({ onBack, onNavigate }) {
  const { t } = useTranslation('ocd_cycle');
  const prefersReducedMotion = useReducedMotion();

  const { handleActionComplete } = useLessonCompletion(LESSON_ID, onBack, {
    hasVideo: false,
    hasAction: true,
    hasQuiz: false
  });

  // Stage 1: Experience Loop State
  const [introStepIdx, setIntroStepIdx] = useState(0); // 0: thought, 1: uncertainty, 2: response, 3: relief
  const [introCycle, setIntroCycle] = useState(1); // 1 or 2
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);

  // Stage 2: Recognize Scenario State
  const [selectedScenarioId, setSelectedScenarioId] = useState('checking');
  const [scenarioStepIdx, setScenarioStepIdx] = useState(0); // 0..4 (4 = return)
  const [isScenarioPlaying, setIsScenarioPlaying] = useState(false);
  const [hasPlayedScenario, setHasPlayedScenario] = useState(false);

  // Stage 3: Practice Noticing / Response Point State
  const [responseChoice, setResponseChoice] = useState(null); // 'check' | 'notice'

  // Stage 4: Discover Compulsions State
  const [compulsionCategory, setCompulsionCategory] = useState('outward'); // 'outward' | 'inward'

  // Completion State
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState(null);

  const introTimerRef = useRef(null);
  const scenarioTimerRef = useRef(null);

  const trackEvent = (eventName, data = {}) => {
    try {
      const payload = {
        event: eventName,
        user_id: getActiveUserId(),
        activity_id: LESSON_ID,
        service: 'ocd',
        timestamp: new Date().toISOString(),
        ...data
      };
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('mantra_analytics_event', { detail: payload })
        );
      }
    } catch (e) {}
  };

  // Run intro sequence on mount
  useEffect(() => {
    trackEvent('ocd_loop_started');
    runIntroSequence(0, 1);
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      if (scenarioTimerRef.current) clearTimeout(scenarioTimerRef.current);
    };
  }, []);

  const runIntroSequence = (stepIndex, cycle) => {
    setIntroStepIdx(stepIndex);
    setIntroCycle(cycle);

    const stepDuration = prefersReducedMotion ? 900 : (cycle === 1 ? 1800 : 1350);

    introTimerRef.current = setTimeout(() => {
      if (stepIndex < 3) {
        runIntroSequence(stepIndex + 1, cycle);
      } else if (cycle === 1) {
        runIntroSequence(0, 2);
      } else {
        setHasCompletedIntro(true);
        trackEvent('ocd_loop_completed');
      }
    }, stepDuration);
  };

  const handleReplayIntro = () => {
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    setHasCompletedIntro(false);
    runIntroSequence(0, 1);
  };

  // Scenario selection & playback
  const handleSelectScenario = (scenarioId) => {
    if (scenarioTimerRef.current) clearTimeout(scenarioTimerRef.current);
    setSelectedScenarioId(scenarioId);
    setIsScenarioPlaying(true);
    setScenarioStepIdx(0);
    setHasPlayedScenario(true);
    trackEvent('ocd_scenario_selected', { scenario: scenarioId });

    advanceScenario(0, scenarioId);
  };

  const advanceScenario = (idx, scenarioId) => {
    setScenarioStepIdx(idx);
    const duration = prefersReducedMotion ? 800 : 1600;

    if (idx < 4) {
      scenarioTimerRef.current = setTimeout(() => {
        advanceScenario(idx + 1, scenarioId);
      }, duration);
    } else {
      setIsScenarioPlaying(false);
    }
  };

  const handleReplayScenario = () => {
    if (scenarioTimerRef.current) clearTimeout(scenarioTimerRef.current);
    setIsScenarioPlaying(true);
    setScenarioStepIdx(0);
    trackEvent('ocd_scenario_replayed', { scenario: selectedScenarioId });
    advanceScenario(0, selectedScenarioId);
  };

  const handleChooseResponse = (choice) => {
    setResponseChoice(choice);
    trackEvent('ocd_response_selected', { choice });
  };

  const handleSelectCompulsionCategory = (cat) => {
    setCompulsionCategory(cat);
    trackEvent('ocd_compulsion_type_explored', { category: cat });
  };

  const handleMarkAsDone = async () => {
    if (isCompleted || isCompleting) return;
    setIsCompleting(true);
    setCompletionError(null);

    try {
      const success = await completeLesson(LESSON_ID);
      if (success) {
        setIsCompleted(true);
        handleActionComplete();
        trackEvent('ocd_activity_completed');
        setTimeout(() => {
          goToDashboard();
        }, 600);
      } else {
        setCompletionError(
          t('next_step.error_save', {
            defaultValue: 'We couldn\'t save your progress right now. Progress is saved locally.'
          })
        );
      }
    } catch (err) {
      setCompletionError(
        t('next_step.error_save', {
          defaultValue: 'We couldn\'t save your progress right now. Progress is saved locally.'
        })
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const activeScenario =
    SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  // Intro loop active phrase lookup
  const getIntroPhrase = () => {
    const stageId = STAGES[introStepIdx]?.id || 'thought';
    const cycleKey = introCycle === 1 ? 'cycle_1' : 'cycle_2';
    return t(`loop.${cycleKey}.${stageId}`, {
      defaultValue:
        introCycle === 1
          ? stageId === 'thought'
            ? '“What if I didn\'t lock the door?”'
            : stageId === 'uncertainty'
            ? '“Did I really lock it?”'
            : stageId === 'response'
            ? '“Check again.”'
            : '“Okay. I feel better.”'
          : stageId === 'thought'
          ? '“Wait... but did I really check properly?”'
          : stageId === 'uncertainty'
          ? '“I need to be certain.”'
          : stageId === 'response'
          ? '“Check one more time.”'
          : '“Temporary relief...”'
    });
  };

  // Scenario active phrase lookup
  const getScenarioStageText = () => {
    if (scenarioStepIdx === 0) return t(activeScenario.thoughtKey, { defaultValue: activeScenario.defaultThought });
    if (scenarioStepIdx === 1) return t(activeScenario.uncertaintyKey, { defaultValue: activeScenario.defaultUncertainty });
    if (scenarioStepIdx === 2) return t(activeScenario.responseKey, { defaultValue: activeScenario.defaultResponse });
    if (scenarioStepIdx === 3) return t(activeScenario.reliefKey, { defaultValue: activeScenario.defaultRelief });
    return t(activeScenario.returnKey, { defaultValue: activeScenario.defaultReturn });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#FAF9F6',
        color: '#0B1528',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Roboto, sans-serif",
        overflowX: 'hidden'
      }}
    >
      {/* 1. EDITORIAL HEADER */}
      <header
        style={{
          height: '64px',
          padding: '0 clamp(16px, 4vw, 32px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'rgba(250, 249, 246, 0.94)',
          backdropFilter: 'blur(12px)',
          zIndex: 50,
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)'
        }}
      >
        <button
          type="button"
          onClick={onBack || handleExit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            padding: '8px 0',
            fontSize: '0.92rem',
            fontWeight: 650,
            color: '#64748B',
            cursor: 'pointer'
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
          <span>{t('header_back', { defaultValue: 'Back' })}</span>
        </button>

        <img
          src={OCDMANTRA_LOGO_URL}
          alt="OCDMantra"
          style={{
            height: 'clamp(25px, 5.5vw, 28px)',
            width: 'auto',
            objectFit: 'contain',
            opacity: 0.95
          }}
        />

        <div style={{ width: '48px' }} />
      </header>

      {/* MAIN STORY CONTAINER */}
      <main
        style={{
          maxWidth: '920px',
          width: '100%',
          margin: '0 auto',
          padding: '0 clamp(16px, 3.5vw, 32px) 96px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(28px, 4.5vh, 44px)'
        }}
      >
        {/* ========================================================= */}
        {/* STAGE 1: EXPERIENCE — MINIMAL OPENING & THE CONTINUOUS LOOP */}
        {/* ========================================================= */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: 'clamp(16px, 4vw, 40px)',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0284C7',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                padding: '4px 10px',
                borderRadius: '9999px',
                marginBottom: '12px'
              }}
            >
              {t('stages.step_experience', { defaultValue: '01 Experience' })}
            </span>
            <h1
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 2.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#0B1528',
                margin: '0 0 8px 0'
              }}
            >
              {t('hero.title', { defaultValue: 'Inside an OCD Loop' })}
            </h1>
            <p
              style={{
                fontSize: 'clamp(0.98rem, 2vw, 1.12rem)',
                color: '#64748B',
                lineHeight: 1.45,
                margin: 0,
                fontWeight: 450
              }}
            >
              {t('hero.subtitle', {
                defaultValue: 'See how a thought can turn into a cycle.'
              })}
            </p>
          </div>

          {/* Organic Circular Diagram */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              aspectRatio: '1.28 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '8px auto 16px',
              padding: '0'
            }}
          >
            <svg
              viewBox="0 0 500 380"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '380px',
                overflow: 'visible'
              }}
            >
              <defs>
                <linearGradient id="ocdLoopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="50%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>

              {/* Background Circular Path (cx=250, cy=190, r=125) */}
              <circle
                cx="250"
                cy="190"
                r="125"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />

              {/* Active Step Indicator Pulse Orbit */}
              <circle
                cx="250"
                cy="190"
                r="125"
                fill="none"
                stroke="url(#ocdLoopGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="785"
                strokeDashoffset={785 - (introStepIdx + 1) * (785 / 4)}
                style={{
                  transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />

              {/* Interactive Stage Nodes (Subtle Orbit Markers) */}
              {/* TOP: Thought */}
              <circle
                cx="250"
                cy="65"
                r={introStepIdx === 0 ? 8 : 4.5}
                fill={introStepIdx === 0 ? '#0284C7' : '#CBD5E1'}
                style={{ transition: 'all 0.3s ease' }}
              />
              {/* RIGHT: Uncertainty */}
              <circle
                cx="375"
                cy="190"
                r={introStepIdx === 1 ? 8 : 4.5}
                fill={introStepIdx === 1 ? '#0284C7' : '#CBD5E1'}
                style={{ transition: 'all 0.3s ease' }}
              />
              {/* BOTTOM: Response */}
              <circle
                cx="250"
                cy="315"
                r={introStepIdx === 2 ? 8 : 4.5}
                fill={introStepIdx === 2 ? '#0284C7' : '#CBD5E1'}
                style={{ transition: 'all 0.3s ease' }}
              />
              {/* LEFT: Relief */}
              <circle
                cx="125"
                cy="190"
                r={introStepIdx === 3 ? 8 : 4.5}
                fill={introStepIdx === 3 ? '#0284C7' : '#CBD5E1'}
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Animated Glowing Pulse Marker on Active Node */}
              {!prefersReducedMotion && (
                <circle
                  cx={
                    introStepIdx === 0
                      ? 250
                      : introStepIdx === 1
                      ? 375
                      : introStepIdx === 2
                      ? 250
                      : 125
                  }
                  cy={
                    introStepIdx === 0
                      ? 65
                      : introStepIdx === 1
                      ? 190
                      : introStepIdx === 2
                      ? 315
                      : 190
                  }
                  r="6"
                  fill="#0284C7"
                  style={{
                    transition:
                      'cx 0.6s cubic-bezier(0.16, 1, 0.3, 1), cy 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              )}

              {/* Symmetrical Stage Labels - Perfectly placed with guaranteed margin */}
              {/* TOP: Thought */}
              <text
                x="250"
                y="32"
                textAnchor="middle"
                dominantBaseline="central"
                fill={introStepIdx === 0 ? '#0284C7' : '#94A3B8'}
                fontWeight={introStepIdx === 0 ? '800' : '600'}
                fontSize="14"
                letterSpacing="-0.01em"
                style={{ transition: 'fill 0.3s ease, font-weight 0.3s ease' }}
              >
                {t('loop.stages.thought', { defaultValue: 'Thought' })}
              </text>

              {/* RIGHT: Uncertainty (Placed at x=396 with 104px margin inside 500px viewBox) */}
              <text
                x="396"
                y="190"
                textAnchor="start"
                dominantBaseline="central"
                fill={introStepIdx === 1 ? '#0284C7' : '#94A3B8'}
                fontWeight={introStepIdx === 1 ? '800' : '600'}
                fontSize="14"
                letterSpacing="-0.01em"
                style={{ transition: 'fill 0.3s ease, font-weight 0.3s ease' }}
              >
                {t('loop.stages.uncertainty', { defaultValue: 'Uncertainty' })}
              </text>

              {/* BOTTOM: Response */}
              <text
                x="250"
                y="348"
                textAnchor="middle"
                dominantBaseline="central"
                fill={introStepIdx === 2 ? '#0284C7' : '#94A3B8'}
                fontWeight={introStepIdx === 2 ? '800' : '600'}
                fontSize="14"
                letterSpacing="-0.01em"
                style={{ transition: 'fill 0.3s ease, font-weight 0.3s ease' }}
              >
                {t('loop.stages.response', { defaultValue: 'Response' })}
              </text>

              {/* LEFT: Relief (Placed at x=104 with 104px margin inside 500px viewBox) */}
              <text
                x="104"
                y="190"
                textAnchor="end"
                dominantBaseline="central"
                fill={introStepIdx === 3 ? '#0284C7' : '#94A3B8'}
                fontWeight={introStepIdx === 3 ? '800' : '600'}
                fontSize="14"
                letterSpacing="-0.01em"
                style={{ transition: 'fill 0.3s ease, font-weight 0.3s ease' }}
              >
                {t('loop.stages.relief', { defaultValue: 'Relief' })}
              </text>
            </svg>
          </div>

          {/* Focal Story Display: Positioned Cleanly Below Loop with 100% Width Freedom */}
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              minHeight: '72px',
              justifyContent: 'center',
              padding: '0 16px',
              margin: '0 auto'
            }}
          >
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0284C7'
              }}
            >
              {STAGES[introStepIdx]?.defaultLabel || 'Thought'}
            </span>

            <AnimatePresence mode="wait">
              <motion.p
                key={`${introStepIdx}-${introCycle}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: 'clamp(1.1rem, 2.8vw, 1.35rem)',
                  fontWeight: 750,
                  lineHeight: 1.35,
                  color: '#0B1528',
                  margin: 0
                }}
              >
                {getIntroPhrase()}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Automatic Conclusion / Stop Moment */}
          {hasCompletedIntro && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px dashed #E2E8F0',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0B1528' }}>
                {t('loop.notice_prompt', { defaultValue: 'Did you notice it?' })}
              </span>
              <span style={{ fontSize: '0.92rem', color: '#64748B' }}>
                {t('loop.notice_detail', { defaultValue: 'The relief was real, but the doubt came back.' })}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleReplayIntro}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '6px 14px',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Replay cycle</span>
                </button>
              </div>
            </motion.div>
          )}
        </section>

        {/* ========================================================= */}
        {/* STAGE 2: RECOGNIZE — NOW MAKE IT YOURS (SCENARIO ENTRY)   */}
        {/* ========================================================= */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: 'clamp(24px, 4.5vw, 40px)',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0284C7',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                padding: '4px 10px',
                borderRadius: '9999px',
                marginBottom: '12px'
              }}
            >
              {t('stages.step_recognize', { defaultValue: '02 Recognize' })}
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#0B1528',
                margin: '0 0 6px 0'
              }}
            >
              {t('scenarios.heading', { defaultValue: 'Now make it yours.' })}
            </h2>
            <p
              style={{
                fontSize: '0.96rem',
                color: '#64748B',
                lineHeight: 1.45,
                margin: 0
              }}
            >
              {t('scenarios.subheading', {
                defaultValue: 'Select a recognizable scenario to watch it move through the loop.'
              })}
            </p>
          </div>

          {/* Horizontal Editorial List (Non-card layout) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderTop: '1px solid #E2E8F0',
              marginBottom: '20px'
            }}
          >
            {SCENARIOS.map((sc) => {
              const isSelected = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '14px 4px',
                    background: isSelected ? 'rgba(2, 132, 199, 0.03)' : 'none',
                    border: 'none',
                    borderBottom: '1px solid #E2E8F0',
                    borderRadius: '4px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    opacity: isSelected ? 1 : 0.65,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 750,
                        color: isSelected ? '#0284C7' : '#0B1528',
                        minWidth: '130px'
                      }}
                    >
                      {t(sc.nameKey, { defaultValue: sc.defaultName })}
                    </span>
                    <span
                      style={{
                        fontSize: '0.94rem',
                        fontWeight: isSelected ? 550 : 450,
                        color: isSelected ? '#0B1528' : '#64748B'
                      }}
                    >
                      {t(sc.phraseKey, { defaultValue: sc.defaultPhrase })}
                    </span>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284C7' }}>
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scenario In-Loop Transition Animation - Distinct Card Container */}
          <div
            style={{
              marginTop: '8px',
              padding: '22px 20px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {scenarioStepIdx < 4 ? STAGES[scenarioStepIdx]?.defaultLabel : 'Doubt Returns'}
              </span>

              {hasPlayedScenario && !isScenarioPlaying && (
                <button
                  type="button"
                  onClick={handleReplayScenario}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: '#0284C7',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={13} />
                  <span>{t('snapshot.replay_btn', { defaultValue: 'Replay scenario' })}</span>
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={`${selectedScenarioId}-${scenarioStepIdx}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
                  fontWeight: 750,
                  color: '#0B1528',
                  margin: 0,
                  lineHeight: 1.35
                }}
              >
                {getScenarioStageText()}
              </motion.p>
            </AnimatePresence>

            {scenarioStepIdx === 4 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.4 }}
              >
                {t('scenarios.doubt_return_label', { defaultValue: 'The doubt returns:' })}{' '}
                The pattern reset itself.
              </motion.span>
            )}
          </div>

          {/* Pattern Snapshot (Editorial Visual Summary in 1 line) */}
          <div
            style={{
              marginTop: '22px',
              padding: '20px 0 4px',
              borderTop: '1px dashed #CBD5E1',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('snapshot.title', { defaultValue: 'Your Loop Snapshot' })}
            </span>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px'
              }}
            >
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid #F1F5F9'
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  {t('snapshot.thought_label', { defaultValue: 'Thought' })}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 650, color: '#0B1528', lineHeight: 1.35, display: 'block' }}>
                  {t(activeScenario.thoughtKey, { defaultValue: activeScenario.defaultThought })}
                </span>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid #F1F5F9'
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  {t('snapshot.uncertainty_label', { defaultValue: 'Uncertainty' })}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 650, color: '#0B1528', lineHeight: 1.35, display: 'block' }}>
                  {t(activeScenario.uncertaintyKey, { defaultValue: activeScenario.defaultUncertainty })}
                </span>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid #F1F5F9'
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  {t('snapshot.response_label', { defaultValue: 'Response' })}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 650, color: '#0B1528', lineHeight: 1.35, display: 'block' }}>
                  {t(activeScenario.responseKey, { defaultValue: activeScenario.defaultResponse })}
                </span>
              </div>

              <div
                style={{
                  background: '#F0FDF4',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid #DCFCE7'
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  {t('snapshot.effect_label', { defaultValue: 'Short-term effect' })}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 650, color: '#15803D', lineHeight: 1.35, display: 'block' }}>
                  {t(activeScenario.reliefKey, { defaultValue: activeScenario.defaultRelief })}
                </span>
              </div>

              <div
                style={{
                  background: '#F0F9FF',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  border: '1px solid #E0F2FE'
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                  {t('snapshot.next_label', { defaultValue: 'What happens next' })}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 650, color: '#0369A1', lineHeight: 1.35, display: 'block' }}>
                  {t(activeScenario.returnKey, { defaultValue: activeScenario.defaultReturn })}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* STAGE 3: PRACTICE NOTICING — THE RESPONSE POINT           */}
        {/* ========================================================= */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: 'clamp(24px, 4.5vw, 40px)',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0284C7',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                padding: '4px 10px',
                borderRadius: '9999px',
                marginBottom: '12px'
              }}
            >
              {t('stages.step_practice', { defaultValue: '03 Practice Noticing' })}
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#0B1528',
                margin: '0 0 6px 0'
              }}
            >
              {t('response_point.heading', {
                defaultValue: 'Here is where the pattern gets interesting.'
              })}
            </h2>
            <p
              style={{
                fontSize: '0.96rem',
                color: '#64748B',
                lineHeight: 1.45,
                margin: 0
              }}
            >
              {t('response_point.subheading', {
                defaultValue:
                  'You may not control the thought or the uncertainty. But you can notice what happens next.'
              })}
            </p>
          </div>

          {/* Scenario Trigger & 2 Quiet Deliberate Choices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0B1528' }}>
              {t(activeScenario.thoughtKey, { defaultValue: activeScenario.defaultThought })}
            </span>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px'
              }}
            >
              <button
                type="button"
                onClick={() => handleChooseResponse('check')}
                style={{
                  padding: '18px 20px',
                  background: responseChoice === 'check' ? '#F0F9FF' : '#F8FAFC',
                  border: responseChoice === 'check' ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                  borderRadius: '14px',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: 750,
                  color: responseChoice === 'check' ? '#0284C7' : '#0B1528',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t('response_point.choice_check', { defaultValue: 'Check again' })}
              </button>

              <button
                type="button"
                onClick={() => handleChooseResponse('notice')}
                style={{
                  padding: '18px 20px',
                  background: responseChoice === 'notice' ? '#F0F9FF' : '#F8FAFC',
                  border: responseChoice === 'notice' ? '1.5px solid #0284C7' : '1px solid #E2E8F0',
                  borderRadius: '14px',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: 750,
                  color: responseChoice === 'notice' ? '#0284C7' : '#0B1528',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t('response_point.choice_notice', { defaultValue: 'Notice the urge' })}
              </button>
            </div>

            {/* Consequence Output */}
            {responseChoice && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '8px',
                  padding: '18px 20px',
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase' }}>
                  {responseChoice === 'check'
                    ? t('response_point.check_result_title', { defaultValue: 'The automatic response' })
                    : t('response_point.notice_result_title', { defaultValue: 'The pause' })}
                </span>
                <p style={{ fontSize: '0.98rem', lineHeight: 1.5, color: '#1E293B', margin: 0 }}>
                  {responseChoice === 'check'
                    ? t('response_point.check_result_body', {
                        defaultValue: 'The checking brought relief. The doubt returned.'
                      })
                    : t('response_point.notice_result_body', {
                        defaultValue:
                          'The uncertainty may still feel uncomfortable. Noticing the urge gives you a moment before automatically responding.'
                      })}
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* STAGE 4: EXPLORE — COMPULSIONS & RECOGNIZABLE PATTERNS   */}
        {/* ========================================================= */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: 'clamp(24px, 4.5vw, 40px)',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0284C7',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                padding: '4px 10px',
                borderRadius: '9999px',
                marginBottom: '12px'
              }}
            >
              {t('stages.step_explore', { defaultValue: '04 Explore' })}
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#0B1528',
                margin: 0
              }}
            >
              {t('compulsions.statement', { defaultValue: 'Compulsions aren\'t always something you do.' })}
            </h2>
          </div>

          {/* Large Typographic Words (Outward vs Inward) - Centered */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '36px', marginBottom: '22px' }}>
            <button
              type="button"
              onClick={() => handleSelectCompulsionCategory('outward')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0 0 4px 0',
                fontSize: '1.25rem',
                fontWeight: 850,
                color: compulsionCategory === 'outward' ? '#0284C7' : '#94A3B8',
                borderBottom: compulsionCategory === 'outward' ? '2.5px solid #0284C7' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('compulsions.tab_outward', { defaultValue: 'Outward' })}
            </button>

            <button
              type="button"
              onClick={() => handleSelectCompulsionCategory('inward')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0 0 4px 0',
                fontSize: '1.25rem',
                fontWeight: 850,
                color: compulsionCategory === 'inward' ? '#0284C7' : '#94A3B8',
                borderBottom: compulsionCategory === 'inward' ? '2.5px solid #0284C7' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t('compulsions.tab_inward', { defaultValue: 'Inward' })}
            </button>
          </div>

          {/* Revealed Examples - Centered List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '32px',
              textAlign: 'center'
            }}
          >
            {compulsionCategory === 'outward' ? (
              ['Checking', 'Washing', 'Repeating'].map((item, idx) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1E293B' }}
                >
                  {item}
                </motion.span>
              ))
            ) : (
              ['Replaying', 'Reviewing', 'Analyzing', 'Seeking certainty'].map((item, idx) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1E293B' }}
                >
                  {item}
                </motion.span>
              ))
            )}
          </div>

          {/* Recognizable Patterns Moment */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '22px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '14px' }}>
              {t('recognition.heading', { defaultValue: 'You might notice the pattern as…' })}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', fontWeight: 650, color: '#1E293B' }}>
                <span>Check</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span>Relief</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#0284C7' }}>Doubt</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', fontWeight: 650, color: '#1E293B' }}>
                <span>Replay</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span>Certainty</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#0284C7' }}>Doubt</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.94rem', fontWeight: 650, color: '#1E293B' }}>
                <span>Avoid</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span>Relief</span>
                <span style={{ color: '#94A3B8' }}>→</span>
                <span style={{ color: '#0284C7' }}>Fear returns</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* STAGE 5: TAKE SOMETHING WITH YOU — PERSONALIZED TAKEAWAY  */}
        {/* ========================================================= */}
        <section
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
            border: '1.5px solid #BAE6FD',
            borderRadius: '24px',
            padding: 'clamp(28px, 5vw, 44px)',
            boxShadow: '0 4px 20px rgba(2, 132, 199, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0284C7',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: '1px solid #BAE6FD',
              padding: '4px 10px',
              borderRadius: '9999px',
              width: 'fit-content'
            }}
          >
            {t('takeaway.tag', { defaultValue: 'Your Takeaway' })}
          </span>

          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 850,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: '#0B1528',
              margin: '0 0 4px 0'
            }}
          >
            {t('takeaway.main_headline', { defaultValue: 'The thought isn\'t the loop.' })}
          </h2>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0284C7', margin: 0 }}>
            {t('takeaway.sub_headline', { defaultValue: 'Notice what happens next.' })}
          </span>

          {/* Personalized Scenario Takeaway */}
          <div
            style={{
              marginTop: '10px',
              padding: '20px',
              background: '#FFFFFF',
              border: '1px solid #E0F2FE',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <p style={{ fontSize: '1.02rem', fontStyle: 'italic', color: '#1E293B', margin: 0, lineHeight: 1.4 }}>
              “{t(activeScenario.takeawayQuoteKey, { defaultValue: activeScenario.defaultTakeawayQuote })}”
            </p>
            <p style={{ fontSize: '0.92rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
              {t(activeScenario.takeawayActionKey, { defaultValue: activeScenario.defaultTakeawayAction })}
            </p>
          </div>

          <p style={{ fontSize: '0.92rem', color: '#64748B', margin: '4px 0 0 0' }}>
            {t('takeaway.closing', {
              defaultValue: 'Understanding the pattern is the first step toward recognizing it in real life.'
            })}
          </p>
        </section>

        {/* ========================================================= */}
        {/* COMPLETION ACTION                                         */}
        {/* ========================================================= */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: 'clamp(32px, 5vw, 44px) 24px',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px'
          }}
        >
          <h3
            style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.45rem)',
              fontWeight: 800,
              color: '#0B1528',
              margin: 0
            }}
          >
            {t('next_step.prompt_title', { defaultValue: "Ready for what's next?" })}
          </h3>
          <p
            style={{
              fontSize: '0.94rem',
              color: '#64748B',
              margin: '0 0 8px 0',
              maxWidth: '460px',
              lineHeight: 1.45
            }}
          >
            {t('next_step.prompt_desc', {
              defaultValue: 'Mark this activity as completed to save your progress and continue your pathway.'
            })}
          </p>

          {isCompleted ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                fontWeight: 750,
                color: '#16A34A',
                background: '#F0FDF4',
                border: '1.5px solid #86EFAC',
                borderRadius: '9999px',
                padding: '14px 28px'
              }}
            >
              <CheckCircle2 size={20} />
              <span>{t('next_step.completed_badge', { defaultValue: 'Activity Completed' })}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMarkAsDone}
              disabled={isCompleting}
              style={{
                background: '#0284C7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '15px 36px',
                fontSize: '1rem',
                fontWeight: 750,
                cursor: isCompleting ? 'not-allowed' : 'pointer',
                opacity: isCompleting ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isCompleting ? (
                <span>{t('next_step.saving', { defaultValue: 'Saving...' })}</span>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{t('next_step.btn_complete', { defaultValue: 'Mark Activity as Done' })}</span>
                </>
              )}
            </button>
          )}

          {completionError && (
            <span style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: '4px' }}>
              {completionError}
            </span>
          )}
        </section>
      </main>
    </div>
  );
}
