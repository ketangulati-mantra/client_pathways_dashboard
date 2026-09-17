import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Shield,
  Search,
  Layers,
  Eye,
  Lock,
  Brain,
  Repeat,
  ArrowDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CustomVideoPlayer from '../components/video/CustomVideoPlayer';
import { useLessonCompletion } from '../hooks/useLessonCompletion';
import { handleExit, goToLesson } from '../mantra/navigation';
import { completeLesson } from '../mantra/api';
import { getActiveUserId } from '../services/authService';

const LESSON_ID = 'ocd_what_is_ocd';
const OCDMANTRA_LOGO_URL =
  'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

const VIDEO_CONFIG = {
  videoUrl:
    'https://res.cloudinary.com/hxbamdqf/video/upload/v1789624599/vidssave.com_What_is_OCD__Symptoms_and_Treatment___OCD_Mantra___ocd_treatmentoptions_1080P_u6w3jk.mp4',
  posterUrl:
    'https://res.cloudinary.com/hxbamdqf/image/upload/v1789624719/heUYXs9gYT0-SD_wxzgur.jpg'
};

const THEMES_LIST = [
  {
    id: 'contamination',
    icon: Sparkles,
    nameDefault: 'Contamination',
    descDefault: 'Fears about germs, illness, dirt, or contamination.'
  },
  {
    id: 'harm',
    icon: Shield,
    nameDefault: 'Harm',
    descDefault: 'Unwanted fears about causing or being responsible for harm.'
  },
  {
    id: 'checking',
    icon: Search,
    nameDefault: 'Checking',
    descDefault: 'Repeatedly checking safety, mistakes, doors, appliances, or other concerns.'
  },
  {
    id: 'symmetry',
    icon: Layers,
    nameDefault: 'Symmetry & "Just Right"',
    descDefault: 'Feeling that things need to be balanced, exact, or just right.'
  },
  {
    id: 'taboo',
    icon: Eye,
    nameDefault: 'Intrusive / Taboo Thoughts',
    descDefault: 'Unwanted thoughts involving sexual, religious, aggressive, or other taboo themes.'
  },
  {
    id: 'responsibility',
    icon: Lock,
    nameDefault: 'Responsibility & Doubt',
    descDefault: 'Persistent doubt about mistakes, responsibility, or whether something is truly certain.'
  }
];

export default function WhatIsOcdActivity({ onBack, onNavigate }) {
  const { t } = useTranslation('ocd_what_is_ocd');

  const { handleVideoComplete, handleActionComplete } = useLessonCompletion(
    LESSON_ID,
    onBack,
    {
      hasVideo: true,
      hasAction: true,
      hasQuiz: false
    }
  );

  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionError, setCompletionError] = useState(null);

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

  useEffect(() => {
    trackEvent('activity_started');
  }, []);

  const handleVideoEnded = () => {
    handleVideoComplete();
    trackEvent('video_completed');
  };

  const handleNavigateNext = () => {
    trackEvent('next_activity_clicked', { target: 'ocd-cycle' });
    if (onNavigate) {
      onNavigate('/task/ocd-cycle');
    } else {
      goToLesson('/task/ocd-cycle');
    }
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
        trackEvent('activity_completed');
        setTimeout(() => {
          if (onBack) onBack();
          else handleExit();
        }, 600);
      } else {
        setCompletionError(
          t('completion.error_save', {
            defaultValue:
              "We couldn't save your activity completion right now. Your progress is saved locally."
          })
        );
      }
    } catch (err) {
      setCompletionError(
        t('completion.error_save', {
          defaultValue:
            "We couldn't save your activity completion right now. Your progress is saved locally."
        })
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleBackClick = () => {
    if (onBack) onBack();
    else handleExit();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#FAFAF7',
        color: '#0B1730',
        fontFamily:
          "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflowX: 'hidden'
      }}
    >
      {/* 1. MINIMAL HEADER */}
      <header
        style={{
          height: '54px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'rgba(250, 250, 247, 0.94)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
          zIndex: 50,
          flexShrink: 0
        }}
      >
        <button
          type="button"
          onClick={handleBackClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={14} />
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

        <div style={{ width: '60px' }} />
      </header>

      {/* SECTION 1: HERO */}
      <section
        style={{
          width: '100%',
          background: '#FAFAF7',
          padding: 'clamp(32px, 5vh, 52px) 20px clamp(20px, 3vh, 36px)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            maxWidth: '680px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2.1rem, 4.8vw, 3rem)',
              fontWeight: 850,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#0B1730',
              margin: 0
            }}
          >
            {t('hero.title', { defaultValue: 'What is OCD?' })}
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: '#475569',
              lineHeight: 1.45,
              margin: '2px 0 0',
              fontWeight: 450,
              maxWidth: '560px'
            }}
          >
            {t('hero.subtitle', {
              defaultValue:
                'Understand what OCD is, how it can show up, and why it can feel so convincing.'
            })}
          </p>

          {/* Calm Subtle Floating Thought-Loop Visual */}
          <div
            style={{
              position: 'relative',
              width: '110px',
              height: '110px',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '1.5px dashed rgba(2, 132, 199, 0.35)'
              }}
            />
            <motion.div
              animate={{ y: [-3, 3, -3], scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(234, 246, 255, 0.8) 50%, rgba(186, 230, 253, 0.5) 100%)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7'
              }}
            >
              <Repeat size={22} strokeWidth={2.2} />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: VIDEO */}
      <section
        style={{
          width: '100%',
          background: '#EAF6FF',
          padding: 'clamp(28px, 4.5vh, 48px) 20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0284c7'
            }}
          >
            {t('video.eyebrow', { defaultValue: 'START HERE' })}
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.15rem, 2.8vw, 1.4rem)',
              fontWeight: 800,
              color: '#0B1730',
              margin: 0
            }}
          >
            {t('video.title', {
              defaultValue: 'Watch this short introduction to OCD.'
            })}
          </h2>
        </div>

        {/* Video Player Container */}
        <div
          style={{
            width: '100%',
            maxWidth: '1000px',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 14px 36px rgba(11, 23, 48, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            background: '#090d16'
          }}
        >
          <CustomVideoPlayer
            videoUrl={VIDEO_CONFIG.videoUrl}
            posterUrl={VIDEO_CONFIG.posterUrl}
            onEnded={handleVideoEnded}
          />
        </div>
      </section>

      {/* SECTION 3: OCD IN SIMPLE TERMS */}
      <section
        style={{
          width: '100%',
          background: '#ffffff',
          padding: 'clamp(36px, 5.5vh, 60px) 20px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0284c7'
              }}
            >
              {t('basics.eyebrow', { defaultValue: 'THE BASICS' })}
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3.4vw, 2rem)',
                fontWeight: 800,
                color: '#0B1730',
                letterSpacing: '-0.025em',
                margin: 0
              }}
            >
              {t('basics.headline', {
                defaultValue: 'OCD is more than unwanted thoughts.'
              })}
            </h2>
          </div>

          {/* Connected Flow: Obsession -> Compulsion */}
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {/* 1. Obsessions Object */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
                borderRadius: '20px',
                padding: '24px 22px',
                border: '1px solid #bae6fd',
                boxShadow: '0 4px 20px rgba(2, 132, 199, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#EAF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7'
                }}
              >
                <Brain size={22} />
              </div>
              <span
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: '#0369a1'
                }}
              >
                {t('basics.obsession_title', { defaultValue: 'OBSESSIONS' })}
              </span>
              <p
                style={{
                  fontSize: '0.94rem',
                  color: '#475569',
                  lineHeight: 1.45,
                  margin: 0,
                  fontWeight: 500,
                  maxWidth: '480px'
                }}
              >
                {t('basics.obsession_desc', {
                  defaultValue:
                    'Unwanted thoughts, images, doubts, or urges that can feel difficult to dismiss.'
                })}
              </p>
            </motion.div>

            {/* Connecting Visual */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                padding: '2px 0'
              }}
            >
              <ArrowDown size={20} strokeWidth={2.5} />
            </div>

            {/* 2. Compulsions Object */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #F1EEFF 0%, #ffffff 100%)',
                borderRadius: '20px',
                padding: '24px 22px',
                border: '1px solid #ddd6fe',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#F1EEFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1'
                }}
              >
                <Repeat size={22} />
              </div>
              <span
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: '#4338ca'
                }}
              >
                {t('basics.compulsion_title', { defaultValue: 'COMPULSIONS' })}
              </span>
              <p
                style={{
                  fontSize: '0.94rem',
                  color: '#475569',
                  lineHeight: 1.45,
                  margin: 0,
                  fontWeight: 500,
                  maxWidth: '480px'
                }}
              >
                {t('basics.compulsion_desc', {
                  defaultValue:
                    'Actions or mental responses you feel driven to repeat to reduce discomfort or feel certain.'
                })}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4: COMMON OCD THEMES (ONLY 6 THEMES, 2 COLUMNS) */}
      <section
        style={{
          width: '100%',
          background: '#FAFAF7',
          padding: 'clamp(36px, 5.5vh, 60px) 20px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '620px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0284c7'
              }}
            >
              {t('themes.eyebrow', { defaultValue: 'COMMON THEMES' })}
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3.4vw, 2rem)',
                fontWeight: 800,
                color: '#0B1730',
                letterSpacing: '-0.025em',
                margin: 0
              }}
            >
              {t('themes.headline', { defaultValue: 'OCD can take many forms.' })}
            </h2>
            <p
              style={{
                fontSize: '0.92rem',
                color: '#64748b',
                lineHeight: 1.45,
                margin: '2px 0 0',
                fontWeight: 450
              }}
            >
              {t('themes.subtext', {
                defaultValue:
                  'These are common themes, not separate diagnoses. One person can experience more than one.'
              })}
            </p>
          </div>

          {/* 2-Column Grid for Desktop & Mobile */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px'
            }}
          >
            {THEMES_LIST.map((theme, idx) => {
              const IconComponent = theme.icon;
              const themeName = t(`themes.items.${theme.id}.name`, {
                defaultValue: theme.nameDefault
              });
              const themeDesc = t(`themes.items.${theme.id}.desc`, {
                defaultValue: theme.descDefault
              });

              return (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  whileHover={{ y: -2 }}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '18px 16px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background: '#EAF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0284c7',
                        flexShrink: 0
                      }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.94rem',
                        fontWeight: 750,
                        color: '#0B1730'
                      }}
                    >
                      {themeName}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: '#64748b',
                      lineHeight: 1.4,
                      margin: 0,
                      fontWeight: 450
                    }}
                  >
                    {themeDesc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
            {t('themes.disclaimer', { defaultValue: 'These are only some examples.' })}
          </span>
        </div>
      </section>

      {/* SECTION 5: RELATABLE MOMENT (ONLY 2 EXAMPLES) */}
      <section
        style={{
          width: '100%',
          background: '#F1EEFF',
          padding: 'clamp(36px, 5.5vh, 56px) 20px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            maxWidth: '740px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#6366f1'
              }}
            >
              {t('relatable.eyebrow', { defaultValue: 'YOU MIGHT RECOGNIZE THIS' })}
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.35rem, 3vw, 1.8rem)',
                fontWeight: 800,
                color: '#0B1730',
                letterSpacing: '-0.025em',
                margin: 0,
                lineHeight: 1.25
              }}
            >
              {t('relatable.headline', {
                defaultValue: 'OCD can make uncertainty feel impossible to leave alone.'
              })}
            </h2>
          </div>

          {/* 2 Concise Relatable Examples */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Example 1 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid #e0e7ff',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '0.96rem', fontWeight: 750, color: '#0B1730' }}>
                {t('relatable.example_1.thought', { defaultValue: '“Did I lock the door?”' })}
              </span>
              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                {t('relatable.example_1.action', { defaultValue: 'You check. You feel relieved.' })}
              </span>
              <span style={{ fontSize: '0.88rem', color: '#6366f1', fontWeight: 600 }}>
                {t('relatable.example_1.loop', { defaultValue: 'Then: “But did I really check?”' })}
              </span>
            </motion.div>

            {/* Example 2 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.1 }}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid #e0e7ff',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '0.96rem', fontWeight: 750, color: '#0B1730' }}>
                {t('relatable.example_2.thought', {
                  defaultValue: '“What if I made a terrible mistake?”'
                })}
              </span>
              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                {t('relatable.example_2.action', { defaultValue: 'You replay what happened.' })}
              </span>
              <span style={{ fontSize: '0.88rem', color: '#6366f1', fontWeight: 600 }}>
                {t('relatable.example_2.loop', { defaultValue: 'You look for reassurance.' })}
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 6: KEY TAKEAWAY */}
      <section
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #EAF6FF 0%, #F1EEFF 100%)',
          padding: 'clamp(40px, 6vh, 64px) 20px',
          boxSizing: 'border-box'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <p
            style={{
              fontSize: 'clamp(1.2rem, 3.2vw, 1.6rem)',
              fontWeight: 800,
              color: '#0B1730',
              lineHeight: 1.35,
              margin: 0,
              letterSpacing: '-0.02em',
              whiteSpace: 'pre-line'
            }}
          >
            {t('takeaway.quote', {
              defaultValue:
                'Everyone gets unwanted thoughts.\n\nOCD can make those thoughts feel like something you have to solve.'
            })}
          </p>
          <span
            style={{
              fontSize: '0.94rem',
              color: '#475569',
              fontWeight: 550,
              maxWidth: '480px'
            }}
          >
            {t('takeaway.sub', {
              defaultValue: 'Understanding that pattern is an important first step.'
            })}
          </span>
        </motion.div>
      </section>



      {/* SECTION 7: COMPLETION CTA */}
      <section
        style={{
          width: '100%',
          background: '#FAFAF7',
          padding: 'clamp(40px, 6vh, 60px) 20px clamp(48px, 7vh, 72px)',
          boxSizing: 'border-box',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px'
        }}
      >
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#0284c7'
          }}
        >
          {t('completion.eyebrow', { defaultValue: 'Finished exploring?' })}
        </span>

        {isCompleted ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#16a34a',
              fontSize: '1rem',
              fontWeight: 700,
              background: '#ECFAF4',
              border: '1px solid #bbf7d0',
              padding: '12px 28px',
              borderRadius: '9999px',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.12)'
            }}
          >
            <CheckCircle2 size={20} />
            <span>{t('completion.completed_badge', { defaultValue: 'Activity Completed' })}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleMarkAsDone}
            disabled={isCompleting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: 750,
              cursor: isCompleting ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(2, 132, 199, 0.28)',
              transition: 'all 0.18s ease',
              opacity: isCompleting ? 0.75 : 1
            }}
            onMouseOver={(e) => {
              if (!isCompleting) e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            }}
            onMouseOut={(e) => {
              if (!isCompleting) e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <span>
              {isCompleting
                ? t('completion.saving', { defaultValue: 'Saving...' })
                : t('completion.btn_complete', { defaultValue: 'Mark Activity as Done →' })}
            </span>
          </button>
        )}

        {completionError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#dc2626',
              fontSize: '0.84rem',
              fontWeight: 500,
              marginTop: '4px'
            }}
          >
            <AlertCircle size={15} />
            <span>{completionError}</span>
          </div>
        )}
      </section>
    </div>
  );
}
