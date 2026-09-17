import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CircularTimeField from '../components/delayPause/CircularTimeField';
import PauseHeader from '../components/delayPause/PauseHeader';
import { completeLesson } from '../mantra/api';
import '../components/delayPause/The60SecondPause.css';

const LESSON_ID = 'ocd_delay_tactic';

export default function The60SecondPauseActivity({ onBack, onNavigate }) {
  const { t } = useTranslation('ocd_delay_tactic');

  const SCENARIO_1_RESPONSES = [
    { id: 'check', label: t('step3.responses.check', { defaultValue: 'Check again' }) },
    { id: 'ask', label: t('step3.responses.ask', { defaultValue: 'Ask someone for reassurance' }) },
    { id: 'goback', label: t('step3.responses.goback', { defaultValue: 'Go back and make sure' }) },
    { id: 'wait', label: t('step3.responses.wait', { defaultValue: 'Pause and wait' }) }
  ];

  const REFLECTION_CHOICES = [
    { id: 'thought_there', label: t('step6.reflections.thought_there', { defaultValue: 'The thought was still there' }) },
    { id: 'felt_urge', label: t('step6.reflections.felt_urge', { defaultValue: 'I felt an urge to respond' }) },
    { id: 'uncomfortable', label: t('step6.reflections.uncomfortable', { defaultValue: 'The uncertainty felt uncomfortable' }) },
    { id: 'could_wait', label: t('step6.reflections.could_wait', { defaultValue: 'I could wait without answering it right away' }) }
  ];

  const [step, setStep] = useState(1);
  const [scenarioResponse, setScenarioResponse] = useState(null);
  const [selectedReflections, setSelectedReflections] = useState([]);

  // Timer State for Round 1 (Scenario 1)
  const [secondsLeft1, setSecondsLeft1] = useState(60);
  const [isRunning1, setIsRunning1] = useState(false);

  // Timer State for Round 2 (Scenario 2)
  const [secondsLeft2, setSecondsLeft2] = useState(60);
  const [isRunning2, setIsRunning2] = useState(false);

  // Engaging clinical observation messages rotating every 3 seconds (20 distinct phases)
  const ROTATING_PROMPTS = [
    t('step5.prompts.0', { defaultValue: 'Notice the urge as it appears.' }),
    t('step5.prompts.1', { defaultValue: 'You can feel the pull without answering it.' }),
    t('step5.prompts.2', { defaultValue: 'Take a gentle breath and observe.' }),
    t('step5.prompts.3', { defaultValue: 'The urge is just a sensation right now.' }),
    t('step5.prompts.4', { defaultValue: 'You don’t have to solve uncertainty right away.' }),
    t('step5.prompts.5', { defaultValue: 'Notice where you feel tension in your body.' }),
    t('step5.prompts.6', { defaultValue: 'Thoughts come and go like ripples on water.' }),
    t('step5.prompts.7', { defaultValue: 'Creating space between thought and action.' }),
    t('step5.prompts.8', { defaultValue: 'You are observing the urge, not obeying it.' }),
    t('step5.prompts.9', { defaultValue: 'Uncertainty can be uncomfortable, and that\'s okay.' }),
    t('step5.prompts.10', { defaultValue: 'Let the thought be there without engaging.' }),
    t('step5.prompts.11', { defaultValue: 'Notice the impulse to fix or check.' }),
    t('step5.prompts.12', { defaultValue: 'Stay curious about the sensation.' }),
    t('step5.prompts.13', { defaultValue: 'You are in control of your response.' }),
    t('step5.prompts.14', { defaultValue: 'Nothing needs to be settled this very second.' }),
    t('step5.prompts.15', { defaultValue: 'You’ve created space for over 45 seconds.' }),
    t('step5.prompts.16', { defaultValue: 'Just notice the urge without rushing to act.' }),
    t('step5.prompts.17', { defaultValue: 'Almost there — resting in the pause.' }),
    t('step5.prompts.18', { defaultValue: 'Stay present with this final breath.' }),
    t('step5.prompts.19', { defaultValue: 'You completed the pause.' })
  ];

  const getPromptForSecond = (sec) => {
    const elapsed = Math.max(0, 60 - sec);
    const index = Math.min(Math.floor(elapsed / 3), ROTATING_PROMPTS.length - 1);
    return ROTATING_PROMPTS[index];
  };

  // Timer 1 interval
  useEffect(() => {
    let interval = null;
    if (isRunning1 && secondsLeft1 > 0) {
      interval = setInterval(() => {
        setSecondsLeft1((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning1(false);
            setTimeout(() => setStep(6), 600);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning1, secondsLeft1]);

  // Timer 2 interval (Scenario 2)
  useEffect(() => {
    let interval = null;
    if (isRunning2 && secondsLeft2 > 0) {
      interval = setInterval(() => {
        setSecondsLeft2((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning2(false);
            setTimeout(() => setStep(9), 600);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning2, secondsLeft2]);

  // Toggle multi-select reflection choices
  const toggleReflection = (id) => {
    setSelectedReflections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Safe completion trigger
  const handleComplete = useCallback(async () => {
    try {
      await completeLesson(LESSON_ID);
      await completeLesson('ocd_delay');
      await completeLesson('405');
    } catch (e) {
      console.warn('Completion callback warning:', e);
    }
    if (onBack) {
      onBack();
    } else {
      handleExit();
    }
  }, [onBack]);

  return (
    <div className="sixty-second-pause">
      {/* Blue/White Styled Header */}
      <PauseHeader onBack={onBack} currentStep={step} totalSteps={9} />

      {/* Main Experiential Canvas */}
      <main className="sixty-second-pause__main">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* SCREEN 1: INTRODUCTION */}
          {/* ============================================================ */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="ssp-card"
            >
              <h1 className="ssp-heading">
                {t('step1.title', { defaultValue: 'The 60-Second Pause' })}
              </h1>

              <p className="ssp-subcopy">
                {t('step1.subtitle', { defaultValue: 'Sometimes an urge can feel like something you need to act on right away. Let’s practice creating a little space before you respond.' })}
              </p>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="ssp-action-btn"
              >
                <span>{t('step1.btn_begin', { defaultValue: 'Begin' })}</span>
                <span className="ssp-action-arrow">→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 2: SET UP THE SITUATION (SCENARIO 1) */}
          {/* ============================================================ */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="ssp-card"
            >
              <div className="ssp-eyebrow">
                {t('step2.eyebrow', { defaultValue: 'SCENARIO 1' })}
              </div>

              <h2 className="ssp-heading">
                {t('step2.title', { defaultValue: 'Let\'s Try a Scenario' })}
              </h2>

              <p className="ssp-subcopy" style={{ marginBottom: '14px' }}>
                {t('step2.subtitle', { defaultValue: 'Imagine you’ve just left your house.' })}
              </p>

              {/* Scenario Scene Box */}
              <div className="ssp-scenario-visual">
                <div className="ssp-scenario-line">
                  <span className="ssp-scenario-dot" />
                  <span>{t('step2.visual_line1', { defaultValue: 'You lock the front door and walk toward your car.' })}</span>
                </div>

                <div className="ssp-scenario-thought">
                  {t('step2.visual_thought', { defaultValue: '“Did I lock it properly?”' })}
                </div>

                <div className="ssp-scenario-line">
                  <span className="ssp-scenario-dot" />
                  <span>{t('step2.visual_line2', { defaultValue: 'You notice the pull to turn around and check.' })}</span>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="ssp-action-btn"
              >
                <span>{t('step2.btn_continue', { defaultValue: 'Continue' })}</span>
                <span className="ssp-action-arrow">→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 3: THE URGE */}
          {/* ============================================================ */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="ssp-card"
            >
              <div className="ssp-eyebrow">
                {t('step3.eyebrow', { defaultValue: 'THE URGE' })}
              </div>

              <div className="ssp-urge-banner">
                {t('step3.banner', { defaultValue: '“Check it one more time.”' })}
              </div>

              <p className="ssp-subcopy" style={{ marginBottom: '16px' }}>
                {t('step3.subtitle', { defaultValue: 'You notice an urge to turn around and check.' })}
              </p>

              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', color: '#005387', textTransform: 'uppercase', marginBottom: '8px' }}>
                {t('step3.question', { defaultValue: 'What would you normally feel pulled to do?' })}
              </div>

              {/* Options */}
              <div className="ssp-choices-list">
                {SCENARIO_1_RESPONSES.map((resp) => {
                  const isSelected = scenarioResponse === resp.id;
                  return (
                    <button
                      key={resp.id}
                      type="button"
                      onClick={() => setScenarioResponse(resp.id)}
                      className={`ssp-choice-item ${isSelected ? 'selected' : ''}`}
                    >
                      {resp.label}
                    </button>
                  );
                })}
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => setStep(4)}
                className="ssp-action-btn"
              >
                <span>{t('step3.btn_next', { defaultValue: 'Next' })}</span>
                <span className="ssp-action-arrow">→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 4: INTRODUCE THE PAUSE */}
          {/* ============================================================ */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="ssp-card"
            >
              <h2 className="ssp-heading" style={{ lineHeight: 1.25 }}>
                {t('step4.title', { defaultValue: 'You Don’t Have to Answer It Yet.' })}
              </h2>

              <p className="ssp-subcopy" style={{ marginBottom: '16px' }}>
                {t('step4.subtitle', { defaultValue: 'For the next 60 seconds, we’re going to practice making a little space between the urge and your response.' })}
              </p>

              {/* Three Principles Cadence */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#005387',
                letterSpacing: '0.08em',
                margin: '8px 0 16px 0'
              }}>
                <span>{t('step4.cadence_pause', { defaultValue: 'PAUSE' })}</span>
                <span style={{ color: '#0284C7', opacity: 0.6 }}>·</span>
                <span>{t('step4.cadence_notice', { defaultValue: 'NOTICE' })}</span>
                <span style={{ color: '#0284C7', opacity: 0.6 }}>·</span>
                <span>{t('step4.cadence_choose', { defaultValue: 'CHOOSE' })}</span>
              </div>

              <p className="ssp-subcopy" style={{ fontSize: '14px', maxWidth: '420px', marginBottom: '24px' }}>
                {t('step4.detail', { defaultValue: 'The goal isn’t to make the thought disappear. It’s to notice the urge without immediately answering it.' })}
              </p>

              {/* Action */}
              <button
                type="button"
                onClick={() => {
                  setSecondsLeft1(60);
                  setIsRunning1(true);
                  setStep(5);
                }}
                className="ssp-action-btn"
              >
                <span>{t('step4.btn_start', { defaultValue: 'Start 60-Second Pause' })}</span>
                <span className="ssp-action-arrow">→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 5: ACTUAL 60-SECOND PRACTICE (INTERACTIVE) */}
          {/* ============================================================ */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="ssp-card"
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0284C7', marginBottom: '2px' }}>
                {t('step5.badge', { defaultValue: 'THE URGE IS HERE' })}
              </div>

              {/* Time Field */}
              <CircularTimeField
                secondsLeft={secondsLeft1}
                totalSeconds={60}
                isRunning={isRunning1}
              />

              {/* Engaging Observational Prompts rotating every 3 seconds */}
              <div className="ssp-prompt-box">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={getPromptForSecond(secondsLeft1)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="ssp-prompt-text"
                  >
                    {getPromptForSecond(secondsLeft1)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 6: REFLECTION */}
          {/* ============================================================ */}
          {step === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="ssp-card"
            >
              <h2 className="ssp-heading">
                {t('step6.title', { defaultValue: 'You Made Space.' })}
              </h2>

              <p className="ssp-subcopy" style={{ marginBottom: '14px' }}>
                {t('step6.subtitle', { defaultValue: 'The goal wasn\'t to make the urge disappear. It was to give yourself a moment before responding.' })}
              </p>

              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', color: '#005387', textTransform: 'uppercase', marginBottom: '8px' }}>
                {t('step6.question', { defaultValue: 'What did you notice?' })}
              </div>

              {/* Multi-Select Reflections */}
              <div className="ssp-choices-list">
                {REFLECTION_CHOICES.map((choice) => {
                  const isSelected = selectedReflections.includes(choice.id);
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => toggleReflection(choice.id)}
                      className={`ssp-choice-item ${isSelected ? 'selected' : ''}`}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={() => setStep(7)}
                className="ssp-action-btn"
              >
                <span>{t('step6.btn_continue', { defaultValue: 'Continue' })}</span>
                <span className="ssp-action-arrow">→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 7: CONNECT IT TO OCD (CYCLE INTEGRATION) */}
          {/* ============================================================ */}
          {step === 7 && (
            <motion.div
              key="step-7"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="ssp-card"
            >
              <div className="ssp-eyebrow">
                {t('step7.eyebrow', { defaultValue: 'OCD CYCLE' })}
              </div>

              <h2 className="ssp-heading">
                {t('step7.title', { defaultValue: 'Where the Pause Fits' })}
              </h2>

              <p className="ssp-subcopy" style={{ marginBottom: '14px' }}>
                {t('step7.subtitle', { defaultValue: 'OCD creates a strong pull to respond immediately to doubt.' })}
              </p>

              {/* Cycle Flow Visual */}
              <div className="ssp-cycle-container">
                <div className="ssp-cycle-node">{t('step7.node_doubt', { defaultValue: 'Doubt / Intrusive Thought' })}</div>
                <div className="ssp-cycle-arrow">↓</div>
                <div className="ssp-cycle-node">{t('step7.node_urge', { defaultValue: 'Urge to Respond' })}</div>
                
                <div className="ssp-cycle-space-highlight">
                  <span className="ssp-space-tag">{t('step7.space_tag', { defaultValue: 'THE 60-SECOND PAUSE' })}</span>
                  <span className="ssp-space-title">{t('step7.space_title', { defaultValue: 'This is the space you just practiced.' })}</span>
                </div>

                <div className="ssp-cycle-arrow">↓</div>
                <div className="ssp-cycle-node" style={{ opacity: 0.75 }}>{t('step7.node_compulsion', { defaultValue: 'Compulsive Response' })}</div>
                <div className="ssp-cycle-arrow" style={{ opacity: 0.75 }}>↓</div>
                <div className="ssp-cycle-node" style={{ opacity: 0.55 }}>{t('step7.node_relief', { defaultValue: 'Temporary Relief → Doubt Returns' })}</div>
              </div>

              <p className="ssp-subcopy" style={{ fontSize: '14px', maxWidth: '440px', marginBottom: '20px' }}>
                {t('step7.detail', { defaultValue: 'A pause gives you a moment before automatically following that pull.' })}
              </p>

              {/* Action */}
              <button
                type="button"
                onClick={() => setStep(8)}
                className="ssp-action-btn"
              >
                <span>{t('step7.btn_try_another', { defaultValue: 'Try Another Scenario' })}</span>
                <span className="ssp-action-arrow">→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 8: SECOND SCENARIO (SKILL TRANSFER) */}
          {/* ============================================================ */}
          {step === 8 && (
            <motion.div
              key="step-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="ssp-card"
            >
              <div className="ssp-eyebrow">
                {t('step8.eyebrow', { defaultValue: 'SCENARIO 2' })}
              </div>

              <h2 className="ssp-heading">
                {t('step8.title', { defaultValue: 'Practice Transfer' })}
              </h2>

              <p className="ssp-subcopy" style={{ marginBottom: '12px' }}>
                {t('step8.subtitle', { defaultValue: 'Imagine you’ve just sent an important message.' })}
              </p>

              {/* Scenario Scene Box */}
              <div className="ssp-scenario-visual">
                <div className="ssp-scenario-line">
                  <span className="ssp-scenario-dot" />
                  <span>{t('step8.visual_line1', { defaultValue: 'You press send and close the conversation.' })}</span>
                </div>

                <div className="ssp-scenario-thought">
                  {t('step8.visual_thought', { defaultValue: '“Did I say something wrong? Maybe I should read it again.”' })}
                </div>

                <div className="ssp-scenario-line">
                  <span className="ssp-scenario-dot" />
                  <span>{t('step8.visual_line2', { defaultValue: 'The same pattern: Thought → Urge → Pause → Choice.' })}</span>
                </div>
              </div>

              {!isRunning2 && secondsLeft2 === 60 ? (
                <button
                  type="button"
                  onClick={() => {
                    setSecondsLeft2(60);
                    setIsRunning2(true);
                  }}
                  className="ssp-action-btn"
                >
                  <span>{t('step8.btn_practice', { defaultValue: 'Practice Pause (60s)' })}</span>
                  <span className="ssp-action-arrow">→</span>
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <CircularTimeField
                    secondsLeft={secondsLeft2}
                    totalSeconds={60}
                    isRunning={isRunning2}
                  />
                  <div className="ssp-prompt-box">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={getPromptForSecond(secondsLeft2)}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="ssp-prompt-text"
                      >
                        {getPromptForSecond(secondsLeft2)}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 9: FINAL TAKEAWAY & COMPLETION */}
          {/* ============================================================ */}
          {step === 9 && (
            <motion.div
              key="step-9"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="ssp-card"
            >
              <h2 className="ssp-heading" style={{ lineHeight: 1.25, marginBottom: '14px' }}>
                {t('step9.title', { defaultValue: 'An Urge is Not an Instruction.' })}
              </h2>

              <p className="ssp-subcopy" style={{ maxWidth: '440px', marginBottom: '20px' }}>
                {t('step9.subtitle', { defaultValue: 'You don’t have to answer every urge immediately. A little space can create a different starting point.' })}
              </p>

              {/* Three Word Cadence */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#005387',
                letterSpacing: '0.08em',
                marginBottom: '28px'
              }}>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                  {t('step9.cadence_pause', { defaultValue: 'PAUSE' })}
                </motion.span>
                <span style={{ color: '#0284C7', opacity: 0.6 }}>·</span>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                  {t('step9.cadence_notice', { defaultValue: 'NOTICE' })}
                </motion.span>
                <span style={{ color: '#0284C7', opacity: 0.6 }}>·</span>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                  {t('step9.cadence_choose', { defaultValue: 'CHOOSE' })}
                </motion.span>
              </div>

              {/* Completion Action */}
              <button
                type="button"
                onClick={handleComplete}
                className="ssp-action-btn"
              >
                <span>{t('step9.btn_continue', { defaultValue: 'Continue' })}</span>
                <span className="ssp-action-arrow">→</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
