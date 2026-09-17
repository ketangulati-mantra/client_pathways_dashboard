import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import QuietRoomCanvas from '../components/alarmDanger/QuietRoomCanvas';
import { completeLesson } from '../mantra/api';
import { handleExit } from '../mantra/navigation';

const LESSON_ID = 'ocd_alarm_danger';
const OCDMANTRA_LOGO_URL =
  'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

export default function TheAlarmIsNotTheDangerActivity({ onBack, onNavigate }) {
  const { t } = useTranslation('ocd_alarm_danger');

  // 8 Experiential Moments in The Quiet Room
  // 1: ENTER THE ROOM
  // 2: SOMETHING SETS IT OFF
  // 3: THE SIGNAL
  // 4: LOOK CLOSER
  // 5: THE IMPORTANT DISTINCTION (SIGNAL ≠ VERDICT)
  // 6: WHAT HAPPENS NEXT?
  // 7: LET THE SIGNAL BE THERE
  // 8: TAKE IT WITH YOU
  const [step, setStep] = useState(1);

  // Detector State
  const [isActivated, setIsActivated] = useState(false);
  const [intensity, setIntensity] = useState(0.2);

  // Screen 2 Trigger selection
  const [selectedExample, setSelectedExample] = useState(null);

  // Screen 4 Manual 3D Inspection
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0.15);
  const [hasInspected, setHasInspected] = useState(false);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Screen 5 Draggable Separation
  const [dividerDrag, setDividerDrag] = useState(0); // -100 to 100
  const [isDivided, setIsDivided] = useState(false);

  // Screen 6 Responses explored
  const [activeResponse, setActiveResponse] = useState(null);

  // Screen 7 Observation
  const [observationSeconds, setObservationSeconds] = useState(0);
  const [isObserving, setIsObserving] = useState(false);
  const [observationDone, setObservationDone] = useState(false);

  // Screen 8 Reflection
  const [reflectionChoice, setReflectionChoice] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Inspection drag handlers (Screen 4)
  const handlePointerDown = (e) => {
    if (step !== 4) return;
    isDragging.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e) => {
    if (step !== 4 || !isDragging.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - lastMousePos.current.x;
    const deltaY = clientY - lastMousePos.current.y;

    setRotationY((prev) => prev + deltaX * 0.008);
    setRotationX((prev) => Math.max(-0.6, Math.min(0.6, prev + deltaY * 0.008)));

    lastMousePos.current = { x: clientX, y: clientY };
    setHasInspected(true);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Observation Timer (Screen 7)
  useEffect(() => {
    let timer = null;
    if (step === 7 && isObserving && observationSeconds < 15) {
      timer = setInterval(() => {
        setObservationSeconds((prev) => {
          if (prev >= 14) {
            clearInterval(timer);
            setObservationDone(true);
            setIsObserving(false);
            setIsActivated(false);
            setIntensity(0.15);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, isObserving, observationSeconds]);

  // Handle Step Forward
  const handleStepForward = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      setIsActivated(true);
      setIntensity(0.7);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    } else if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      setStep(7);
      setIsActivated(true);
      setIntensity(0.4);
    } else if (step === 7) {
      setStep(8);
      setIsActivated(false);
      setIntensity(0.1);
    }
  };

  // Handle Complete Activity
  const handleComplete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    try {
      await completeLesson(LESSON_ID);
      await completeLesson('403');
    } catch (e) {
      console.warn('Completion error:', e);
    } finally {
      handleExit(onBack, onNavigate);
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        width: '100%',
        minHeight: '100dvh',
        backgroundColor: '#F1F4F2',
        color: '#18232B',
        fontFamily: "'Inter', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        position: 'relative',
        userSelect: step === 4 ? 'none' : 'auto'
      }}
    >
      {/* 3D Architectural Ceiling & Smoke Detector Environment */}
      <QuietRoomCanvas
        step={step}
        isActivated={isActivated}
        intensity={intensity}
        userRotationY={rotationY}
        userRotationX={rotationX}
        isInspecting={step === 4}
      />

      {/* Top Minimal Header */}
      <header
        style={{
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          boxSizing: 'border-box'
        }}
      >
        <button
          type="button"
          onClick={() => handleExit(onBack, onNavigate)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#18232B',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'opacity 0.15s ease'
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          <span>{t('header_back', { defaultValue: 'Back' })}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        </div>

        <div style={{ minWidth: '60px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#7C89A8',
              letterSpacing: '0.04em'
            }}
          >
            {t('progress_format', { current: 3, defaultValue: '3 / 5' })}
          </span>
        </div>
      </header>

      {/* Main Experience Arena */}
      <main
        style={{
          width: '100%',
          maxWidth: '860px',
          margin: '0 auto',
          padding: '16px 28px 44px 28px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxSizing: 'border-box',
          zIndex: 10
        }}
      >
        <AnimatePresence mode="wait">
          {/* ========================================================
              SCREEN 1: ENTER THE ROOM ("LOOK UP.")
             ======================================================== */}
          {step === 1 && (
            <motion.div
              key="step_1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px'
              }}
            >
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#7C89A8',
                  marginBottom: '4px'
                }}
              >
                {t('screen1.badge', { defaultValue: 'ACTIVITY 3' })}
              </span>

              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
                  fontWeight: 800,
                  color: '#18232B',
                  lineHeight: 1.05,
                  letterSpacing: '-0.035em',
                  margin: '0 0 6px 0'
                }}
              >
                {t('screen1.title', { defaultValue: 'LOOK UP.' })}
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                  fontWeight: 600,
                  color: '#587A91',
                  margin: '0 0 4px 0',
                  letterSpacing: '-0.01em'
                }}
              >
                {t('screen1.subtitle', { defaultValue: 'THE ALARM IS NOT THE DANGER.' })}
              </p>

              <p
                style={{
                  fontSize: '0.94rem',
                  color: '#7C89A8',
                  maxWidth: '380px',
                  lineHeight: 1.5,
                  margin: '0 0 28px 0'
                }}
              >
                {t('screen1.detail', { defaultValue: 'A feeling can be loud without telling you the whole story.' })}
              </p>

              <button
                type="button"
                onClick={handleStepForward}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#18232B',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: '2px solid #587A91'
                }}
              >
                {t('screen1.btn_enter', { defaultValue: 'ENTER →' })}
              </button>
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 2: SOMETHING SETS IT OFF
             ======================================================== */}
          {step === 2 && (
            <motion.div
              key="step_2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)',
                  fontWeight: 800,
                  color: '#18232B',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  margin: '0 0 8px 0'
                }}
              >
                {t('screen2.title_line1', { defaultValue: 'SOMETIMES,' })}
                <br />
                {t('screen2.title_line2', { defaultValue: 'UNCERTAINTY IS ENOUGH.' })}
              </h2>

              <p style={{ fontSize: '0.9rem', color: '#7C89A8', margin: '0 0 24px 0' }}>
                {t('screen2.subtitle', { defaultValue: 'Tap a phrase to observe how the detector reacts.' })}
              </p>

              {/* Seamless Typography Rows (No Cards) */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '440px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginBottom: '28px'
                }}
              >
                {[
                  t('screen2.example1', { defaultValue: '“What if I made a mistake?”' }),
                  t('screen2.example2', { defaultValue: '“What if something isn’t clean enough?”' }),
                  t('screen2.example3', { defaultValue: '“What if I can’t be completely sure?”' })
                ].map((phrase, idx) => {
                  const isSelected = selectedExample === phrase;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedExample(phrase);
                        setIsActivated(true);
                        setIntensity(0.7);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px 12px',
                        textAlign: 'center',
                        color: isSelected ? '#18232B' : '#587A91',
                        fontSize: '1.05rem',
                        fontWeight: isSelected ? 800 : 500,
                        fontStyle: 'italic',
                        cursor: 'pointer',
                        borderBottom: isSelected ? '2px solid #587A91' : '1px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {phrase}
                    </button>
                  );
                })}
              </div>

              {selectedExample && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="button"
                  onClick={handleStepForward}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#18232B',
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderBottom: '2px solid #18232B'
                  }}
                >
                  {t('screen2.btn_activates', { defaultValue: 'THE SIGNAL ACTIVATES →' })}
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 3: THE SIGNAL
             ======================================================== */}
          {step === 3 && (
            <motion.div
              key="step_3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {/* Floating ambient sensation labels in open space */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '40px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#7C89A8',
                  textTransform: 'uppercase'
                }}
              >
                <span>{t('screen3.ambient_heart', { defaultValue: 'HEART RACING' })}</span>
                <span>{t('screen3.ambient_tension', { defaultValue: 'TENSION' })}</span>
                <span>{t('screen3.ambient_attention', { defaultValue: 'ATTENTION' })}</span>
                <span>{t('screen3.ambient_urge', { defaultValue: 'URGE' })}</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  fontWeight: 800,
                  color: '#18232B',
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  margin: '0 0 10px 0'
                }}
              >
                {t('screen3.title', { defaultValue: 'THAT FEELING CAN BE LOUD.' })}
              </h2>

              <p
                style={{
                  fontSize: '0.98rem',
                  color: '#587A91',
                  maxWidth: '440px',
                  lineHeight: 1.5,
                  margin: '0 0 32px 0'
                }}
              >
                {t('screen3.subtitle', { defaultValue: 'The feeling is real. The message it seems to carry isn’t automatically the whole story.' })}
              </p>

              <button
                type="button"
                onClick={handleStepForward}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#18232B',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderBottom: '2px solid #587A91'
                }}
              >
                {t('screen3.btn_look_closer', { defaultValue: 'LOOK CLOSER →' })}
              </button>
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 4: LOOK CLOSER (MANUAL INSPECT)
             ======================================================== */}
          {step === 4 && (
            <motion.div
              key="step_4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {/* Floating Spatial Annotation Labels */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  fontFamily: "'Inter', monospace",
                  color: '#587A91',
                  letterSpacing: '0.1em'
                }}
              >
                <span>{t('screen4.tag_left', { defaultValue: '[ SIGNAL // SENSITIVITY ]' })}</span>
                <span>{t('screen4.tag_right', { defaultValue: '[ RESPONSE // INTERPRETATION ]' })}</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 4.5vw, 2.5rem)',
                  fontWeight: 800,
                  color: '#18232B',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.03em'
                }}
              >
                {t('screen4.title', { defaultValue: 'LOOK CLOSER.' })}
              </h2>

              <p style={{ fontSize: '0.9rem', color: '#7C89A8', margin: '0 0 24px 0' }}>
                {t('screen4.subtitle', { defaultValue: 'Drag anywhere to inspect the detector from any angle.' })}
              </p>

              <p
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#18232B',
                  maxWidth: '420px',
                  lineHeight: 1.4,
                  margin: '0 0 28px 0'
                }}
              >
                {t('screen4.detail', { defaultValue: 'You can notice the signal without immediately rushing to a conclusion.' })}
              </p>

              <button
                type="button"
                onClick={handleStepForward}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#18232B',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderBottom: '2px solid #587A91'
                }}
              >
                {t('screen4.btn_continue', { defaultValue: 'CONTINUE →' })}
              </button>
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 5: THE IMPORTANT DISTINCTION (SIGNAL ≠ VERDICT)
             ======================================================== */}
          {step === 5 && (
            <motion.div
              key="step_5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {/* Central Insight Title */}
              <h2
                style={{
                  fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                  fontWeight: 900,
                  color: '#18232B',
                  letterSpacing: '-0.04em',
                  margin: '0 0 8px 0'
                }}
              >
                {t('screen5.title', { defaultValue: 'SIGNAL ≠ VERDICT' })}
              </h2>

              <p
                style={{
                  fontSize: 'clamp(0.96rem, 2vw, 1.15rem)',
                  color: '#587A91',
                  maxWidth: '460px',
                  lineHeight: 1.5,
                  margin: '0 0 36px 0'
                }}
              >
                {t('screen5.subtitle', { defaultValue: 'A strong feeling can be real without automatically proving what it seems to say.' })}
              </p>

              {/* Floating Spatial Distinction Columns (No Cards) */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '580px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '48px',
                  marginBottom: '36px',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      color: '#587A91',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '12px'
                    }}
                  >
                    {t('screen5.col_feel_title', { defaultValue: 'WHAT I FEEL' })}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.98rem', fontWeight: 600, color: '#18232B' }}>
                    <span>{t('screen5.feel_anxious', { defaultValue: 'Anxious.' })}</span>
                    <span>{t('screen5.feel_uncertain', { defaultValue: 'Uncertain.' })}</span>
                    <span>{t('screen5.feel_tense', { defaultValue: 'Tense.' })}</span>
                    <span>{t('screen5.feel_pulled', { defaultValue: 'Pulled to check.' })}</span>
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      color: '#7C89A8',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '12px'
                    }}
                  >
                    {t('screen5.col_conclude_title', { defaultValue: 'WHAT I CONCLUDE' })}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.98rem', color: '#587A91', fontStyle: 'italic' }}>
                    <span>{t('screen5.conclude_wrong', { defaultValue: '“Something must be wrong.”' })}</span>
                    <span>{t('screen5.conclude_make_sure', { defaultValue: '“I need to make sure.”' })}</span>
                    <span>{t('screen5.conclude_certainty', { defaultValue: '“I need certainty.”' })}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStepForward}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#18232B',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderBottom: '2px solid #587A91'
                }}
              >
                {t('screen5.btn_next', { defaultValue: 'WHAT HAPPENS NEXT? →' })}
              </button>
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 6: WHAT HAPPENS NEXT?
             ======================================================== */}
          {step === 6 && (
            <motion.div
              key="step_6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)',
                  fontWeight: 800,
                  color: '#18232B',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  margin: '0 0 10px 0'
                }}
              >
                {t('screen6.title', { defaultValue: 'SOMETIMES A RESPONSE CAN QUIET THE SIGNAL FOR A MOMENT.' })}
              </h2>

              <p style={{ fontSize: '0.9rem', color: '#7C89A8', margin: '0 0 24px 0' }}>
                {t('screen6.subtitle', { defaultValue: 'Tap to see how responses interact with the signal.' })}
              </p>

              {/* 4 Floating Typography Archetypes in Open Space */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px 24px',
                  marginBottom: '28px',
                  textAlign: 'left'
                }}
              >
                {[
                  { title: t('screen6.item_check_title', { defaultValue: 'CHECK' }), quote: t('screen6.item_check_quote', { defaultValue: '“I’ll make sure one more time.”' }) },
                  { title: t('screen6.item_ask_title', { defaultValue: 'ASK' }), quote: t('screen6.item_ask_quote', { defaultValue: '“I’ll ask someone what they think.”' }) },
                  { title: t('screen6.item_replay_title', { defaultValue: 'REPLAY' }), quote: t('screen6.item_replay_quote', { defaultValue: '“I’ll go over it again in my head.”' }) },
                  { title: t('screen6.item_avoid_title', { defaultValue: 'AVOID' }), quote: t('screen6.item_avoid_quote', { defaultValue: '“I’ll stay away from whatever feels uncertain.”' }) }
                ].map((item, idx) => {
                  const isActive = activeResponse === item.title;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveResponse(item.title);
                        setIsActivated(false);
                        setTimeout(() => setIsActivated(true), 1200);
                      }}
                      style={{
                        cursor: 'pointer',
                        paddingBottom: '6px',
                        borderBottom: isActive ? '2px solid #587A91' : '1px solid rgba(124, 137, 168, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#18232B', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '0.86rem', color: '#587A91', fontStyle: 'italic' }}>
                        {item.quote}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleStepForward}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#18232B',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderBottom: '2px solid #587A91'
                }}
              >
                {t('screen6.btn_let_signal', { defaultValue: 'LET THE SIGNAL BE THERE →' })}
              </button>
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 7: LET THE SIGNAL BE THERE (QUIET OBSERVATION)
             ======================================================== */}
          {step === 7 && (
            <motion.div
              key="step_7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  fontWeight: 800,
                  color: '#18232B',
                  lineHeight: 1.08,
                  letterSpacing: '-0.035em',
                  margin: '0 0 10px 0'
                }}
              >
                {t('screen7.title', { defaultValue: 'LET THE SIGNAL BE THERE.' })}
              </h2>

              <p
                style={{
                  fontSize: '0.94rem',
                  color: '#7C89A8',
                  maxWidth: '420px',
                  lineHeight: 1.5,
                  margin: '0 0 28px 0'
                }}
              >
                {t('screen7.subtitle', { defaultValue: 'Notice what happens when you don\'t immediately rush to interpret it.' })}
              </p>

              {!isObserving && !observationDone && (
                <button
                  type="button"
                  onClick={() => setIsObserving(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#18232B',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    padding: '8px 20px',
                    borderBottom: '2px solid #587A91'
                  }}
                >
                  {t('screen7.btn_watch', { defaultValue: 'WATCH THE SIGNAL' })}
                </button>
              )}

              {isObserving && (
                <div style={{ margin: '8px 0', fontSize: '0.9rem', color: '#587A91', fontWeight: 600 }}>
                  {t('screen7.observing_format', { seconds: 15 - observationSeconds, defaultValue: `Observing signal... (${15 - observationSeconds}s)` })}
                </div>
              )}

              {observationDone && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <p style={{ fontWeight: 800, color: '#18232B', fontSize: '1.05rem', margin: '0 0 4px 0' }}>
                    {t('screen7.done_title', { defaultValue: 'THE SIGNAL CHANGED.' })}
                  </p>
                  <p style={{ color: '#7C89A8', fontSize: '0.92rem', margin: '0 0 24px 0' }}>
                    {t('screen7.done_sub', { defaultValue: 'You didn\'t have to solve it.' })}
                  </p>

                  <button
                    type="button"
                    onClick={handleStepForward}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#18232B',
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderBottom: '2px solid #587A91'
                    }}
                  >
                    {t('screen7.btn_continue', { defaultValue: 'CONTINUE →' })}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ========================================================
              SCREEN 8: TAKE IT WITH YOU
             ======================================================== */}
          {step === 8 && (
            <motion.div
              key="step_8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6 }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(2.2rem, 5.5vw, 3.4rem)',
                  fontWeight: 900,
                  color: '#18232B',
                  lineHeight: 1.06,
                  letterSpacing: '-0.04em',
                  margin: '0 0 12px 0'
                }}
              >
                {t('screen8.title_line1', { defaultValue: 'AN ALARM IS A SIGNAL.' })}
                <br />
                {t('screen8.title_line2', { defaultValue: 'NOT A VERDICT.' })}
              </h2>

              <p
                style={{
                  fontSize: '0.96rem',
                  color: '#587A91',
                  maxWidth: '440px',
                  lineHeight: 1.5,
                  margin: '0 0 28px 0'
                }}
              >
                {t('screen8.subtitle', { defaultValue: 'Notice the feeling. Notice the story your mind adds to it.' })}
              </p>

              {/* Final Micro Reflection Question */}
              <div style={{ width: '100%', maxWidth: '440px', marginBottom: '28px' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#7C89A8',
                    display: 'block',
                    marginBottom: '16px'
                  }}
                >
                  {t('screen8.question', { defaultValue: 'NEXT TIME THE ALARM GETS LOUD, WHAT MIGHT YOU NOTICE FIRST?' })}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    t('screen8.opt_feeling', { defaultValue: 'THE FEELING' }),
                    t('screen8.opt_thought', { defaultValue: 'THE THOUGHT' }),
                    t('screen8.opt_urge', { defaultValue: 'THE URGE TO RESPOND' })
                  ].map((opt) => {
                    const isSelected = reflectionChoice === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setReflectionChoice(opt)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '8px 12px',
                          color: isSelected ? '#18232B' : '#7C89A8',
                          fontSize: '1rem',
                          fontWeight: isSelected ? 800 : 500,
                          cursor: 'pointer',
                          borderBottom: isSelected ? '2px solid #587A91' : '1px solid transparent',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {reflectionChoice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <p style={{ fontSize: '0.88rem', color: '#587A91', fontStyle: 'italic', margin: '0 0 20px 0' }}>
                    {t('screen8.feedback', { defaultValue: 'Keep noticing the difference.' })}
                  </p>

                  <button
                    type="button"
                    onClick={handleComplete}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#18232B',
                      fontSize: '0.98rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                      padding: '8px 20px',
                      borderBottom: '2px solid #18232B'
                    }}
                  >
                    {isCompleting ? t('screen8.btn_saving', { defaultValue: 'SAVING...' }) : t('screen8.btn_continue', { defaultValue: 'CONTINUE →' })}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
