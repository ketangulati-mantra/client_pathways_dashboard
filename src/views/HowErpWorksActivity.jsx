import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ErpHeader from '../components/erp/ErpHeader';
import { HouseDoorScene, MessageSentScene } from '../components/erp/ErpScenes';
import { completeLesson } from '../mantra/api';
import '../components/erp/HowErpWorks.css';

const LESSON_ID = 'ocd_how_erp_works';

export default function HowErpWorksActivity({ onBack, onNavigate }) {
  const { t } = useTranslation('ocd_how_erp_works');

  // Screens 1 through 11
  const [screen, setScreen] = useState(1);

  // Screen 3 state: 'idle' -> 'check' -> 'relief' -> 'doubt'
  const [usualStage, setUsualStage] = useState('idle');

  // Screen 10 state: multiple choice
  const [selectedOption, setSelectedOption] = useState(null);

  // Completion trigger
  const handleComplete = useCallback(async () => {
    try {
      await completeLesson(LESSON_ID);
      await completeLesson('407');
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
    <div className="erp-activity">
      {/* Header */}
      <ErpHeader onBack={onBack} />

      {/* Main Continuous Pathway Experience */}
      <main className="erp-activity__main">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* SCREEN 1: INTRO */}
          {/* ============================================================ */}
          {screen === 1 && (
            <motion.div
              key="screen-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen1.badge', { defaultValue: 'PSYCHOEDUCATION' })}</span>
              <h1 className="erp-hero-heading">
                {t('screen1.title', { defaultValue: 'HOW ERP WORKS' })}
              </h1>

              <p className="erp-subcopy">
                {t('screen1.subtitle', { defaultValue: 'ERP helps people with OCD practice facing what triggers them while changing what they do next.' })}
              </p>

              <blockquote className="erp-editorial-quote">
                {t('screen1.quote', { defaultValue: '“You don\'t practice being fearless. You practice responding differently.”' })}
              </blockquote>

              <button
                type="button"
                onClick={() => setScreen(2)}
                className="erp-action-btn"
              >
                <span>{t('screen1.btn_explore', { defaultValue: 'Explore' })}</span>
                <span>→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 2: MEET THE SITUATION */}
          {/* ============================================================ */}
          {screen === 2 && (
            <motion.div
              key="screen-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen2.badge', { defaultValue: 'SCENARIO 1' })}</span>
              <h2 className="erp-hero-heading">
                {t('screen2.title', { defaultValue: 'You\'ve Just Left the House.' })}
              </h2>

              {/* Environmental Illustration */}
              <div className="erp-scene-card">
                <HouseDoorScene state="trigger" />
                <div className="erp-thought-bubble">
                  {t('screen2.thought', { defaultValue: '“Did I lock the door?”' })}
                </div>
                <div className="erp-urge-tag">
                  {t('screen2.urge_tag', { defaultValue: 'You feel the urge to go back' })}
                </div>
              </div>

              <p className="erp-subcopy">
                {t('screen2.subtitle', { defaultValue: 'A common moment of doubt arrives. Let\'s see what happens when the urge is followed.' })}
              </p>

              <button
                type="button"
                onClick={() => setScreen(3)}
                className="erp-action-btn"
              >
                <span>{t('screen2.btn_see_happens', { defaultValue: 'See What Happens' })}</span>
                <span>→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 3: THE USUAL RESPONSE (FOLLOW THE URGE) */}
          {/* ============================================================ */}
          {screen === 3 && (
            <motion.div
              key="screen-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen3.badge', { defaultValue: 'PATH A' })}</span>
              <h2 className="erp-hero-heading">
                {t('screen3.title', { defaultValue: 'Follow the Urge' })}
              </h2>

              <div className="erp-scene-card">
                <HouseDoorScene state={usualStage === 'idle' ? 'trigger' : usualStage} />

                {usualStage === 'idle' && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsualStage('check');
                      setTimeout(() => setUsualStage('relief'), 1200);
                      setTimeout(() => setUsualStage('doubt'), 2600);
                    }}
                    className="erp-action-btn"
                    style={{ marginTop: '10px' }}
                  >
                    <span>{t('screen3.btn_check', { defaultValue: 'Check the Lock' })}</span>
                  </button>
                )}

                {usualStage === 'check' && (
                  <div className="erp-thought-bubble" style={{ color: '#0284C7' }}>
                    {t('screen3.checking_status', { defaultValue: 'Checking the handle... turning the key...' })}
                  </div>
                )}

                {usualStage === 'relief' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="erp-thought-bubble"
                    style={{ borderLeftColor: '#10B981', color: '#047857' }}
                  >
                    {t('screen3.relief_thought', { defaultValue: '“Okay, it\'s locked. Relief.”' })}
                  </motion.div>
                )}

                {usualStage === 'doubt' && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="erp-thought-bubble"
                    style={{ borderLeftColor: '#F43F5E', color: '#BE123C' }}
                  >
                    {t('screen3.doubt_thought', { defaultValue: '“Wait... did I really lock it properly?”' })}
                  </motion.div>
                )}
              </div>

              {usualStage === 'doubt' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <p className="erp-subcopy">
                    {t('screen3.subtitle', { defaultValue: 'The relief settled the feeling for a second, but doubt returned right after.' })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setScreen(4)}
                    className="erp-action-btn"
                  >
                    <span>{t('screen3.btn_continue', { defaultValue: 'Continue' })}</span>
                    <span>→</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 4: WHAT DID CHECKING DO? */}
          {/* ============================================================ */}
          {screen === 4 && (
            <motion.div
              key="screen-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen4.badge', { defaultValue: 'REFLECTION' })}</span>
              <h2 className="erp-hero-heading">
                {t('screen4.title', { defaultValue: 'What Did the Check Give You?' })}
              </h2>

              <div className="erp-learning-list">
                <div className="erp-learning-item">
                  <div className="erp-learning-dot" />
                  <span>{t('screen4.point1', { defaultValue: 'Relief right in the moment.' })}</span>
                </div>
                <div className="erp-learning-item">
                  <div className="erp-learning-dot" style={{ backgroundColor: '#F43F5E' }} />
                  <span>{t('screen4.point2', { defaultValue: 'More reason to check again when doubt returns.' })}</span>
                </div>
              </div>

              <p className="erp-subcopy">
                {t('screen4.subtitle', { defaultValue: 'Checking can reduce distress in the moment, but that short-term relief reinforces the brain\'s urge to check again.' })}
              </p>

              <button
                type="button"
                onClick={() => setScreen(5)}
                className="erp-action-btn"
              >
                <span>{t('screen4.btn_rewind', { defaultValue: 'Rewind the Moment' })}</span>
                <span>→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 5: REWIND */}
          {/* ============================================================ */}
          {screen === 5 && (
            <motion.div
              key="screen-5"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.4 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen5.badge', { defaultValue: 'REWIND' })}</span>
              <h2 className="erp-hero-heading">
                {t('screen5.title', { defaultValue: 'Let\'s Try the Same Moment Differently.' })}
              </h2>

              <div className="erp-scene-card">
                <HouseDoorScene state="trigger" />
                <div className="erp-thought-bubble">
                  {t('screen5.thought', { defaultValue: '“Did I lock the door?”' })}
                </div>
                <div className="erp-prevention-tag">
                  {t('screen5.urge_tag', { defaultValue: 'The urge appears: “Go back and check”' })}
                </div>
              </div>

              <p className="erp-subcopy">
                {t('screen5.subtitle', { defaultValue: 'This time, instead of automatically following the urge, we explore the ERP approach.' })}
              </p>

              <button
                type="button"
                onClick={() => setScreen(6)}
                className="erp-action-btn"
              >
                <span>{t('screen5.btn_step1', { defaultValue: 'Step 1: Exposure' })}</span>
                <span>→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 6: 1. EXPOSURE */}
          {/* ============================================================ */}
          {screen === 6 && (
            <motion.div
              key="screen-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen6.badge', { defaultValue: 'STEP 1' })}</span>
              <h2 className="erp-hero-heading">
                {t('screen6.title', { defaultValue: '1. Exposure' })}
              </h2>

              <p className="erp-subcopy" style={{ marginBottom: '14px' }}>
                {t('screen6.subtitle1', { defaultValue: 'ERP starts by approaching a trigger rather than avoiding it or making it go away.' })}
              </p>

              <div className="erp-scene-card">
                <HouseDoorScene state="exposure" />
                <div className="erp-thought-bubble">
                  {t('screen6.thought', { defaultValue: '“The doubt is here: Did I lock the door?”' })}
                </div>
              </div>

              <p className="erp-subcopy">
                {t('screen6.subtitle2', { defaultValue: 'In ERP, exposure means allowing the trigger or uncertainty to be present without immediately trying to push it out of mind.' })}
              </p>

              <button
                type="button"
                onClick={() => setScreen(7)}
                className="erp-action-btn"
              >
                <span>{t('screen6.btn_step2', { defaultValue: 'Step 2: Response Prevention' })}</span>
                <span>→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 7: 2. RESPONSE PREVENTION */}
          {/* ============================================================ */}
          {screen === 7 && (
            <motion.div
              key="screen-7"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen7.badge', { defaultValue: 'STEP 2' })}</span>
              <h2 className="erp-hero-heading">
                {t('screen7.title', { defaultValue: '2. Response Prevention' })}
              </h2>

              <p className="erp-subcopy" style={{ marginBottom: '14px' }}>
                {t('screen7.subtitle1', { defaultValue: 'Then comes the second part: resisting or delaying the compulsive response.' })}
              </p>

              <div className="erp-scene-card">
                <HouseDoorScene state="prevention" />
                <div className="erp-thought-bubble">
                  {t('screen7.thought', { defaultValue: 'Urge: “Go back and check right now.”' })}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', width: '100%', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setScreen(8)}
                    className="erp-action-btn"
                    style={{ width: '100%' }}
                  >
                    <span>{t('screen7.btn_dont_check', { defaultValue: 'Don\'t Check Right Now' })}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              <p className="erp-subcopy">
                {t('screen7.subtitle2', { defaultValue: 'Simulated practice: Choosing not to perform the ritual gives the brain a chance to learn something new.' })}
              </p>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 8: THE DIFFERENCE (SIDE-BY-SIDE PATHWAYS) */}
          {/* ============================================================ */}
          {screen === 8 && (
            <motion.div
              key="screen-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen8.badge', { defaultValue: 'COMPARISON' })}</span>
              <h2 className="erp-hero-heading">
                {t('screen8.title', { defaultValue: 'The Two Pathways' })}
              </h2>

              <div className="erp-comparison-grid">
                {/* Left: Follow Urge */}
                <div className="erp-path-col">
                  <div className="erp-path-title">{t('screen8.col_urge_title', { defaultValue: 'Follow the Urge' })}</div>
                  <div className="erp-path-steps">
                    <div className="erp-path-step-pill">{t('screen8.col_urge_step1', { defaultValue: 'Trigger' })}</div>
                    <span style={{ color: '#94A3B8', fontSize: '12px' }}>↓</span>
                    <div className="erp-path-step-pill">{t('screen8.col_urge_step2', { defaultValue: 'Check' })}</div>
                    <span style={{ color: '#94A3B8', fontSize: '12px' }}>↓</span>
                    <div className="erp-path-step-pill">{t('screen8.col_urge_step3', { defaultValue: 'Relief' })}</div>
                    <span style={{ color: '#94A3B8', fontSize: '12px' }}>↓</span>
                    <div className="erp-path-step-pill" style={{ color: '#BE123C' }}>{t('screen8.col_urge_step4', { defaultValue: 'Doubt returns' })}</div>
                  </div>
                </div>

                {/* Right: ERP */}
                <div className="erp-path-col erp-side">
                  <div className="erp-path-title">{t('screen8.col_erp_title', { defaultValue: 'ERP Pathway' })}</div>
                  <div className="erp-path-steps">
                    <div className="erp-path-step-pill">{t('screen8.col_erp_step1', { defaultValue: 'Trigger' })}</div>
                    <span style={{ color: '#0284C7', fontSize: '12px' }}>↓</span>
                    <div className="erp-path-step-pill">{t('screen8.col_erp_step2', { defaultValue: 'Urge' })}</div>
                    <span style={{ color: '#0284C7', fontSize: '12px' }}>↓</span>
                    <div className="erp-path-step-pill">{t('screen8.col_erp_step3', { defaultValue: 'Response Prevention' })}</div>
                    <span style={{ color: '#0284C7', fontSize: '12px' }}>↓</span>
                    <div className="erp-path-step-pill" style={{ fontWeight: 700, color: '#005387' }}>{t('screen8.col_erp_step4', { defaultValue: 'New learning' })}</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setScreen(9)}
                className="erp-action-btn"
              >
                <span>{t('screen8.btn_learning', { defaultValue: 'What Are You Learning?' })}</span>
                <span>→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 9: WHAT ARE YOU LEARNING? */}
          {/* ============================================================ */}
          {screen === 9 && (
            <motion.div
              key="screen-9"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen9.badge', { defaultValue: 'CORE INSIGHT' })}</span>
              <h2 className="erp-hero-heading">
                {t('screen9.title', { defaultValue: 'The Point Isn\'t to Feel Nothing.' })}
              </h2>

              <p className="erp-subcopy" style={{ marginBottom: '16px' }}>
                {t('screen9.subtitle', { defaultValue: 'ERP is not about making distress disappear instantly. It teaches:' })}
              </p>

              <div className="erp-learning-list">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="erp-learning-item"
                >
                  <div className="erp-learning-dot" />
                  <span>{t('screen9.insight1', { defaultValue: '“I can experience uncertainty and tolerate it.”' })}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="erp-learning-item"
                >
                  <div className="erp-learning-dot" />
                  <span>{t('screen9.insight2', { defaultValue: '“I can have an urge without automatically acting on it.”' })}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="erp-learning-item"
                >
                  <div className="erp-learning-dot" />
                  <span>{t('screen9.insight3', { defaultValue: '“I don\'t need a ritual to respond to every doubt.”' })}</span>
                </motion.div>
              </div>

              <button
                type="button"
                onClick={() => setScreen(10)}
                className="erp-action-btn"
              >
                <span>{t('screen9.btn_scenario2', { defaultValue: 'Try a Second Scenario' })}</span>
                <span>→</span>
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 10: SECOND SCENARIO (INTERACTIVE UNDERSTANDING) */}
          {/* ============================================================ */}
          {screen === 10 && (
            <motion.div
              key="screen-10"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen10.badge', { defaultValue: 'SCENARIO 2' })}</span>
              <h2 className="erp-hero-heading">
                {t('screen10.title', { defaultValue: 'You Sent an Important Message.' })}
              </h2>

              <div className="erp-scene-card">
                <MessageSentScene />
                <div className="erp-thought-bubble">
                  {t('screen10.thought', { defaultValue: 'Thought: “Did I say something wrong?”' })}
                </div>
                <div className="erp-urge-tag">
                  {t('screen10.urge_tag', { defaultValue: 'Urge: Read it again' })}
                </div>
              </div>

              <p style={{ fontSize: '14.5px', fontWeight: 700, color: '#18243A', margin: '0 0 12px 0' }}>
                {t('screen10.question', { defaultValue: 'What would response prevention look like?' })}
              </p>

              {/* Multiple Choice Educational Options */}
              <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
                <button
                  type="button"
                  onClick={() => setSelectedOption('read')}
                  className={`erp-option-item ${selectedOption === 'read' ? 'selected-compulsion' : ''}`}
                >
                  {t('screen10.opt_read', { defaultValue: 'Read the message again to be sure' })}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('ask')}
                  className={`erp-option-item ${selectedOption === 'ask' ? 'selected-compulsion' : ''}`}
                >
                  {t('screen10.opt_ask', { defaultValue: 'Ask someone if it sounds okay' })}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('leave')}
                  className={`erp-option-item ${selectedOption === 'leave' ? 'selected-correct' : ''}`}
                >
                  {t('screen10.opt_leave', { defaultValue: 'Leave it as it is for now without re-reading' })}
                </button>
              </div>

              {/* Gentle Educational Feedback */}
              {selectedOption === 'leave' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="erp-feedback-box correct"
                >
                  {t('screen10.feedback_correct', { defaultValue: '✓ That\'s an example of resisting the checking or reassurance response.' })}
                </motion.div>
              )}

              {selectedOption && selectedOption !== 'leave' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="erp-feedback-box reconsider"
                >
                  {t('screen10.feedback_incorrect', { defaultValue: 'That would be a way of responding to the uncertainty. In ERP, response prevention means practicing not using the checking or reassurance behavior.' })}
                </motion.div>
              )}

              <div style={{ marginTop: '14px' }}>
                {selectedOption === 'leave' ? (
                  <button
                    type="button"
                    onClick={() => setScreen(11)}
                    className="erp-action-btn"
                  >
                    <span>{t('screen10.btn_final_model', { defaultValue: 'Final Model' })}</span>
                    <span>→</span>
                  </button>
                ) : selectedOption ? (
                  <button
                    type="button"
                    onClick={() => setSelectedOption(null)}
                    className="erp-action-btn secondary"
                  >
                    <span>{t('screen10.btn_try_again', { defaultValue: 'Try Again' })}</span>
                  </button>
                ) : null}
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 11: FINAL MODEL & TAKEAWAY */}
          {/* ============================================================ */}
          {screen === 11 && (
            <motion.div
              key="screen-11"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="erp-screen-container"
            >
              <span className="erp-badge-num">{t('screen11.badge', { defaultValue: 'SUMMARY' })}</span>
              <h2 className="erp-hero-heading">
                {t('screen11.title', { defaultValue: 'ERP Changes What You Do Next.' })}
              </h2>

              <div className="erp-pathway-flow">
                <div className="erp-pathway-node">
                  <span>{t('screen11.node_trigger', { defaultValue: 'Trigger' })}</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{t('screen11.node_trigger_sub', { defaultValue: 'Doubt arrives' })}</span>
                </div>
                <div className="erp-pathway-connector" />
                <div className="erp-pathway-node">
                  <span>{t('screen11.node_urge', { defaultValue: 'Urge' })}</span>
                  <span style={{ fontSize: '11px', color: '#E11D48' }}>{t('screen11.node_urge_sub', { defaultValue: 'Desire to ritualize' })}</span>
                </div>
                <div className="erp-pathway-connector" />
                <div className="erp-pathway-node highlight-erp">
                  <span>{t('screen11.node_erp', { defaultValue: 'Exposure + Response Prevention' })}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>{t('screen11.node_erp_sub', { defaultValue: 'Resist compulsion' })}</span>
                </div>
                <div className="erp-pathway-connector" />
                <div className="erp-pathway-node highlight-relief">
                  <span>{t('screen11.node_learning', { defaultValue: 'New Learning' })}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>{t('screen11.node_learning_sub', { defaultValue: 'Uncertainty can be tolerated' })}</span>
                </div>
              </div>

              <p className="erp-subcopy" style={{ maxWidth: '440px', marginBottom: '28px' }}>
                {t('screen11.subtitle', { defaultValue: 'The goal isn\'t to eliminate every intrusive thought or feeling. It\'s to build a different response to them.' })}
              </p>

              <button
                type="button"
                onClick={handleComplete}
                className="erp-action-btn"
              >
                <span>{t('screen11.btn_complete', { defaultValue: 'Complete Activity' })}</span>
                <span>→</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
