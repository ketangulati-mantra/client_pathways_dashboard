import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  GripVertical,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';
import { handleExit } from '../mantra/navigation';
import { completeLesson } from '../mantra/api';
import { getActiveUserId } from '../services/authService';
import {
  logUserActivityToDB,
  getUserActivityHistory
} from '../services/activityLogger';

const LESSON_ID = 'ocd_fear_ladder';
const ACTIVITY_ID = 'ocd_fear_ladder';
const STORAGE_KEY = 'ocdmantra_fear_ladder_flow_v5';
const OCDMANTRA_LOGO_URL =
  'https://res.cloudinary.com/hxbamdqf/image/upload/v1785929926/ocdmantraicon_cnxa03.png';

export default function FearLadderActivity({ onBack, onNavigate }) {
  const { t } = useTranslation('ocd_fear_ladder');

  // Tabs: 'build' | 'history'
  const [activeTab, setActiveTab] = useState('build');

  // Build Stages: 'hero' -> 'collect' -> 'rank' -> 'ladder'
  const [stage, setStage] = useState('hero');

  // Situations Data Model: Array of { id, text, order, difficulty: null }
  const [situations, setSituations] = useState([]);

  // Collect Writing Surface Input
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSavedConfirmation, setIsSavedConfirmation] = useState(false);

  // Past Ladders History State
  const [pastLadders, setPastLadders] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [selectedPastLadder, setSelectedPastLadder] = useState(null);

  // Load Past Ladders from DB
  const fetchPastLadders = async () => {
    setIsLoadingHistory(true);
    setHistoryError(false);
    try {
      const userId = getActiveUserId();
      const history = await getUserActivityHistory(ACTIVITY_ID, userId);
      if (Array.isArray(history)) {
        // Filter valid fear ladder entries
        const validLadders = history
          .filter(
            (item) =>
              item.metadata?.situations &&
              Array.isArray(item.metadata.situations) &&
              item.metadata.situations.length > 0
          )
          .map((item) => ({
            id: item.id || `ladder_${item.created_at}`,
            createdAt: item.created_at,
            situations: item.metadata.situations
          }));
        setPastLadders(validLadders);
      } else {
        setPastLadders([]);
      }
    } catch (err) {
      console.error('[FearLadder] Error loading history:', err);
      setHistoryError(true);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchPastLadders();
    }
  }, [activeTab]);

  // Handle Add in Collect Stage
  const handleAddSituation = (e) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) {
      setInputError(t('collect_error_empty', { defaultValue: 'Please write a situation first.' }));
      return;
    }
    if (situations.length >= 8) {
      setInputError(t('collect_error_max', { defaultValue: 'You have reached the recommended maximum of 8 situations.' }));
      return;
    }

    const newSit = {
      id: 'sit_' + Date.now(),
      text: trimmed,
      order: situations.length + 1,
      difficulty: null
    };

    setSituations((prev) => [...prev, newSit]);
    setInputText('');
    setInputError('');
  };

  // Sync to LocalStorage for unsaved recovery
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(situations));
    } catch (e) {
      console.warn('Failed to save fear ladder state:', e);
    }
  }, [situations]);

  // Remove Situation
  const handleRemove = (id) => {
    setSituations((prev) => prev.filter((s) => s.id !== id));
  };

  // Finish & Persist Completed Ladder to DB
  const handleCompleteActivity = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    const userId = getActiveUserId();
    const orderedSituations = situations.map((sit, index) => ({
      id: sit.id || `sit_${index}`,
      text: sit.text,
      order: index + 1,
      difficulty: sit.difficulty || null
    }));

    const snapshotPayload = {
      userId,
      activityId: ACTIVITY_ID,
      activityType: 'ocd_fear_ladder',
      lessonId: LESSON_ID,
      metadata: {
        situations: orderedSituations,
        totalSituations: orderedSituations.length,
        savedAt: new Date().toISOString()
      },
      resultSummary: {
        situationCount: orderedSituations.length,
        completedAt: new Date().toISOString()
      }
    };

    try {
      await logUserActivityToDB(snapshotPayload);
      await completeLesson(LESSON_ID);
      setIsSavedConfirmation(true);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    } catch (e) {
      console.error('Completion & persistence error:', e);
    } finally {
      setIsCompleting(false);
    }
  };

  // Format Date / Time Helpers
  const formatDateTime = (isoString) => {
    if (!isoString) return { date: 'Recently', time: '' };
    try {
      const d = new Date(isoString);
      const dateStr = d.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      });
      return { date: dateStr, time: timeStr };
    } catch (e) {
      return { date: 'Recently', time: '' };
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        backgroundColor: '#F7F0E6',
        color: '#29252B',
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* HEADER                                                        */}
      {/* ------------------------------------------------------------- */}
      <header
        style={{
          width: '100%',
          maxWidth: '960px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          boxSizing: 'border-box'
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (selectedPastLadder) setSelectedPastLadder(null);
            else if (stage === 'hero') handleExit(onBack, onNavigate);
            else if (stage === 'collect') setStage('hero');
            else if (stage === 'rank') setStage('collect');
            else if (stage === 'ladder') setStage('rank');
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#3D2940',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '8px 14px',
            borderRadius: '999px',
            backgroundColor: 'rgba(61, 41, 64, 0.06)'
          }}
        >
          <ArrowLeft size={16} />
          <span>{selectedPastLadder ? t('header_past_ladders', { defaultValue: 'Past Ladders' }) : t('header_back', { defaultValue: 'Back' })}</span>
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

        <div style={{ width: '80px', display: 'flex', justifyContent: 'flex-end' }} />
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2-TAB SEGMENTED BAR (ONLY ON HERO / LANDING SCREEN)          */}
      {/* ------------------------------------------------------------- */}
      {stage === 'hero' && !selectedPastLadder && (
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            margin: '0 auto 16px auto',
            padding: '4px',
            borderRadius: '999px',
            backgroundColor: 'rgba(61, 41, 64, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 20
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('build');
              setSituations([]);
              setInputText('');
              setInputError('');
              setIsSavedConfirmation(false);
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: activeTab === 'build' ? '#3D2940' : 'transparent',
              color: activeTab === 'build' ? '#F7F0E6' : '#64748b',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {t('tab_build', { defaultValue: 'BUILD NEW' })}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: activeTab === 'history' ? '#3D2940' : 'transparent',
              color: activeTab === 'history' ? '#F7F0E6' : '#64748b',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {t('tab_past', { defaultValue: 'PAST LADDERS' })}
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA                                             */}
      {/* ------------------------------------------------------------- */}
      <main
        style={{
          width: '100%',
          maxWidth: '820px',
          margin: '0 auto',
          padding: '16px 24px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          boxSizing: 'border-box'
        }}
      >
        {/* ========================================================== */}
        {/* READ-ONLY PAST LADDER HISTORICAL VIEW                     */}
        {/* ========================================================== */}
        {selectedPastLadder ? (
          <motion.div
            key="past_ladder_view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              width: '100%',
              maxWidth: '740px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingBottom: '40px'
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#E47761',
                  display: 'block',
                  marginBottom: '6px'
                }}
              >
                {t('past_badge', { defaultValue: 'SAVED HISTORICAL ARTIFACT' })}
              </span>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 5vw, 2.7rem)',
                  fontWeight: 900,
                  color: '#3D2940',
                  margin: '0 0 6px 0',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em'
                }}
              >
                {t('past_title', { defaultValue: 'YOUR FEAR LADDER' })}
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, fontWeight: 600 }}>
                {formatDateTime(selectedPastLadder.createdAt).date} · {formatDateTime(selectedPastLadder.createdAt).time}
              </p>
            </div>

            {/* PHYSICAL LADDER RENDERING */}
            <div
              style={{
                width: '100%',
                maxWidth: '560px',
                position: 'relative',
                padding: '24px 16px 20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#E47761',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>▲</span>
                <span>{t('past_more_challenging', { defaultValue: 'MORE CHALLENGING' })}</span>
              </div>

              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '480px',
                  padding: '20px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {/* Rails */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    left: '32px',
                    width: '14px',
                    borderRadius: '7px',
                    background: 'linear-gradient(90deg, #251628 0%, #3D2940 45%, #583F5C 85%, #2D1A30 100%)',
                    boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.2), 3px 6px 16px rgba(45, 26, 48, 0.35)',
                    zIndex: 2
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    right: '32px',
                    width: '14px',
                    borderRadius: '7px',
                    background: 'linear-gradient(90deg, #251628 0%, #3D2940 45%, #583F5C 85%, #2D1A30 100%)',
                    boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.2), 3px 6px 16px rgba(45, 26, 48, 0.35)',
                    zIndex: 2
                  }}
                />

                {/* Rungs */}
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    zIndex: 3
                  }}
                >
                  {selectedPastLadder.situations.map((sit, idx) => (
                    <div
                      key={sit.id || idx}
                      style={{
                        position: 'relative',
                        width: '100%',
                        padding: '0 24px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          minHeight: '52px',
                          borderRadius: '10px',
                          background: 'linear-gradient(180deg, #533B57 0%, #3D2940 35%, #2B1B2D 100%)',
                          boxShadow: '0 6px 18px rgba(45, 26, 48, 0.28), inset 0 1px 2px rgba(255,255,255,0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          padding: '12px 28px',
                          boxSizing: 'border-box',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: '12px',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#E47761',
                            boxShadow: '0 0 4px rgba(228, 119, 97, 0.6)'
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            right: '12px',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#E47761',
                            boxShadow: '0 0 4px rgba(228, 119, 97, 0.6)'
                          }}
                        />
                        <span
                          style={{
                            color: '#F7F0E6',
                            fontWeight: 700,
                            fontSize: '0.94rem',
                            lineHeight: 1.35,
                            textAlign: 'left',
                            letterSpacing: '-0.01em',
                            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                            wordBreak: 'break-word'
                          }}
                        >
                          {sit.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#6B8E23',
                  textTransform: 'uppercase',
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>▼</span>
                <span>{t('past_easier', { defaultValue: 'EASIER' })}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPastLadder(null)}
              style={{
                marginTop: '16px',
                padding: '12px 28px',
                borderRadius: '999px',
                backgroundColor: '#3D2940',
                color: '#F7F0E6',
                fontSize: '0.88rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(61, 41, 64, 0.2)'
              }}
            >
              {t('past_back_btn', { defaultValue: '← BACK TO PAST LADDERS' })}
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ========================================================
                STAGE 0: HERO (BUILD NEW vs PAST LADDERS TAB)
               ======================================================== */}
            {stage === 'hero' && activeTab === 'build' && (
              <motion.div
                key="hero_build"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4 }}
                style={{
                  width: '100%',
                  maxWidth: '580px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#E47761',
                    display: 'block',
                    marginBottom: '12px'
                  }}
                >
                  {t('hero_badge', { defaultValue: 'YOUR HIERARCHY' })}
                </span>

                <h1
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                    fontWeight: 800,
                    lineHeight: 1.02,
                    color: '#3D2940',
                    margin: '0 0 18px 0',
                    letterSpacing: '-0.025em'
                  }}
                >
                  {t('hero_title_line1', { defaultValue: 'BUILD YOUR' })}
                  <br />
                  <span style={{ color: '#E47761' }}>{t('hero_title_line2', { defaultValue: 'FEAR LADDER' })}</span>
                </h1>

                <p
                  style={{
                    fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
                    fontWeight: 600,
                    color: '#29252B',
                    lineHeight: 1.4,
                    margin: '0 0 10px 0'
                  }}
                >
                  {t('hero_subtitle', { defaultValue: 'Put difficult situations in order, from easier to more challenging.' })}
                </p>

                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    lineHeight: 1.5,
                    margin: '0 0 36px 0',
                    maxWidth: '440px'
                  }}
                >
                  {t('hero_support', { defaultValue: "You don't need to get the order perfect. You can change it as you go." })}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSituations([]);
                    setInputText('');
                    setInputError('');
                    setIsSavedConfirmation(false);
                    setStage('collect');
                  }}
                  style={{
                    height: '56px',
                    padding: '0 36px',
                    borderRadius: '999px',
                    backgroundColor: '#3D2940',
                    color: '#F7F0E6',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 10px 25px rgba(61, 41, 64, 0.25)',
                    transition: 'transform 0.15s ease',
                    margin: '0 auto'
                  }}
                >
                  <span>{t('hero_start_cta', { defaultValue: 'START BUILDING' })}</span>
                  <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* ========================================================
                PAST LADDERS ARCHIVE TAB
               ======================================================== */}
            {stage === 'hero' && activeTab === 'history' && (
              <motion.div
                key="hero_history"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3D2940', margin: '0 0 6px 0' }}>
                    {t('tab_past', { defaultValue: 'PAST LADDERS' })}
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                    {t('past_empty_desc', { defaultValue: 'Your previous fear ladders, saved by date.' })}
                  </p>
                </div>

                {/* Loading State */}
                {isLoadingHistory && (
                  <div style={{ padding: '36px 0', color: '#64748b', fontSize: '0.9rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '3px solid rgba(61, 41, 64, 0.15)',
                        borderTopColor: '#3D2940',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px auto'
                      }}
                    />
                    <span>{t('past_loading', { defaultValue: 'Loading your saved ladders...' })}</span>
                  </div>
                )}

                {/* Error State */}
                {historyError && !isLoadingHistory && (
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      textAlign: 'center',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <p style={{ color: '#29252B', fontSize: '0.9rem', margin: '0 0 12px 0' }}>
                      {t('past_error', { defaultValue: "We couldn't load your past ladders right now." })}
                    </p>
                    <button
                      type="button"
                      onClick={fetchPastLadders}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '999px',
                        backgroundColor: '#3D2940',
                        color: '#F7F0E6',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {t('past_try_again', { defaultValue: 'TRY AGAIN' })}
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoadingHistory && !historyError && pastLadders.length === 0 && (
                  <div
                    style={{
                      padding: '36px 24px',
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px dashed rgba(61, 41, 64, 0.15)',
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: '480px',
                      margin: '0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(61, 41, 64, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        color: '#3D2940'
                      }}
                    >
                      <Calendar size={22} />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#3D2940', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                      {t('past_empty_title', { defaultValue: "You haven't saved a ladder yet." })}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 22px 0', lineHeight: 1.5, maxWidth: '340px' }}>
                      {t('past_empty_desc', { defaultValue: 'Build your first fear ladder to view and compare it here anytime.' })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('build')}
                      style={{
                        padding: '12px 28px',
                        borderRadius: '999px',
                        backgroundColor: '#3D2940',
                        color: '#F7F0E6',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 6px 18px rgba(61, 41, 64, 0.2)',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      {t('past_empty_cta', { defaultValue: 'BUILD MY FIRST LADDER →' })}
                    </button>
                  </div>
                )}

                {/* Past Ladders List */}
                {!isLoadingHistory && !historyError && pastLadders.length > 0 && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pastLadders.map((ladder) => {
                      const { date, time } = formatDateTime(ladder.createdAt);
                      const sitCount = ladder.situations.length;

                      return (
                        <div
                          key={ladder.id}
                          onClick={() => setSelectedPastLadder(ladder)}
                          style={{
                            padding: '18px 22px',
                            borderRadius: '18px',
                            backgroundColor: '#FFFFFF',
                            border: '1.5px solid rgba(61, 41, 64, 0.1)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            textAlign: 'left',
                            boxSizing: 'border-box',
                            transition: 'transform 0.15s ease, border-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.borderColor = '#3D2940';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(61, 41, 64, 0.1)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {/* Miniature Ladder Preview */}
                            <div
                              style={{
                                width: '28px',
                                height: '40px',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '2px 0',
                                flexShrink: 0
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  bottom: 0,
                                  left: '4px',
                                  width: '3px',
                                  backgroundColor: '#3D2940',
                                  borderRadius: '2px'
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  bottom: 0,
                                  right: '4px',
                                  width: '3px',
                                  backgroundColor: '#3D2940',
                                  borderRadius: '2px'
                                }}
                              />
                              <div style={{ height: '3px', backgroundColor: '#E47761', borderRadius: '1px', zIndex: 2 }} />
                              <div style={{ height: '3px', backgroundColor: '#E47761', borderRadius: '1px', zIndex: 2 }} />
                              <div style={{ height: '3px', backgroundColor: '#E47761', borderRadius: '1px', zIndex: 2 }} />
                            </div>

                            <div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#29252B', letterSpacing: '-0.01em' }}>
                                {date}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                                {time} · {sitCount} {sitCount !== 1 ? 'situations' : 'situation'}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#3D2940',
                              fontSize: '0.82rem',
                              fontWeight: 800
                            }}
                          >
                            <span>{t('past_view_btn', { defaultValue: 'VIEW' })}</span>
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ========================================================
                STAGE 1: COLLECT (EDITORIAL WORKSHEET SURFACE)
               ======================================================== */}
            {stage === 'collect' && (
              <motion.div
                key="collect"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3D2940', margin: '0 0 8px 0', lineHeight: 1.1 }}>
                    {t('collect_title', { defaultValue: 'WHAT FEELS DIFFICULT?' })}
                  </h2>
                  <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                    {t('collect_subtitle', { defaultValue: "Add a few situations (3–5 recommended). Don't worry about the order yet." })}
                  </p>
                </div>

                {/* Single Writing Surface Input */}
                <form onSubmit={handleAddSituation} style={{ marginBottom: '20px' }}>
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      padding: '16px 20px',
                      border: '1.5px solid rgba(61, 41, 64, 0.12)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        setInputError('');
                      }}
                      placeholder={t('collect_placeholder', { defaultValue: 'I would feel uncomfortable if...' })}
                      autoFocus
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.95rem',
                        color: '#29252B',
                        backgroundColor: 'transparent'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '10px 18px',
                        borderRadius: '999px',
                        backgroundColor: '#3D2940',
                        color: '#F7F0E6',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {t('collect_add_btn', { defaultValue: 'ADD' })}
                    </button>
                  </div>
                  {inputError && (
                    <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '6px', marginLeft: '12px', fontWeight: 600 }}>
                      {inputError}
                    </p>
                  )}
                </form>

                {/* Collected Situations (Editorial Text Items) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
                  {situations.map((sit, idx) => (
                    <motion.div
                      key={sit.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(61, 41, 64, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.92rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#3D2940',
                            color: '#F7F0E6',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span style={{ fontWeight: 600, color: '#29252B' }}>{sit.text}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(sit.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Example Quick Taps */}
                {situations.length < 3 && (
                  <div style={{ marginBottom: '28px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                      {t('collect_examples_label', { defaultValue: 'EXAMPLE SUGGESTIONS:' })}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        t('collect_ex1', { defaultValue: 'Checking something once instead of repeatedly' }),
                        t('collect_ex2', { defaultValue: 'Leaving something uncertain without checking' }),
                        t('collect_ex3', { defaultValue: 'Sending a message without rereading it' }),
                        t('collect_ex4', { defaultValue: 'Touching something uncomfortable' })
                      ].map((example, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSituations((prev) => [
                              ...prev,
                              { id: 'sit_' + Date.now() + i, text: example, order: prev.length + 1, difficulty: null }
                            ]);
                          }}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.75)',
                            border: '1px solid rgba(61, 41, 64, 0.08)',
                            textAlign: 'left',
                            fontSize: '0.82rem',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            lineHeight: 1.4,
                            boxSizing: 'border-box'
                          }}
                        >
                          <span style={{ color: '#E47761', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>+</span>
                          <span style={{ fontWeight: 500 }}>{example}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue to Rank Button */}
                {situations.length >= 3 && (
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setStage('rank')}
                      style={{
                        width: '100%',
                        height: '52px',
                        borderRadius: '999px',
                        backgroundColor: '#3D2940',
                        color: '#F7F0E6',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(61, 41, 64, 0.25)'
                      }}
                    >
                      {t('collect_continue_cta', { defaultValue: 'PUT THEM IN ORDER →' })}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ========================================================
                STAGE 2: RANK (ONE VERTICAL DRAG AREA)
               ======================================================== */}
            {stage === 'rank' && (
              <motion.div
                key="rank"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3D2940', margin: '0 0 8px 0', lineHeight: 1.1 }}>
                    {t('rank_title', { defaultValue: 'PUT THEM IN ORDER' })}
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                    {t('rank_subtitle', { defaultValue: 'Drag items from most challenging at the top to easier at the bottom.' })}
                  </p>
                </div>

                {/* Relative Order Top / Bottom Boundary Indicators */}
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#E47761',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '10px'
                  }}
                >
                  {t('rank_more_challenging', { defaultValue: '▲ MORE CHALLENGING' })}
                </div>

                {/* Vertical Drag & Drop Reorder Area */}
                <Reorder.Group
                  axis="y"
                  values={situations}
                  onReorder={setSituations}
                  style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}
                >
                  {situations.map((sit, idx) => (
                    <Reorder.Item
                      key={sit.id}
                      value={sit}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid rgba(61, 41, 64, 0.1)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'grab',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <GripVertical size={16} color="#94a3b8" />
                        <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#29252B' }}>
                          {sit.text}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                        #{idx + 1}
                      </span>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#A9B99A',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '28px'
                  }}
                >
                  {t('rank_easier', { defaultValue: '▼ EASIER' })}
                </div>

                <button
                  type="button"
                  onClick={() => setStage('ladder')}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '999px',
                    backgroundColor: '#3D2940',
                    color: '#F7F0E6',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(61, 41, 64, 0.25)'
                  }}
                >
                  {t('rank_cta', { defaultValue: 'GENERATE MY FEAR LADDER →' })}
                </button>
              </motion.div>
            )}

            {/* ========================================================
                STAGE 3: YOUR FEAR LADDER (REAL PHYSICAL LADDER STRUCTURE)
               ======================================================== */}
            {stage === 'ladder' && (
              <motion.div
                key="ladder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: '100%',
                  maxWidth: '740px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingBottom: '40px'
                }}
              >
                {/* Header Title & Subtitle */}
                <div style={{ marginBottom: '28px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#E47761',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    {t('ladder_badge', { defaultValue: 'YOUR COMPLETED HIERARCHY' })}
                  </span>
                  <h2
                    style={{
                      fontSize: 'clamp(2rem, 5vw, 2.7rem)',
                      fontWeight: 900,
                      color: '#3D2940',
                      margin: '0 0 6px 0',
                      lineHeight: 1.05,
                      letterSpacing: '-0.03em'
                    }}
                  >
                    {t('ladder_title', { defaultValue: 'YOUR FEAR LADDER' })}
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
                    {t('ladder_subtitle', { defaultValue: 'From easier at the base to more challenging at the top.' })}
                  </p>
                </div>

                {/* ========================================================== */}
                {/* THE PHYSICAL LADDER STRUCTURE (TWO RAILS + REAL RUNGS)     */}
                {/* ========================================================== */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '560px',
                    position: 'relative',
                    padding: '24px 16px 20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Top Hierarchy Indicator */}
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      color: '#E47761',
                      textTransform: 'uppercase',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>▲</span>
                    <span>{t('ladder_more_challenging', { defaultValue: 'MORE CHALLENGING' })}</span>
                  </div>

                  {/* Ladder Framework with 3D Rails */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '480px',
                      padding: '20px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    {/* LEFT VERTICAL RAIL (Physical Painted Plum Wood) */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '0',
                        bottom: '0',
                        left: '32px',
                        width: '14px',
                        borderRadius: '7px',
                        background: 'linear-gradient(90deg, #251628 0%, #3D2940 45%, #583F5C 85%, #2D1A30 100%)',
                        boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.2), 3px 6px 16px rgba(45, 26, 48, 0.35)',
                        zIndex: 2
                      }}
                    />

                    {/* RIGHT VERTICAL RAIL (Physical Painted Plum Wood) */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '0',
                        bottom: '0',
                        right: '32px',
                        width: '14px',
                        borderRadius: '7px',
                        background: 'linear-gradient(90deg, #251628 0%, #3D2940 45%, #583F5C 85%, #2D1A30 100%)',
                        boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.2), 3px 6px 16px rgba(45, 26, 48, 0.35)',
                        zIndex: 2
                      }}
                    />

                    {/* RUNGS: RENDERED IN ASCENDING/DESCENDING ORDER (NO INVENTED NUMBERS) */}
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        zIndex: 3
                      }}
                    >
                      {situations.map((sit, idx) => (
                        <motion.div
                          key={sit.id || idx}
                          layout
                          initial={{ scale: 0.96, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.35, delay: idx * 0.05 }}
                          style={{
                            position: 'relative',
                            width: '100%',
                            padding: '0 24px',
                            boxSizing: 'border-box'
                          }}
                        >
                          {/* RUNG SOLID BODY */}
                          <div
                            style={{
                              width: '100%',
                              minHeight: '52px',
                              borderRadius: '10px',
                              background: 'linear-gradient(180deg, #533B57 0%, #3D2940 35%, #2B1B2D 100%)',
                              boxShadow: '0 6px 18px rgba(45, 26, 48, 0.28), inset 0 1px 2px rgba(255,255,255,0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              padding: '12px 28px',
                              boxSizing: 'border-box',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              position: 'relative'
                            }}
                          >
                            {/* Joint Rivets on Left & Right where Rung meets Rails */}
                            <div
                              style={{
                                position: 'absolute',
                                left: '12px',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#E47761',
                                boxShadow: '0 0 4px rgba(228, 119, 97, 0.6)'
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                right: '12px',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#E47761',
                                boxShadow: '0 0 4px rgba(228, 119, 97, 0.6)'
                              }}
                            />

                            {/* Situation Text: Printed cleanly directly onto the physical wood rung */}
                            <span
                              style={{
                                color: '#F7F0E6',
                                fontWeight: 700,
                                fontSize: '0.94rem',
                                lineHeight: 1.35,
                                textAlign: 'left',
                                letterSpacing: '-0.01em',
                                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                wordBreak: 'break-word'
                              }}
                            >
                              {sit.text}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Base Hierarchy Indicator */}
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      color: '#6B8E23',
                      textTransform: 'uppercase',
                      marginTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>▼</span>
                    <span>{t('ladder_easier', { defaultValue: 'EASIER' })}</span>
                  </div>
                </div>

                {/* Clinical Framing Note */}
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#64748b',
                    lineHeight: 1.5,
                    margin: '16px 0 28px 0',
                    maxWidth: '520px'
                  }}
                >
                  {t('ladder_clinical_framing', { defaultValue: 'A fear ladder organizes situations by anticipated difficulty. In OCD treatment, working from easier rungs toward more challenging ones is the gold standard foundation.' })}
                </p>

                {/* Primary Save CTA / Confirmation */}
                {isSavedConfirmation ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#16a34a',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        letterSpacing: '0.04em'
                      }}
                    >
                      <CheckCircle2 size={18} />
                      <span>{t('ladder_saved_just_now', { defaultValue: 'SAVED JUST NOW' })}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExit(onBack, onNavigate)}
                      style={{
                        width: '100%',
                        minWidth: '240px',
                        height: '52px',
                        borderRadius: '999px',
                        backgroundColor: '#3D2940',
                        color: '#F7F0E6',
                        fontSize: '0.94rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(61, 41, 64, 0.25)'
                      }}
                    >
                      {t('ladder_continue_cta', { defaultValue: 'CONTINUE →' })}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteActivity}
                    disabled={isCompleting}
                    style={{
                      width: '100%',
                      maxWidth: '380px',
                      height: '52px',
                      borderRadius: '999px',
                      backgroundColor: '#3D2940',
                      color: '#F7F0E6',
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      border: 'none',
                      cursor: isCompleting ? 'wait' : 'pointer',
                      boxShadow: '0 8px 24px rgba(61, 41, 64, 0.25)',
                      opacity: isCompleting ? 0.7 : 1,
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    {isCompleting ? t('ladder_saving', { defaultValue: 'SAVING YOUR LADDER...' }) : t('ladder_save_cta', { defaultValue: 'SAVE MY LADDER →' })}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
