import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import OcdMoodHeader from '../components/ocdMood/OcdMoodHeader';
import MoodGlyph from '../components/ocdMood/MoodGlyph';
import OcdMomentsHistoryView from '../components/ocdMood/OcdMomentsHistoryView';
import {
  OcdMoodLog,
  MOOD_LEVELS,
  OCD_EXPERIENCE_OPTIONS,
  getMoodLabel,
  getExperienceLabel,
  createOcdMoodLog,
  getOcdMoodLogs,
  updateOcdMoodLog,
  deleteOcdMoodLog
} from '../services/ocdMoodService';
import { completeLesson } from '../mantra/api';
import '../components/ocdMood/OcdMood.css';

const LESSON_ID = 'ocd_mood_check_in';

interface OcdMoodTrackerActivityProps {
  onBack?: () => void;
  onNavigate?: (route: string) => void;
}

export default function OcdMoodTrackerActivity({
  onBack,
  onNavigate
}: OcdMoodTrackerActivityProps) {
  const { t } = useTranslation('ocd_mood_check_in');

  // Navigation / Tab state: 'checkin' | 'moments'
  const [viewMode, setViewMode] = useState<'checkin' | 'moments'>('checkin');

  // Multi-step check-in flow: 1 -> 2 -> 3 -> 4 -> 5 (Saved)
  const [step, setStep] = useState<number>(1);

  // Check-In Form State
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [ocdImpact, setOcdImpact] = useState<number>(3);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedMoment, setSavedMoment] = useState<OcdMoodLog | null>(null);

  // User History State
  const [userLogs, setUserLogs] = useState<OcdMoodLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  // Load User's History on Mount
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const logs = await getOcdMoodLogs();
      setUserLogs(logs);
    } catch (e) {
      console.warn('Error fetching OCD mood history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle Multi-Select Experiences
  const handleToggleExperience = (id: string) => {
    if (id === 'NONE') {
      setSelectedExperiences(['NONE']);
      return;
    }
    setSelectedExperiences((prev) => {
      const filtered = prev.filter((x) => x !== 'NONE');
      if (filtered.includes(id)) {
        const next = filtered.filter((x) => x !== id);
        return next.length === 0 ? [] : next;
      }
      return [...filtered, id];
    });
  };

  // Submit Check-In
  const handleSaveCheckIn = async () => {
    if (!selectedMood) return;

    try {
      setIsSubmitting(true);
      const created = await createOcdMoodLog({
        mood: selectedMood,
        ocdImpact,
        experiences: selectedExperiences.length > 0 ? selectedExperiences : ['NONE'],
        note: note.trim()
      });

      // Complete activity in platform if registered
      try {
        await completeLesson(LESSON_ID);
        await completeLesson('daily-check-in');
      } catch (e) {
        // Warning logged gracefully
      }

      setSavedMoment(created);
      setUserLogs((prev) => [created, ...prev]);
      setStep(5); // Transition to Screen 5: Saved
    } catch (e) {
      console.error('Error saving OCD mood check-in:', e);
      alert(t('error_save', { defaultValue: 'Could not save check-in. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restart pristine check-in
  const handleResetCheckIn = () => {
    setSelectedMood(null);
    setOcdImpact(3);
    setSelectedExperiences([]);
    setNote('');
    setSavedMoment(null);
    setStep(1);
    setViewMode('checkin');
  };

  // Update Log Handlers
  const handleUpdateLog = async (
    id: string | number,
    data: { mood: number; ocdImpact: number; experiences: string[]; note: string }
  ) => {
    const updated = await updateOcdMoodLog(id, data);
    setUserLogs((prev) => prev.map((l) => (l.id === id ? updated : l)));
  };

  // Delete Log Handlers
  const handleDeleteLog = async (id: string | number) => {
    await deleteOcdMoodLog(id);
    setUserLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleHeaderBack = () => {
    if (viewMode === 'moments') {
      setViewMode('checkin');
      return;
    }
    if (step > 1 && step < 5) {
      setStep((s) => s - 1);
      return;
    }
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('/dashboard');
    } else {
      window.location.hash = '#/';
    }
  };

  const formatSavedDate = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return `${d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} · ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
  };

  return (
    <div className="ocd-mood-activity">
      {/* Header */}
      <OcdMoodHeader
        onBack={handleHeaderBack}
        showTabs={userLogs.length > 0}
        activeTab={viewMode}
        onTabChange={(tab) => setViewMode(tab === 'moments' ? 'moments' : 'checkin')}
      />

      <main className="ocd-mood-main">
        {/* ============================================================ */}
        {/* VIEW MODE: MOMENTS HISTORY */}
        {/* ============================================================ */}
        {viewMode === 'moments' ? (
          <OcdMomentsHistoryView
            logs={userLogs}
            onStartNewCheckIn={handleResetCheckIn}
            onUpdateLog={handleUpdateLog}
            onDeleteLog={handleDeleteLog}
          />
        ) : (
          <AnimatePresence mode="wait">
            {/* ============================================================ */}
            {/* VIEW MODE: CHECK-IN FLOW (SCREENS 1 TO 5) */}
            {/* ============================================================ */}
            {/* ------------------------------------------------------------ */}
            {/* SCREEN 1: MOOD */}
            {/* ------------------------------------------------------------ */}
            {step === 1 && (
              <motion.div
                key="screen-1-mood"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="ocd-mood-screen"
              >
                <span className="ocd-mood-badge">{t('screen1.badge', { defaultValue: 'OCD MOOD CHECK-IN' })}</span>
                <h1 className="ocd-mood-heading">
                  {t('screen1.title', { defaultValue: 'How are you feeling right now?' })}
                </h1>
                <p className="ocd-mood-subcopy">
                  {t('screen1.subtitle', { defaultValue: 'Take a quick snapshot. There’s no right answer.' })}
                </p>

                {/* 5 Distinct Mood Choices */}
                <div className="ocd-mood-choice-list">
                  {MOOD_LEVELS.map((m) => {
                    const isSelected = selectedMood === m.value;
                    const titleKey = `screen1.levels.l${m.value}_title`;
                    const subKey = `screen1.levels.l${m.value}_sub`;
                    return (
                      <motion.div
                        key={m.value}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMood(m.value)}
                        className={`ocd-mood-choice-tile ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="ocd-mood-choice-content">
                          <span className="ocd-mood-choice-title">
                            {t(titleKey, { defaultValue: `${m.value} — ${m.label}` })}
                          </span>
                          <span className="ocd-mood-choice-subtitle">
                            {t(subKey, { defaultValue: m.subtitle })}
                          </span>
                        </div>
                        <MoodGlyph level={m.value} isSelected={isSelected} size={44} />
                      </motion.div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedMood}
                  className="ocd-mood-btn"
                >
                  <span>{t('screen1.btn_continue', { defaultValue: 'Continue' })}</span>
                  <span>→</span>
                </button>
              </motion.div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* SCREEN 2: OCD IMPACT */}
            {/* ------------------------------------------------------------ */}
            {step === 2 && (
              <motion.div
                key="screen-2-impact"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="ocd-mood-screen"
              >
                <span className="ocd-mood-badge">{t('screen2.badge', { defaultValue: 'STEP 2 OF 4' })}</span>
                <h2 className="ocd-mood-heading">
                  {t('screen2.title', { defaultValue: 'How much has OCD been on your mind today?' })}
                </h2>
                <p className="ocd-mood-subcopy">
                  {t('screen2.subtitle', { defaultValue: 'Think about the amount of attention, distress, or disruption OCD has taken up today.' })}
                </p>

                {/* Refined Horizontal Slider Card */}
                <div className="ocd-impact-card">
                  <div className="ocd-impact-value-display">
                    {ocdImpact}
                  </div>
                  <div className="ocd-impact-label-display">
                    {ocdImpact === 1 && t('screen2.impact_l1', { defaultValue: 'Not much — Quiet' })}
                    {ocdImpact === 2 && t('screen2.impact_l2', { defaultValue: 'Mild — Manageable' })}
                    {ocdImpact === 3 && t('screen2.impact_l3', { defaultValue: 'Moderate — Noticeable' })}
                    {ocdImpact === 4 && t('screen2.impact_l4', { defaultValue: 'Significant — Disruptive' })}
                    {ocdImpact === 5 && t('screen2.impact_l5', { defaultValue: 'A lot — High presence' })}
                  </div>

                  <div className="ocd-impact-slider-track">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={ocdImpact}
                      onChange={(e) => setOcdImpact(Number(e.target.value))}
                      className="ocd-impact-slider"
                      aria-label="OCD impact today"
                    />

                    <div className="ocd-impact-scale-ticks">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <span
                          key={val}
                          onClick={() => setOcdImpact(val)}
                          className={`ocd-impact-scale-tick ${ocdImpact === val ? 'active' : ''}`}
                        >
                          {val}
                        </span>
                      ))}
                    </div>

                    <div className="ocd-impact-scale-bounds">
                      <span>{t('screen2.scale_min', { defaultValue: '1 = Not much' })}</span>
                      <span>{t('screen2.scale_max', { defaultValue: '5 = A lot' })}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="ocd-mood-btn secondary"
                  >
                    <span>{t('screen2.btn_back', { defaultValue: 'Back' })}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="ocd-mood-btn"
                  >
                    <span>{t('screen2.btn_continue', { defaultValue: 'Continue' })}</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* SCREEN 3: WHAT STOOD OUT? */}
            {/* ------------------------------------------------------------ */}
            {step === 3 && (
              <motion.div
                key="screen-3-experiences"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="ocd-mood-screen"
              >
                <span className="ocd-mood-badge">{t('screen3.badge', { defaultValue: 'STEP 3 OF 4' })}</span>
                <h2 className="ocd-mood-heading">
                  {t('screen3.title', { defaultValue: 'What stood out today?' })}
                </h2>
                <p className="ocd-mood-subcopy">
                  {t('screen3.subtitle', { defaultValue: 'Choose anything that was part of your experience.' })}
                </p>

                {/* Calm Multi-Select Rows */}
                <div className="ocd-experiences-list">
                  {OCD_EXPERIENCE_OPTIONS.map((opt) => {
                    const isSelected = selectedExperiences.includes(opt.id);
                    const optKey = `screen3.experiences.${opt.id}`;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleToggleExperience(opt.id)}
                        className={`ocd-experience-row ${isSelected ? 'selected' : ''}`}
                      >
                        <span>{t(optKey, { defaultValue: opt.label })}</span>
                        <div className="ocd-experience-checkbox">
                          {isSelected && '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="ocd-mood-btn secondary"
                  >
                    <span>{t('screen3.btn_back', { defaultValue: 'Back' })}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="ocd-mood-btn"
                  >
                    <span>{t('screen3.btn_continue', { defaultValue: 'Continue' })}</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* SCREEN 4: OPTIONAL NOTE */}
            {/* ------------------------------------------------------------ */}
            {step === 4 && (
              <motion.div
                key="screen-4-note"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="ocd-mood-screen"
              >
                <span className="ocd-mood-badge">{t('screen4.badge', { defaultValue: 'STEP 4 OF 4' })}</span>
                <h2 className="ocd-mood-heading">
                  {t('screen4.title', { defaultValue: 'Anything you want to remember?' })}
                </h2>
                <p className="ocd-mood-subcopy">
                  {t('screen4.subtitle', { defaultValue: 'Optional. A few words are enough.' })}
                </p>

                <div className="ocd-note-container">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 500))}
                    placeholder={t('screen4.placeholder', { defaultValue: 'Write a note...' })}
                    className="ocd-note-textarea"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="ocd-note-char-count">
                    {note.length} / 500
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="ocd-mood-btn secondary"
                  >
                    <span>{t('screen4.btn_back', { defaultValue: 'Back' })}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCheckIn}
                    disabled={isSubmitting}
                    className="ocd-mood-btn"
                  >
                    <span>{isSubmitting ? t('screen4.saving', { defaultValue: 'Saving...' }) : t('screen4.btn_save', { defaultValue: 'Save check-in' })}</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* SCREEN 5: SAVED / TODAY'S MOMENT */}
            {/* ------------------------------------------------------------ */}
            {step === 5 && (
              <motion.div
                key="screen-5-saved"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.03 }}
                transition={{ duration: 0.35 }}
                className="ocd-mood-screen"
              >
                <span className="ocd-mood-badge" style={{ color: '#047857' }}>
                  {t('screen5.badge', { defaultValue: '✓ SAVED' })}
                </span>
                <h2 className="ocd-mood-heading">
                  {t('screen5.title', { defaultValue: 'Today\'s Moment.' })}
                </h2>
                <p className="ocd-mood-subcopy">
                  {t('screen5.subtitle', { defaultValue: 'Your check-in has been recorded to your private timeline.' })}
                </p>

                {/* Today's Moment Card */}
                <div className="ocd-moment-card">
                  <div className="ocd-moment-date">
                    {formatSavedDate(savedMoment?.createdAt)}
                  </div>

                  <div className="ocd-moment-header-row">
                    <div className="ocd-moment-mood-info">
                      <MoodGlyph level={selectedMood || 3} isSelected size={36} />
                      <span className="ocd-moment-mood-name">
                        {getMoodLabel(selectedMood || 3)}
                      </span>
                    </div>

                    <div className="ocd-moment-impact-tag">
                      {t('screen5.impact_label', { impact: ocdImpact, defaultValue: `OCD impact ${ocdImpact} / 5` })}
                    </div>
                  </div>

                  {selectedExperiences.length > 0 && selectedExperiences[0] !== 'NONE' && (
                    <div className="ocd-moment-experiences">
                      {selectedExperiences.map((exp) => (
                        <span key={exp} className="ocd-moment-chip">
                          {t(`screen3.experiences.${exp}`, { defaultValue: getExperienceLabel(exp) })}
                        </span>
                      ))}
                    </div>
                  )}

                  {note && (
                    <div className="ocd-moment-note">
                      "{note}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '320px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('moments')}
                    className="ocd-mood-btn"
                    style={{ width: '100%' }}
                  >
                    <span>{t('screen5.btn_view_moments', { defaultValue: 'View your moments' })}</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onBack) onBack();
                      else if (onNavigate) onNavigate('/dashboard');
                      else window.location.hash = '#/';
                    }}
                    className="ocd-mood-btn secondary"
                    style={{ width: '100%' }}
                  >
                    <span>{t('screen5.btn_done', { defaultValue: 'Done' })}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
