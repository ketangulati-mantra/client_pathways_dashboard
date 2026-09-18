import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Check,
  CheckCircle2,
  Heart,
  Smile,
  Building,
  GraduationCap,
  Shield,
  LifeBuoy,
  Users,
  MessageCircle,
  Phone,
  UserCheck,
  Sparkles
} from 'lucide-react';
import {
  logUserActivityToDB,
  saveUserLessonProgress,
  getUserLessonProgress,
  recordUserPersonalizationSignal
} from '../services/activityLogger';
import { completeLesson } from '../mantra/api';
import { handleExit, goToDashboard } from '../mantra/navigation';
import { getActiveUserId } from '../services/authService';

// ==========================================
// DATA DEFINITIONS
// ==========================================

// Step 1: 2-Column Relationship Tiles
export interface RelationshipOption {
  id: string;
  labelKey: string;
  descKey: string;
  icon: React.ReactNode;
}

export const RELATIONSHIP_OPTIONS: RelationshipOption[] = [
  {
    id: 'family',
    labelKey: 'relationships.family_label',
    descKey: 'relationships.family_desc',
    icon: <Heart size={18} strokeWidth={2.2} />
  },
  {
    id: 'friend',
    labelKey: 'relationships.friend_label',
    descKey: 'relationships.friend_desc',
    icon: <Smile size={18} strokeWidth={2.2} />
  },
  {
    id: 'partner',
    labelKey: 'relationships.partner_label',
    descKey: 'relationships.partner_desc',
    icon: <Heart size={18} strokeWidth={2.2} />
  },
  {
    id: 'colleague',
    labelKey: 'relationships.colleague_label',
    descKey: 'relationships.colleague_desc',
    icon: <Building size={18} strokeWidth={2.2} />
  },
  {
    id: 'mentor',
    labelKey: 'relationships.mentor_label',
    descKey: 'relationships.mentor_desc',
    icon: <GraduationCap size={18} strokeWidth={2.2} />
  },
  {
    id: 'trusted_adult',
    labelKey: 'relationships.trusted_adult_label',
    descKey: 'relationships.trusted_adult_desc',
    icon: <Shield size={18} strokeWidth={2.2} />
  },
  {
    id: 'professional',
    labelKey: 'relationships.professional_label',
    descKey: 'relationships.professional_desc',
    icon: <LifeBuoy size={18} strokeWidth={2.2} />
  },
  {
    id: 'someone_else',
    labelKey: 'relationships.someone_else_label',
    descKey: 'relationships.someone_else_desc',
    icon: <Users size={18} strokeWidth={2.2} />
  }
];

// Step 2: Large Flowing Support Tags
export interface SupportTypeTag {
  id: string;
  titleKey: string;
  signalTag: string;
}

export const SUPPORT_TAGS: SupportTypeTag[] = [
  { id: 'just_listening', titleKey: 'support_tags.just_listening', signalTag: 'support_prefers_listening' },
  { id: 'company', titleKey: 'support_tags.company', signalTag: 'support_prefers_presence' },
  { id: 'advice', titleKey: 'support_tags.advice', signalTag: 'support_prefers_advice' },
  { id: 'a_distraction', titleKey: 'support_tags.a_distraction', signalTag: 'support_prefers_distraction' },
  { id: 'reassurance', titleKey: 'support_tags.reassurance', signalTag: 'support_prefers_reassurance' },
  { id: 'practical_help', titleKey: 'support_tags.practical_help', signalTag: 'support_prefers_practical' },
  { id: 'not_sure_yet', titleKey: 'support_tags.not_sure_yet', signalTag: 'support_exploring' }
];

// Step 4: Support Plan Row Options
export interface ReachOutRowOption {
  id: string;
  titleKey: string;
  icon: React.ReactNode;
  planSentenceKey: string;
  signalTag: string;
}

export const REACH_OUT_ROWS: ReachOutRowOption[] = [
  {
    id: 'send_message',
    titleKey: 'plans.send_message_title',
    icon: <MessageCircle size={18} />,
    planSentenceKey: 'plans.send_message_sentence',
    signalTag: 'reach_out_text'
  },
  {
    id: 'make_call',
    titleKey: 'plans.make_call_title',
    icon: <Phone size={18} />,
    planSentenceKey: 'plans.make_call_sentence',
    signalTag: 'reach_out_call'
  },
  {
    id: 'meet_in_person',
    titleKey: 'plans.meet_in_person_title',
    icon: <Users size={18} />,
    planSentenceKey: 'plans.meet_in_person_sentence',
    signalTag: 'reach_out_in_person'
  },
  {
    id: 'spend_time',
    titleKey: 'plans.spend_time_title',
    icon: <Heart size={18} />,
    planSentenceKey: 'plans.spend_time_sentence',
    signalTag: 'reach_out_company'
  },
  {
    id: 'professional_first',
    titleKey: 'plans.professional_first_title',
    icon: <LifeBuoy size={18} />,
    planSentenceKey: 'plans.professional_first_sentence',
    signalTag: 'reach_out_professional'
  },
  {
    id: 'not_ready_yet',
    titleKey: 'plans.not_ready_yet_title',
    icon: <Smile size={18} />,
    planSentenceKey: 'plans.not_ready_yet_sentence',
    signalTag: 'reach_out_not_ready'
  }
];

interface MySupportCircleActivityProps {
  onBack?: () => void;
  onNavigate?: (route: string) => void;
  service?: string;
}

export const MySupportCircleActivity: React.FC<MySupportCircleActivityProps> = ({
  onBack,
  onNavigate,
  service = 'therapy'
}) => {
  const { t } = useTranslation('my_support_circle');

  // Navigation:
  // Screen 0: Intro (Decorative opening)
  // Screen 1: Step 01 / 04 (Select People)
  // Screen 2: Step 02 / 04 (Support Types)
  // Screen 3: Step 03 / 04 (Your Support Circle Result)
  // Screen 4: Step 04 / 04 (Support Plan Decision)
  // Screen 5: Final Screen (Calm Reflection)
  const [currentScreen, setCurrentScreen] = useState<number>(0);

  // Selections State
  const [selectedRelationships, setSelectedRelationships] = useState<string[]>([]);
  const [selectedSupportTypes, setSelectedSupportTypes] = useState<string[]>([]);
  const [selectedReachOut, setSelectedReachOut] = useState<string | null>(null);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());
  const initialLoadRef = useRef<boolean>(false);

  // Load saved progress
  useEffect(() => {
    async function loadProgress() {
      if (initialLoadRef.current) return;
      initialLoadRef.current = true;

      try {
        const userId = getActiveUserId();
        const saved = await getUserLessonProgress('mantra21_my_support_circle', userId);

        if (saved && saved.current_step > 0 && saved.current_step <= 5) {
          setCurrentScreen(saved.current_step);
          if (saved.response_data) {
            if (Array.isArray(saved.response_data.selectedRelationships)) {
              setSelectedRelationships(saved.response_data.selectedRelationships);
            }
            if (Array.isArray(saved.response_data.selectedSupportTypes)) {
              setSelectedSupportTypes(saved.response_data.selectedSupportTypes);
            }
            if (saved.response_data.selectedReachOut) {
              setSelectedReachOut(saved.response_data.selectedReachOut);
            }
          }
        }
      } catch (err) {
        console.warn('[SupportCircle] Progress load error:', err);
      }
    }
    loadProgress();
  }, []);

  const saveProgressState = async (
    screenIdx: number,
    nodes: string[],
    types: string[],
    reach: string | null
  ) => {
    try {
      const userId = getActiveUserId();
      await saveUserLessonProgress({
        userId,
        lessonId: 'mantra21_my_support_circle',
        currentStep: screenIdx,
        totalSteps: 6,
        responseData: {
          selectedRelationships: nodes,
          selectedSupportTypes: types,
          selectedReachOut: reach,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (e) {
      console.warn('[SupportCircle] Failed saving progress:', e);
    }
  };

  // Toggle Relationship (Step 1)
  const toggleRelationship = (id: string) => {
    const next = selectedRelationships.includes(id)
      ? selectedRelationships.filter((item) => item !== id)
      : [...selectedRelationships, id];
    setSelectedRelationships(next);
  };

  // Toggle Support Tag (Step 2)
  const toggleSupportType = (id: string) => {
    if (id === 'not_sure_yet') {
      const next = selectedSupportTypes.includes('not_sure_yet') ? [] : ['not_sure_yet'];
      setSelectedSupportTypes(next);
      return;
    }
    const filtered = selectedSupportTypes.filter((item) => item !== 'not_sure_yet');
    const next = filtered.includes(id)
      ? filtered.filter((item) => item !== id)
      : [...filtered, id];
    setSelectedSupportTypes(next);
  };

  // Completion
  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userId = getActiveUserId();
      const completionTimeMs = Date.now() - startTimeRef.current;

      // Log personalization signals
      for (const relId of selectedRelationships) {
        recordUserPersonalizationSignal({
          pathwayId: 'support_network',
          signal: `support_network_${relId}`,
          sourceType: 'micro_activity',
          sourceId: 'my_support_circle'
        }).catch(() => {});
      }

      for (const supId of selectedSupportTypes) {
        const supOpt = SUPPORT_TAGS.find((s) => s.id === supId);
        if (supOpt) {
          recordUserPersonalizationSignal({
            pathwayId: 'support_preferences',
            signal: supOpt.signalTag,
            sourceType: 'micro_activity',
            sourceId: 'my_support_circle'
          }).catch(() => {});
        }
      }

      if (selectedReachOut) {
        const reachOpt = REACH_OUT_ROWS.find((r) => r.id === selectedReachOut);
        if (reachOpt) {
          recordUserPersonalizationSignal({
            pathwayId: 'action_plan',
            signal: reachOpt.signalTag,
            sourceType: 'micro_activity',
            sourceId: 'my_support_circle'
          }).catch(() => {});
        }
      }

      // Complete activity log
      await logUserActivityToDB({
        userId,
        activityId: 'my-support-circle',
        activityType: 'micro_activity',
        lessonId: 'my-support-circle',
        reflection: 'Completed personal support circle mapping',
        resultSummary: {
          selectedRelationships,
          selectedSupportTypes,
          selectedReachOut,
          timeSpentSeconds: Math.round(completionTimeMs / 1000)
        },
        rewardPoints: 25
      });

      // Mark complete in API
      await completeLesson('my-support-circle');

      if (typeof window !== 'undefined') {
        localStorage.setItem(`mantra21_support_circle_completed_${userId}`, 'true');
      }

      setTimeout(() => {
        goToDashboard();
      }, 600);
    } catch (err) {
      console.error('[SupportCircle] Completion error:', err);
      goToDashboard();
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlan = REACH_OUT_ROWS.find((r) => r.id === selectedReachOut);
  const selectedRelObjects = RELATIONSHIP_OPTIONS.filter((r) => selectedRelationships.includes(r.id));

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        backgroundColor: '#FAFAF9',
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 50% -5%, rgba(224, 242, 254, 0.65) 0%, rgba(250, 250, 249, 0) 100%),
          radial-gradient(ellipse 60% 45% at 85% 85%, rgba(240, 249, 255, 0.7) 0%, rgba(250, 250, 249, 0) 100%)
        `,
        color: '#0F172A',
        fontFamily: "'Plus Jakarta Sans', 'Outfit', 'Inter', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      {/* HEADER */}
      <header
        style={{
          width: '100%',
          maxWidth: '740px',
          height: '56px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          boxSizing: 'border-box'
        }}
      >
        <button
          onClick={() => {
            if (currentScreen > 0 && currentScreen < 5) {
              setCurrentScreen(currentScreen - 1);
            } else if (onBack) {
              onBack();
            } else if (onNavigate) {
              onNavigate('/challenges');
            } else {
              handleExit();
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748B',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: '8px',
            transition: 'color 0.15s ease'
          }}
        >
          <ArrowLeft size={16} />
          <span>{currentScreen > 0 && currentScreen < 5 ? t('btn_back') : t('btn_exit')}</span>
        </button>

        {/* STEP PROGRESS INDICATOR (EXACTLY 01/04 TO 04/04) */}
        <div style={{ minWidth: '48px', textAlign: 'right' }}>
          {currentScreen >= 1 && currentScreen <= 4 ? (
            <span
              style={{
                fontSize: '0.84rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: '#0284C7'
              }}
            >
              0{currentScreen} / 04
            </span>
          ) : null}
        </div>
      </header>

      {/* TOP PROGRESS LINE */}
      <div
        style={{
          width: '100%',
          maxWidth: '740px',
          padding: '0 20px',
          boxSizing: 'border-box',
          marginBottom: '16px',
          zIndex: 20,
          opacity: currentScreen >= 1 && currentScreen <= 4 ? 1 : 0,
          pointerEvents: currentScreen >= 1 && currentScreen <= 4 ? 'auto' : 'none',
          transition: 'opacity 0.2s ease'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '3px',
            backgroundColor: 'rgba(226, 232, 240, 0.8)',
            borderRadius: '999px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#0284C7',
              borderRadius: '999px',
              width: `${(Math.min(4, Math.max(1, currentScreen)) / 4) * 100}%`,
              transition: 'width 0.35s ease'
            }}
          />
        </div>
      </div>

      {/* MAIN CONTENT CANVAS */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '740px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '8px 20px 48px 20px',
          boxSizing: 'border-box',
          zIndex: 10
        }}
      >
        <AnimatePresence mode="wait">
          {/* ========================================================== */}
          {/* SCREEN 0: INTRO SCREEN (EDITORIAL & BALANCED)              */}
          {/* ========================================================== */}
          {currentScreen === 0 && (
            <motion.div
              key="intro_screen"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              style={{
                width: '100%',
                maxWidth: '620px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                paddingTop: '16px'
              }}
            >
              {/* EYEBROW */}
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#0284C7',
                  textTransform: 'uppercase',
                  marginBottom: '14px'
                }}
              >
                {t('day_1')}
              </div>

              {/* HEADLINE */}
              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
                  fontWeight: 900,
                  lineHeight: 1.06,
                  letterSpacing: '-0.04em',
                  color: '#0F172A',
                  margin: '0 0 16px 0',
                  whiteSpace: 'pre-line'
                }}
              >
                {t('title')}
              </h1>

              {/* QUESTION */}
              <p
                style={{
                  fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
                  fontWeight: 600,
                  color: '#0284C7',
                  margin: '0 0 14px 0',
                  lineHeight: 1.4,
                  maxWidth: '520px'
                }}
              >
                {t('intro_quote')}
              </p>

              {/* SUPPORTING TEXT */}
              <p
                style={{
                  fontSize: 'clamp(0.92rem, 2vw, 1.02rem)',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: '0 0 28px 0',
                  maxWidth: '540px'
                }}
              >
                {t('intro_desc')}
              </p>

              {/* DECORATIVE STATIC VISUAL */}
              <div
                style={{
                  width: '160px',
                  height: '160px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px auto'
                }}
              >
                {/* ORBIT RING */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    border: '1.5px dashed rgba(186, 230, 253, 0.85)'
                  }}
                />

                {/* SATELLITE DOTS */}
                {[-60, 30, 120, 210].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const x = Math.cos(rad) * 65;
                  const y = Math.sin(rad) * 65;
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#BAE6FD',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)'
                      }}
                    />
                  );
                })}

                {/* CENTER "YOU" NODE */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.84rem',
                    letterSpacing: '0.06em',
                    boxShadow: '0 6px 18px rgba(2, 132, 199, 0.3)',
                    zIndex: 2
                  }}
                >
                  {t('you')}
                </div>
              </div>

              {/* METADATA */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#64748B',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  marginBottom: '24px'
                }}
              >
                <Clock size={14} />
                <span>{t('duration')}</span>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentScreen(1);
                  saveProgressState(1, selectedRelationships, selectedSupportTypes, selectedReachOut);
                }}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  height: '52px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
                  transition: 'background 0.2s'
                }}
              >
                <span>{t('btn_build_circle')}</span>
                <ArrowRight size={17} />
              </motion.button>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 1: STEP 1 - SELECT PEOPLE (VERTICAL LENGTH FLOW)    */}
          {/* ========================================================== */}
          {currentScreen === 1 && (
            <motion.div
              key="screen_1_people"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              style={{
                width: '100%',
                maxWidth: '640px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {/* EYEBROW */}
              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#0284C7',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                {t('step_1_eyebrow')}
              </div>

              {/* TITLE */}
              <h2
                style={{
                  fontSize: 'clamp(1.9rem, 5vw, 2.7rem)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                  margin: '0 0 10px 0',
                  whiteSpace: 'pre-line'
                }}
              >
                {t('step_1_title')}
              </h2>

              {/* SUBTITLE */}
              <p
                style={{
                  fontSize: 'clamp(0.92rem, 2.2vw, 1.02rem)',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: '0 0 16px 0',
                  maxWidth: '520px'
                }}
              >
                {t('step_1_desc')}
              </p>

              {/* SELECTION COUNT BADGE */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#E0F2FE',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  color: '#0369A1',
                  fontWeight: 700,
                  marginBottom: '24px'
                }}
              >
                <Sparkles size={14} color="#0284C7" />
                <span>
                  {selectedRelationships.length === 0
                    ? t('select_all_apply')
                    : t('count_selected', { count: selectedRelationships.length })}
                </span>
              </div>

              {/* 2-COLUMN TILES GRID */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  width: '100%',
                  marginBottom: '28px'
                }}
              >
                {RELATIONSHIP_OPTIONS.map((item) => {
                  const isSelected = selectedRelationships.includes(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleRelationship(item.id)}
                      style={{
                        padding: '16px 14px',
                        backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                        border: isSelected ? '1.5px solid #0284C7' : '1.5px solid #E2E8F0',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        gap: '6px',
                        boxShadow: isSelected
                          ? '0 4px 16px rgba(2, 132, 199, 0.12)'
                          : '0 2px 6px rgba(15, 23, 42, 0.02)',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      {/* ICON & ACTIVE CHECK */}
                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div
                          style={{
                            color: isSelected ? '#0284C7' : '#94A3B8',
                            transition: 'color 0.18s ease'
                          }}
                        >
                          {item.icon}
                        </div>
                        {isSelected && (
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: '#0284C7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF'
                            }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* LABEL */}
                      <div
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          letterSpacing: '0.03em',
                          color: isSelected ? '#0284C7' : '#0F172A',
                          lineHeight: 1.2
                        }}
                      >
                        {t(item.labelKey)}
                      </div>

                      {/* DESCRIPTION */}
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: isSelected ? '#0369A1' : '#64748B',
                          lineHeight: 1.3
                        }}
                      >
                        {t(item.descKey)}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* CONTINUE CTA */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentScreen(2);
                    saveProgressState(2, selectedRelationships, selectedSupportTypes, selectedReachOut);
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '52px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '0 auto',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
                    transition: 'background 0.2s'
                  }}
                >
                  <span>{t('btn_continue')}</span>
                  <ArrowRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 2: STEP 2 - SUPPORT TYPES (FLOWING PILLS)           */}
          {/* ========================================================== */}
          {currentScreen === 2 && (
            <motion.div
              key="screen_2_types"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              style={{
                width: '100%',
                maxWidth: '640px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {/* EYEBROW */}
              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#0284C7',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                {t('step_2_eyebrow')}
              </div>

              {/* TITLE */}
              <h2
                style={{
                  fontSize: 'clamp(1.9rem, 5vw, 2.7rem)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                  margin: '0 0 12px 0',
                  whiteSpace: 'pre-line'
                }}
              >
                {t('step_2_title')}
              </h2>

              {/* SUBTITLE */}
              <p
                style={{
                  fontSize: 'clamp(0.92rem, 2.2vw, 1.02rem)',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: '0 0 28px 0',
                  maxWidth: '500px'
                }}
              >
                {t('step_2_desc')}
              </p>

              {/* FLOWING SELECTABLE PILLS */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  maxWidth: '600px',
                  marginBottom: '32px'
                }}
              >
                {SUPPORT_TAGS.map((tag) => {
                  const isSelected = selectedSupportTypes.includes(tag.id);
                  return (
                    <motion.button
                      key={tag.id}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleSupportType(tag.id)}
                      style={{
                        padding: '13px 22px',
                        backgroundColor: isSelected ? '#0284C7' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#1E293B',
                        border: isSelected ? '1.5px solid #0284C7' : '1.5px solid #E2E8F0',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isSelected
                          ? '0 6px 20px rgba(2, 132, 199, 0.28)'
                          : '0 2px 6px rgba(15, 23, 42, 0.03)',
                        transition: 'all 0.18s ease'
                      }}
                    >
                      {isSelected && <Check size={14} color="#FFFFFF" />}
                      <span>{t(tag.titleKey)}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* CONTINUE CTA */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentScreen(3);
                    saveProgressState(3, selectedRelationships, selectedSupportTypes, selectedReachOut);
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '52px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '0 auto',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
                    transition: 'background 0.2s'
                  }}
                >
                  <span>{t('btn_view_circle')}</span>
                  <ArrowRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 3: STEP 3 - YOUR SUPPORT CIRCLE (VERTICAL LENGTH)   */}
          {/* ========================================================== */}
          {currentScreen === 3 && (
            <motion.div
              key="screen_3_circle"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              style={{
                width: '100%',
                maxWidth: '640px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {/* EYEBROW */}
              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#0284C7',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                {t('step_3_eyebrow')}
              </div>

              {/* TITLE */}
              <h2
                style={{
                  fontSize: 'clamp(1.9rem, 5vw, 2.7rem)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                  margin: '0 0 10px 0'
                }}
              >
                {t('step_3_title')}
              </h2>

              {/* SUBTITLE */}
              <p
                style={{
                  fontSize: 'clamp(0.92rem, 2.4vw, 1.04rem)',
                  color: '#475569',
                  lineHeight: 1.5,
                  margin: '0 0 24px 0'
                }}
              >
                {t('step_3_desc')}
              </p>

              {/* BOUNDED, COLLISION-FREE RESPONSIVE VISUALIZATION */}
              {selectedRelObjects.length > 0 ? (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '380px',
                    height: '320px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto'
                  }}
                >
                  {/* FAINT BACKGROUND ORBIT RINGS */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '240px',
                      height: '240px',
                      borderRadius: '50%',
                      border: '1.5px dashed rgba(186, 230, 253, 0.8)'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      border: '1px solid rgba(224, 242, 254, 0.9)'
                    }}
                  />

                  {/* SVG CONNECTING LINES (MATCHING EXACT PILL POSITIONS) */}
                  <svg
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                    viewBox="0 0 380 320"
                  >
                    {selectedRelObjects.slice(0, 6).map((item, idx) => {
                      const total = Math.min(selectedRelObjects.length, 6);
                      // Exact circular angle
                      const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                      const radiusX = 125;
                      const radiusY = 110;
                      const cx = 190;
                      const cy = 160;
                      const x = cx + Math.cos(angle) * radiusX;
                      const y = cy + Math.sin(angle) * radiusY;

                      return (
                        <line
                          key={`line_${item.id}`}
                          x1={cx}
                          y1={cy}
                          x2={x}
                          y2={y}
                          stroke="#BAE6FD"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                      );
                    })}
                  </svg>

                  {/* CENTER "YOU" NODE */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.86rem',
                      letterSpacing: '0.08em',
                      boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)',
                      zIndex: 5
                    }}
                  >
                    {t('you')}
                  </div>

                  {/* DETERMINISTIC SATELLITE PILLS */}
                  {selectedRelObjects.slice(0, 6).map((item, idx) => {
                    const total = Math.min(selectedRelObjects.length, 6);
                    const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                    const radiusX = 125;
                    const radiusY = 110;
                    const px = Math.cos(angle) * radiusX;
                    const py = Math.sin(angle) * radiusY;

                    const displayLabel =
                      item.id === 'colleague'
                        ? t('short_labels.colleague')
                        : item.id === 'professional'
                        ? t('short_labels.professional')
                        : item.id === 'someone_else'
                        ? t('short_labels.someone_else')
                        : t(item.labelKey);

                    return (
                      <motion.div
                        key={`pill_${item.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.08, duration: 0.3 }}
                        style={{
                          position: 'absolute',
                          left: `calc(50% + ${px}px - 45px)`,
                          top: `calc(50% + ${py}px - 14px)`,
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #BAE6FD',
                          borderRadius: '999px',
                          padding: '5px 12px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: '#0369A1',
                          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.12)',
                          zIndex: 6,
                          whiteSpace: 'nowrap',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {displayLabel}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* GENTLE NO-SELECTION STATE */
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    maxWidth: '440px',
                    margin: '0 auto 28px auto',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '6px', fontSize: '0.94rem' }}>
                    {t('step_3_empty_title')}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5 }}>
                    {t('step_3_empty_desc')}
                  </div>
                </div>
              )}

              {/* CONTINUE CTA */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentScreen(4);
                    saveProgressState(4, selectedRelationships, selectedSupportTypes, selectedReachOut);
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '52px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '0 auto',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
                    transition: 'background 0.2s'
                  }}
                >
                  <span>{t('btn_create_plan')}</span>
                  <ArrowRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 4: STEP 4 - SUPPORT PLAN (VERTICAL LENGTH)          */}
          {/* ========================================================== */}
          {currentScreen === 4 && (
            <motion.div
              key="screen_4_plan"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              style={{
                width: '100%',
                maxWidth: '600px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {/* EYEBROW */}
              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#0284C7',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                {t('step_4_eyebrow')}
              </div>

              {/* TITLE */}
              <h2
                style={{
                  fontSize: 'clamp(1.9rem, 5vw, 2.7rem)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                  margin: '0 0 10px 0',
                  whiteSpace: 'pre-line'
                }}
              >
                {t('step_4_title')}
              </h2>

              {/* SUBTITLE */}
              <p
                style={{
                  fontSize: 'clamp(0.92rem, 2.2vw, 1.02rem)',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: '0 0 24px 0'
                }}
              >
                {t('step_4_desc')}
              </p>

              {/* SINGLE-CHOICE CLEAN ROWS */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%',
                  marginBottom: '20px'
                }}
              >
                {REACH_OUT_ROWS.map((item) => {
                  const isSelected = selectedReachOut === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedReachOut(item.id)}
                      style={{
                        padding: '15px 18px',
                        backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                        color: isSelected ? '#0284C7' : '#0F172A',
                        border: isSelected ? '1.5px solid #0284C7' : '1.5px solid #E2E8F0',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isSelected
                          ? '0 4px 16px rgba(2, 132, 199, 0.12)'
                          : '0 1px 4px rgba(15, 23, 42, 0.02)',
                        transition: 'all 0.18s ease',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            color: isSelected ? '#0284C7' : '#94A3B8',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {item.icon}
                        </div>
                        <span
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            letterSpacing: '0.03em'
                          }}
                        >
                          {t(item.titleKey)}
                        </span>
                      </div>

                      {isSelected && (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: '#0284C7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF'
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* DYNAMIC RESULT BANNER */}
              {selectedPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1.5px solid #BAE6FD',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    width: '100%',
                    marginBottom: '24px',
                    boxShadow: '0 4px 16px rgba(2, 132, 199, 0.06)',
                    boxSizing: 'border-box'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 900,
                      letterSpacing: '0.1em',
                      color: '#0284C7',
                      textTransform: 'uppercase',
                      marginBottom: '6px'
                    }}
                  >
                    {t('your_support_plan')}
                  </div>
                  <p
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      lineHeight: 1.45,
                      margin: 0
                    }}
                  >
                    “{t(selectedPlan.planSentenceKey)}”
                  </p>
                </motion.div>
              )}

              {/* FINISH CTA */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentScreen(5);
                    saveProgressState(5, selectedRelationships, selectedSupportTypes, selectedReachOut);
                  }}
                  disabled={!selectedReachOut}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '52px',
                    backgroundColor: selectedReachOut ? '#0284C7' : '#CBD5E1',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    cursor: selectedReachOut ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '0 auto',
                    boxShadow: selectedReachOut ? '0 8px 24px rgba(2, 132, 199, 0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{t('btn_finish')}</span>
                  <ArrowRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 5: FINAL REFLECTION & COMPLETION                    */}
          {/* ========================================================== */}
          {currentScreen === 5 && (
            <motion.div
              key="screen_5_final"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                width: '100%',
                maxWidth: '560px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                paddingTop: '16px',
                margin: '0 auto'
              }}
            >
              {/* CHECK ICON */}
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284C7',
                  margin: '0 auto 20px auto',
                  boxShadow: '0 6px 20px rgba(2, 132, 199, 0.12)'
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              {/* HEADLINE */}
              <h1
                style={{
                  fontSize: 'clamp(2rem, 6.5vw, 3rem)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  letterSpacing: '-0.035em',
                  color: '#0F172A',
                  margin: '0 0 14px 0',
                  textAlign: 'center',
                  width: '100%',
                  whiteSpace: 'pre-line'
                }}
              >
                {t('completion.title')}
              </h1>

              {/* SUPPORTING TEXT */}
              <div
                style={{
                  color: '#475569',
                  fontSize: 'clamp(0.92rem, 2.4vw, 1.02rem)',
                  lineHeight: 1.6,
                  margin: '0 0 24px 0'
                }}
              >
                <p style={{ margin: '0 0 6px 0' }}>
                  {t('completion.text_1')}
                </p>
                <p style={{ margin: 0, fontWeight: 500, color: '#1E293B' }}>
                  {t('completion.text_2')}
                </p>
              </div>

              {/* HIGHLIGHTED TAKEAWAY BOX */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1.5px solid #BAE6FD',
                  borderRadius: '18px',
                  padding: '20px 24px',
                  marginBottom: '28px',
                  width: '100%',
                  boxSizing: 'border-box',
                  boxShadow: '0 6px 20px rgba(2, 132, 199, 0.08)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    color: '#0284C7',
                    textTransform: 'uppercase',
                    marginBottom: '6px'
                  }}
                >
                  {t('completion.takeaway_eyebrow')}
                </div>
                <p
                  style={{
                    fontSize: 'clamp(1.05rem, 3vw, 1.25rem)',
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: 1.35,
                    margin: 0
                  }}
                >
                  {t('completion.takeaway_quote')}
                </p>
              </div>

              {/* PRIMARY CTA */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '52px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '0 auto',
                    boxShadow: '0 8px 24px rgba(2, 132, 199, 0.28)',
                    opacity: isSubmitting ? 0.75 : 1
                  }}
                >
                  {isSubmitting ? (
                    <span>{t('btn_saving')}</span>
                  ) : (
                    <>
                      <span>{t('btn_complete')}</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MySupportCircleActivity;
