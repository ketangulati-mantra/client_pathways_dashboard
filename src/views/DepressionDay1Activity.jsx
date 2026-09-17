import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Clock,
  Check,
  Volume2,
  VolumeX,
  Maximize
} from 'lucide-react';
import {
  EXPERIENCE_OPTIONS,
  REASON_OPTIONS,
  LIGHTER_OPTIONS,
  derivePersonalizedFocus,
  ACTIVITY_ID,
  PATHWAY_ID,
  DAY_NUMBER,
  ACTIVITY_TYPE
} from '../utils/depressionPathwayEngine';
import {
  logUserActivityToDB,
  saveUserLessonProgress,
  getUserLessonProgress,
  recordUserPersonalizationSignal
} from '../services/activityLogger';
import { completeLesson } from '../mantra/api';
import { getActiveUserId } from '../services/authService';

const VIDEO_URL =
  'https://res.cloudinary.com/hxbamdqf/video/upload/v1789460676/vidssave.com_What_is_Depression____Treatments_Symptoms_And_Causes_of_Depression_720P_lhubmy.mp4';
const THUMBNAIL_URL =
  'https://res.cloudinary.com/hxbamdqf/image/upload/v1789460776/WQCnxTiZZa0-HD_q1d03k.jpg';

export default function DepressionDay1Activity({ onBack, onNavigate, service }) {
  // Screen steps: 0 = Intro, 1 = Video, 2 = Recognition, 3 = Personalization, 4 = Insight, 5 = 10% Lighter, 6 = Completion
  const [currentStep, setCurrentStep] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);

  // User Selections
  const [familiarExperiences, setFamiliarExperiences] = useState([]);
  const [reasonsForJoining, setReasonsForJoining] = useState([]);
  const [tenPercentLighter, setTenPercentLighter] = useState(null);

  // Video State & Full YouTube-like Controls
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoStartedAt, setVideoStartedAt] = useState(null);
  const [videoCompletedAt, setVideoCompletedAt] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const videoDurationRef = useRef(0);
  const videoWatchTimeRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const initialLoadRef = useRef(false);

  // Analytics event logger (No sensitive free-text stored)
  const trackAnalyticsEvent = (eventName, eventData = {}) => {
    try {
      const payload = {
        event: eventName,
        user_id: getActiveUserId(),
        activity_id: ACTIVITY_ID,
        pathway_id: PATHWAY_ID,
        day_number: DAY_NUMBER,
        timestamp: new Date().toISOString(),
        ...eventData
      };
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mantra_analytics_event', { detail: payload }));
      }
      console.log(`[Mantra Analytics] ${eventName}:`, payload);
    } catch (e) {}
  };

  // 1. Re-Entry / Resume Behaviour: Restore progress on mount
  useEffect(() => {
    const restoreProgress = async () => {
      const userId = getActiveUserId();
      trackAnalyticsEvent('activity_started', { step: 0 });

      // Try LocalStorage first for instant restore
      let localData = null;
      try {
        const stored = localStorage.getItem(`mantra_progress_${ACTIVITY_ID}_${userId}`);
        if (stored) localData = JSON.parse(stored);
      } catch (e) {}

      // Query DB for canonical resume state
      const dbProgress = await getUserLessonProgress(ACTIVITY_ID, userId).catch(() => null);
      const saved = dbProgress?.response_data || localData;

      if (saved) {
        if (Array.isArray(saved.familiar_experiences)) {
          setFamiliarExperiences(saved.familiar_experiences);
        }
        if (Array.isArray(saved.reason_for_joining)) {
          setReasonsForJoining(saved.reason_for_joining);
        }
        if (saved.ten_percent_lighter) {
          setTenPercentLighter(saved.ten_percent_lighter);
        }
        if (saved.video) {
          if (saved.video.started) setVideoStarted(true);
          if (saved.video.completed) setVideoCompleted(true);
          if (saved.video.watch_percentage) setVideoProgress(saved.video.watch_percentage);
          if (saved.video.watch_time_seconds) {
            videoWatchTimeRef.current = saved.video.watch_time_seconds;
          }
        }
        if (dbProgress?.current_step !== undefined && dbProgress.current_step > 0 && dbProgress.current_step <= 6) {
          // If already completed in past, can start at intro or last step
          if (dbProgress.current_step < 6) {
            setCurrentStep(dbProgress.current_step);
          }
        }
      }
      setHasResumed(true);
      initialLoadRef.current = true;
    };

    restoreProgress();
  }, []);

  // 2. Persist step progress to both DB and localStorage on state changes
  useEffect(() => {
    if (!initialLoadRef.current) return;
    const userId = getActiveUserId();

    const responseData = {
      video: {
        started: videoStarted,
        completed: videoCompleted,
        watch_percentage: videoProgress,
        watch_time_seconds: Math.round(videoWatchTimeRef.current),
        video_started_at: videoStartedAt,
        video_completed_at: videoCompletedAt
      },
      familiar_experiences: familiarExperiences,
      reason_for_joining: reasonsForJoining,
      ten_percent_lighter: tenPercentLighter,
      completion_status: currentStep === 6 ? 'completed' : 'in_progress',
      started_at: new Date(startTimeRef.current).toISOString(),
      last_updated_at: new Date().toISOString()
    };

    // Save to LocalStorage
    try {
      localStorage.setItem(`mantra_progress_${ACTIVITY_ID}_${userId}`, JSON.stringify(responseData));
    } catch (e) {}

    // Save to Backend DB user_progress
    saveUserLessonProgress({
      userId,
      lessonId: ACTIVITY_ID,
      currentStep,
      totalSteps: 7,
      actionDone: `step_${currentStep}`,
      responseData
    }).catch((err) => console.warn('Progress sync warning:', err));
  }, [
    currentStep,
    familiarExperiences,
    reasonsForJoining,
    tenPercentLighter,
    videoStarted,
    videoCompleted,
    videoProgress,
    videoStartedAt,
    videoCompletedAt
  ]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Derived Focus & Insight (Predictable rule-based scoring)
  const personalizedFocus = useMemo(() => {
    return derivePersonalizedFocus({
      familiarExperiences,
      reasonsForJoining,
      tenPercentLighter
    });
  }, [familiarExperiences, reasonsForJoining, tenPercentLighter]);

  const formatTime = (timeInSeconds) => {
    const totalSecs = Math.floor(timeInSeconds || 0);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Video Controls & Events
  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (!videoStarted) {
            setVideoStarted(true);
            const nowIso = new Date().toISOString();
            setVideoStartedAt(nowIso);
            trackAnalyticsEvent('video_started', { timestamp: nowIso });
          }
          handleMouseMove();
        })
        .catch((e) => {
          console.warn('Video play error:', e);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 1;
    setCurrentTime(current);
    setDuration(total);
    videoDurationRef.current = total;
    videoWatchTimeRef.current = Math.max(videoWatchTimeRef.current, current);
    const pct = Math.round((current / total) * 100);
    setVideoProgress(pct);

    if (pct >= 85 && !videoCompleted) {
      setVideoCompleted(true);
      const completedIso = new Date().toISOString();
      setVideoCompletedAt(completedIso);
      trackAnalyticsEvent('video_completed', {
        watch_percentage: pct,
        watch_time_seconds: Math.round(videoWatchTimeRef.current)
      });
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = clickPos * (videoRef.current.duration || 1);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeToggle = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 1;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleFullscreenToggle = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen?.().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setVideoCompleted(true);
    setVideoProgress(100);
    const completedIso = new Date().toISOString();
    setVideoCompletedAt(completedIso);
    setShowControls(true);
    trackAnalyticsEvent('video_completed', {
      watch_percentage: 100,
      watch_time_seconds: Math.round(videoDurationRef.current)
    });
  };

  const handleToggleExperience = (id) => {
    setFamiliarExperiences((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      trackAnalyticsEvent('question_answered', {
        question_id: 'familiar_experiences',
        selected_option_ids: next
      });
      return next;
    });
  };

  const handleToggleReason = (id) => {
    setReasonsForJoining((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      trackAnalyticsEvent('question_answered', {
        question_id: 'reason_for_joining',
        selected_option_ids: next
      });
      return next;
    });
  };

  const handleSelectLighter = (id) => {
    setTenPercentLighter(id);
    trackAnalyticsEvent('question_answered', {
      question_id: 'ten_percent_lighter',
      selected_option_ids: [id]
    });
  };

  // Complete Activity & Persist Raw Data + Derived Personalization Focus
  const handleCompleteActivity = async () => {
    const userId = getActiveUserId();
    const completedAt = new Date().toISOString();
    const startedAt = new Date(startTimeRef.current).toISOString();
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const rawResponseData = {
      video: {
        started: videoStarted,
        completed: videoCompleted,
        watch_percentage: videoProgress,
        watch_time_seconds: Math.round(videoWatchTimeRef.current),
        video_started_at: videoStartedAt,
        video_completed_at: videoCompletedAt
      },
      familiar_experiences: familiarExperiences,
      reason_for_joining: reasonsForJoining,
      ten_percent_lighter: tenPercentLighter,
      personalization: {
        current_focus: personalizedFocus.current_focus,
        focus_title: personalizedFocus.title,
        signal_scores: personalizedFocus.signal_scores
      },
      completion_status: 'completed',
      time_spent_seconds: timeSpentSeconds
    };

    const activityPayload = {
      userId,
      activityId: ACTIVITY_ID,
      lessonId: ACTIVITY_ID,
      activityType: ACTIVITY_TYPE,
      service: service || 'therapy',
      rewardPoints: 25,
      reflection: '',
      resultSummary: {
        pathway_id: PATHWAY_ID,
        day_number: DAY_NUMBER,
        started_at: startedAt,
        completed_at: completedAt,
        completion_status: 'completed',
        time_spent_seconds: timeSpentSeconds,
        response_data: rawResponseData
      },
      metadata: {
        activityId: ACTIVITY_ID,
        pathwayId: PATHWAY_ID,
        dayNumber: DAY_NUMBER,
        currentFocus: personalizedFocus.current_focus,
        signalScores: personalizedFocus.signal_scores
      }
    };

    // 1. LocalStorage update
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`mantra_completed_${ACTIVITY_ID}_${userId}`, JSON.stringify(rawResponseData));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }

    // 2. Track Analytics Event
    trackAnalyticsEvent('activity_completed', {
      completion_status: 'completed',
      time_spent_seconds: timeSpentSeconds,
      current_focus: personalizedFocus.current_focus
    });

    // 3. Log Full Activity to Neon DB user_activities
    const logRes = await logUserActivityToDB(activityPayload).catch((e) => {
      console.warn('DB log non-blocking error:', e);
      return null;
    });

    // 4. Record Traceable Personalization Signal to user_personalization_signals
    await recordUserPersonalizationSignal({
      userId,
      pathwayId: PATHWAY_ID,
      signal: personalizedFocus.current_focus,
      strength: 2,
      sourceType: 'activity',
      sourceId: logRes?.data?.id ? String(logRes.data.id) : ACTIVITY_ID,
      metadata: {
        raw_responses: {
          familiar_experiences: familiarExperiences,
          reason_for_joining: reasonsForJoining,
          ten_percent_lighter: tenPercentLighter
        },
        signal_scores: personalizedFocus.signal_scores
      }
    }).catch((err) => console.warn('Signal record error:', err));

    // 5. Complete webhook / streak award
    await completeLesson(ACTIVITY_ID).catch((e) =>
      console.warn('Completion non-blocking error:', e)
    );

    if (onNavigate) {
      onNavigate('/task/depression-how-is-it-showing-up');
    } else if (onBack) {
      onBack();
    }
  };

  const totalSteps = 7;
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF8F4',
        color: '#1C1917',
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Top Subtle Header with Elegant Progress Line */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(250, 248, 244, 0.94)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E7E5E0',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <button
            onClick={() => {
              if (currentStep > 0) setCurrentStep((prev) => prev - 1);
              else if (onBack) onBack();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 0',
              color: '#78716C',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: 600,
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1C1917')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#78716C')}
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
            <span>{currentStep === 0 ? 'Exit' : 'Back'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                color: '#A8A29E',
                letterSpacing: '0.14em',
                textTransform: 'uppercase'
              }}
            >
              Day 01
            </span>
            <span style={{ color: '#D6D3CD', fontSize: '11px' }}>/</span>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#78716C',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              Depression
            </span>
          </div>

          <div style={{ width: '40px' }} />
        </div>

        {/* Hairline Progress Indicator */}
        <div
          style={{
            maxWidth: '1080px',
            width: '100%',
            margin: '0 auto',
            height: '2px',
            background: '#E7E5E0',
            borderRadius: '999px',
            overflow: 'hidden'
          }}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: '#C2410C',
              borderRadius: '999px'
            }}
          />
        </div>
      </header>

      {/* Main Content Flow */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1080px',
          margin: '0 auto',
          padding: 'clamp(28px, 5vh, 56px) 24px 64px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* SCREEN 1 — EDITORIAL INTRO (Split Composition on Desktop) */}
          {/* ============================================================ */}
          {currentStep === 0 && (
            <motion.div
              key="step-0-intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'clamp(32px, 6vw, 64px)',
                alignItems: 'center'
              }}
            >
              {/* Left Column: Editorial Headline & Narrative */}
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginBottom: '16px'
                  }}
                >
                  Day 1 of 21 • Depression
                </span>

                <h1
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(38px, 6.2vw, 56px)',
                    fontWeight: 500,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.08,
                    color: '#1C1917',
                    margin: '0 0 20px 0'
                  }}
                >
                  What is<br />Depression?
                </h1>

                <p
                  style={{
                    fontSize: 'clamp(16.5px, 2.8vw, 19px)',
                    color: '#44403C',
                    lineHeight: 1.55,
                    margin: '0 0 16px 0',
                    fontWeight: 500
                  }}
                >
                  Sometimes it's more than just having a bad day.
                </p>

                <p
                  style={{
                    fontSize: '15px',
                    color: '#78716C',
                    lineHeight: 1.65,
                    margin: '0 0 28px 0',
                    maxWidth: '460px'
                  }}
                >
                  Take a few minutes to understand what depression actually is, why it can affect how you think, feel and function, and why it's not simply a matter of “trying harder.”
                </p>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#A8A29E',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '32px'
                  }}
                >
                  <Clock size={14} color="#C2410C" />
                  <span>~3 min • Learn + reflect</span>
                </div>

                <div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    style={{
                      background: '#1C1917',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px 28px',
                      color: '#FAF8F4',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#292524')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#1C1917')}
                  >
                    <span>Let’s begin</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Right Column: Hero Video Preview Object */}
              <div
                onClick={() => setCurrentStep(1)}
                style={{
                  borderRadius: '18px',
                  overflow: 'hidden',
                  background: '#F0ECE4',
                  boxShadow: '0 12px 32px -8px rgba(28, 25, 23, 0.08)',
                  border: '1px solid #E7E5E0',
                  aspectRatio: '16 / 10',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={THUMBNAIL_URL}
                  alt="What is Depression"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(28, 25, 23, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#FAF8F4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                    }}
                  >
                    <Play size={20} color="#1C1917" style={{ marginLeft: '3px' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 2 — IMMERSIVE VIDEO */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <motion.div
              key="step-1-video"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ maxWidth: '760px', margin: '0 auto', width: '100%' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Essential Foundation
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(28px, 4.5vw, 38px)',
                    fontWeight: 500,
                    margin: '6px 0 0 0',
                    color: '#1C1917',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Understanding the Shift
                </h2>
              </div>

              {/* YouTube-like Video Player Box */}
              <div
                ref={videoContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                style={{
                  width: '100%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#000000',
                  border: '1px solid #E7E5E0',
                  position: 'relative',
                  aspectRatio: '16 / 9',
                  marginBottom: '28px',
                  boxShadow: '0 10px 30px -6px rgba(0,0,0,0.12)',
                  userSelect: 'none'
                }}
              >
                <video
                  ref={videoRef}
                  src={VIDEO_URL}
                  poster={THUMBNAIL_URL}
                  playsInline
                  onClick={handlePlayToggle}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                />

                {/* Big Center Play Trigger (when paused) */}
                {!isPlaying && (
                  <div
                    onClick={handlePlayToggle}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0, 0, 0, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(250, 248, 244, 0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <Play size={26} color="#1C1917" style={{ marginLeft: '4px' }} />
                    </div>
                  </div>
                )}

                {/* YouTube-Style Bottom Controls Bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                    padding: '24px 16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: 10,
                    opacity: showControls || !isPlaying ? 1 : 0,
                    pointerEvents: showControls || !isPlaying ? 'auto' : 'none',
                    transition: 'opacity 0.25s ease'
                  }}
                >
                  {/* Scrubber Timeline Bar */}
                  <div
                    onClick={handleSeek}
                    style={{
                      width: '100%',
                      height: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '2px',
                        position: 'relative'
                      }}
                    >
                      {/* Played Progress */}
                      <div
                        style={{
                          width: `${videoProgress}%`,
                          height: '100%',
                          background: '#C2410C',
                          borderRadius: '2px',
                          position: 'relative'
                        }}
                      >
                        {/* Red Scrubber Handle */}
                        <div
                          style={{
                            position: 'absolute',
                            right: '-6px',
                            top: '-4px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#C2410C',
                            boxShadow: '0 0 6px rgba(0,0,0,0.5)'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#FAF8F4' }}>
                    {/* Left Controls: Play/Pause, Volume, Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <button
                        onClick={handlePlayToggle}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#FAF8F4',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </button>

                      {/* Volume / Mute */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={handleVolumeToggle}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#FAF8F4',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {isMuted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          style={{
                            width: '56px',
                            height: '4px',
                            accentColor: '#C2410C',
                            cursor: 'pointer'
                          }}
                        />
                      </div>

                      {/* Time Counter */}
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#E7E5E0', letterSpacing: '0.02em' }}>
                        <span>{formatTime(currentTime)}</span>
                        <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.5)' }}>/</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Right Controls: Fullscreen */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={handleFullscreenToggle}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#FAF8F4',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Maximize size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* What You'll Learn Notes */}
              <div
                style={{
                  borderTop: '1px solid #E7E5E0',
                  paddingTop: '20px',
                  marginBottom: '32px'
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#78716C',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '12px'
                  }}
                >
                  What You'll Learn
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'What depression actually is beyond simply having a bad day',
                    'How it can affect everyday physical energy, motivation, and thoughts',
                    'Why depression is never simply a matter of “trying harder”'
                  ].map((text, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span style={{ color: '#C2410C', fontSize: '14px', fontWeight: 800 }}>•</span>
                      <span style={{ fontSize: '14.5px', color: '#44403C', lineHeight: 1.5 }}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                style={{
                  background: '#1C1917',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 3 — RECOGNITION (Clean Editorial Rows) */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <motion.div
              key="step-2-recognition"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}
            >
              <div style={{ marginBottom: '32px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Recognition
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(28px, 4.5vw, 38px)',
                    fontWeight: 500,
                    margin: '6px 0 10px 0',
                    color: '#1C1917',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Depression doesn’t always look the same.
                </h2>
                <p style={{ fontSize: '15px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
                  Everyone experiences it differently. Which of these have felt familiar to you lately?
                </p>
              </div>

              {/* Elegant Selectable List Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '36px' }}>
                {EXPERIENCE_OPTIONS.map((item) => {
                  const isSelected = familiarExperiences.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleExperience(item.id)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: isSelected ? '1px solid #1C1917' : '1px solid #E7E5E0',
                        background: isSelected ? '#FFFFFF' : '#FAF8F4',
                        color: isSelected ? '#1C1917' : '#57534E',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: isSelected ? 700 : 500 }}>
                        {item.label}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #1C1917' : '1.5px solid #D6D3CD',
                          background: isSelected ? '#1C1917' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isSelected && <Check size={12} color="#FAF8F4" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                style={{
                  background: '#1C1917',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 4 — PERSONALIZATION */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <motion.div
              key="step-3-reasons"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}
            >
              <div style={{ marginBottom: '32px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Personalization
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(28px, 4.5vw, 38px)',
                    fontWeight: 500,
                    margin: '6px 0 10px 0',
                    color: '#1C1917',
                    letterSpacing: '-0.02em'
                  }}
                >
                  What brought you here?
                </h2>
                <p style={{ fontSize: '15px', color: '#78716C', margin: 0, lineHeight: 1.5 }}>
                  Pick what feels closest right now.
                </p>
              </div>

              {/* Reasons List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '36px' }}>
                {REASON_OPTIONS.map((item) => {
                  const isSelected = reasonsForJoining.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleReason(item.id)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: isSelected ? '1px solid #1C1917' : '1px solid #E7E5E0',
                        background: isSelected ? '#FFFFFF' : '#FAF8F4',
                        color: isSelected ? '#1C1917' : '#57534E',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: isSelected ? 700 : 500 }}>
                        {item.label}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #1C1917' : '1.5px solid #D6D3CD',
                          background: isSelected ? '#1C1917' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isSelected && <Check size={12} color="#FAF8F4" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                style={{
                  background: '#1C1917',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 5 — PERSONALIZED INSIGHT (Warm Editorial Card) */}
          {/* ============================================================ */}
          {currentStep === 4 && (
            <motion.div
              key="step-4-insight"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}
            >
              <div style={{ marginBottom: '28px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Context for your journey
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(28px, 4.5vw, 38px)',
                    fontWeight: 500,
                    margin: '6px 0 0 0',
                    color: '#1C1917',
                    lineHeight: 1.18,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {personalizedFocus.headline}
                </h2>
              </div>

              {/* Editorial Reading Block */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E7E5E0',
                  borderRadius: '16px',
                  padding: 'clamp(24px, 4vw, 32px)',
                  boxSizing: 'border-box',
                  marginBottom: '32px'
                }}
              >
                <p
                  style={{
                    fontSize: '15.5px',
                    color: '#44403C',
                    lineHeight: 1.7,
                    margin: '0 0 24px 0',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {personalizedFocus.body}
                </p>

                <div
                  style={{
                    borderTop: '1px solid #F0ECE4',
                    paddingTop: '20px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#78716C',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '4px'
                    }}
                  >
                    Something we'll pay attention to
                  </span>
                  <span
                    style={{
                      fontSize: '19px',
                      fontWeight: 800,
                      color: '#1C1917'
                    }}
                  >
                    {personalizedFocus.title}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(5)}
                style={{
                  background: '#1C1917',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 6 — 10% LIGHTER */}
          {/* ============================================================ */}
          {currentStep === 5 && (
            <motion.div
              key="step-5-lighter"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}
            >
              <div style={{ marginBottom: '32px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#C2410C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  Reflection
                </span>
                <h2
                  style={{
                    fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(26px, 4.2vw, 36px)',
                    fontWeight: 500,
                    margin: '6px 0 0 0',
                    color: '#1C1917',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em'
                  }}
                >
                  If you could make one thing 10% lighter right now, what would it be?
                </h2>
              </div>

              {/* Single Choice Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '36px' }}>
                {LIGHTER_OPTIONS.map((item) => {
                  const isSelected = tenPercentLighter === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectLighter(item.id)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: isSelected ? '1px solid #1C1917' : '1px solid #E7E5E0',
                        background: isSelected ? '#FFFFFF' : '#FAF8F4',
                        color: isSelected ? '#1C1917' : '#57534E',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: isSelected ? 700 : 500 }}>
                        {item.label}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #1C1917' : '1.5px solid #D6D3CD',
                          background: isSelected ? '#1C1917' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isSelected && <Check size={12} color="#FAF8F4" strokeWidth={2.5} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStep(6)}
                disabled={!tenPercentLighter}
                style={{
                  background: tenPercentLighter ? '#1C1917' : '#D6D3CD',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: tenPercentLighter ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 7 — EDITORIAL COMPLETION */}
          {/* ============================================================ */}
          {currentStep === 6 && (
            <motion.div
              key="step-6-completion"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ maxWidth: '640px', margin: '0 auto', width: '100%', textAlign: 'left' }}
            >
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  color: '#C2410C',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '12px'
                }}
              >
                Day 1 of 21
              </span>

              <h1
                style={{
                  fontFamily: 'Newsreader, "Playfair Display", Georgia, serif',
                  fontSize: 'clamp(36px, 5.8vw, 48px)',
                  fontWeight: 500,
                  color: '#1C1917',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  margin: '0 0 18px 0'
                }}
              >
                You started.
              </h1>

              <p
                style={{
                  fontSize: '16px',
                  color: '#44403C',
                  lineHeight: 1.65,
                  margin: '0 0 28px 0',
                  maxWidth: '520px'
                }}
              >
                You don't need to have everything figured out. Today you learned what depression can actually look like, and identified what matters most to you right now.
              </p>

              {/* Your First Signal Highlight */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E7E5E0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxSizing: 'border-box',
                  marginBottom: '28px'
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#78716C',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  Your First Signal
                </span>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#1C1917',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  {personalizedFocus.title}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#78716C',
                    fontStyle: 'italic',
                    lineHeight: 1.5
                  }}
                >
                  "{personalizedFocus.takeaway}"
                </p>
              </div>

              <p
                style={{
                  fontSize: '14.5px',
                  color: '#78716C',
                  lineHeight: 1.55,
                  margin: '0 0 36px 0',
                  maxWidth: '500px'
                }}
              >
                Tomorrow, we'll look at why everything can feel so much harder when you're depressed.
              </p>

              <button
                onClick={handleCompleteActivity}
                style={{
                  background: '#1C1917',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  color: '#FAF8F4',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
