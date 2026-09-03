import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import DailyCheckInHeader from '../components/dailyCheckIn/DailyCheckInHeader';
import DailyCheckInHomeScreen from '../components/dailyCheckIn/DailyCheckInHomeScreen';
import EmotionMapScreen from '../components/dailyCheckIn/EmotionMapScreen';
import SpecificEmotionScreen from '../components/dailyCheckIn/SpecificEmotionScreen';
import IntensityScreen from '../components/dailyCheckIn/IntensityScreen';
import ContextScreen from '../components/dailyCheckIn/ContextScreen';
import ReflectionScreen from '../components/dailyCheckIn/ReflectionScreen';
import PersonalizedResponseScreen from '../components/dailyCheckIn/PersonalizedResponseScreen';
import CompletionScreen from '../components/dailyCheckIn/CompletionScreen';
import MilestoneCelebrationModal from '../components/dailyCheckIn/MilestoneCelebrationModal';
import ShareableMilestoneModal from '../components/dailyCheckIn/ShareableMilestoneModal';
import { generatePersonalizedNextStep } from '../components/dailyCheckIn/recommendationEngine';
import { logDailyCheckInToDB } from '../services/activityLogger';
import { invalidateCheckInState } from '../services/dailyCheckInService';
import { getActiveUserId } from '../services/authService';

/**
 * Factory function creating a pristine, isolated check-in session.
 */
function createFreshCheckInSession() {
  return {
    checkInId: 'chk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
    selectedZone: null,
    primaryEmotion: null,
    additionalEmotions: [],
    intensity: 3,
    contexts: [],
    reflection: '',
    startedAt: new Date().toISOString(),
    completedAt: null,
    hasPersisted: false,
    isSubmitting: false
  };
}

export default function DailyCheckInPage({ onBack: propOnBack } = {}) {
  const [isHome, setIsHome] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Single Source of Truth: Active Check-In Session
  const [session, setSession] = useState(createFreshCheckInSession);

  // Derived / Transient Result State
  const [personalizedResponse, setPersonalizedResponse] = useState(null);
  const [latestStreakData, setLatestStreakData] = useState(null);
  const [pendingMilestone, setPendingMilestone] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [homeKey, setHomeKey] = useState(0);

  // Trigger celebration modal with a natural 750ms pause after completion screen renders
  useEffect(() => {
    let timer = null;
    if (currentStepIndex === 6 && pendingMilestone && !showMilestoneModal && !showShareModal) {
      timer = setTimeout(() => {
        setShowMilestoneModal(true);
      }, 750);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStepIndex, pendingMilestone, showMilestoneModal, showShareModal]);

  // =========================================================================
  // Navigation & Session Reset Handlers
  // =========================================================================
  const handleStartCheckIn = useCallback(() => {
    // Start completely pristine check-in session
    setSession(createFreshCheckInSession());
    setPersonalizedResponse(null);
    setPendingMilestone(null);
    setShowMilestoneModal(false);
    setShowShareModal(false);
    setCurrentStepIndex(0);
    setIsHome(false);
  }, []);

  const handleClose = useCallback(() => {
    setSession(createFreshCheckInSession());
    setPersonalizedResponse(null);
    setPendingMilestone(null);
    setShowMilestoneModal(false);
    setShowShareModal(false);
    setCurrentStepIndex(0);
    setIsHome(true);
  }, []);

  const handleReturnHome = useCallback(() => {
    setSession(createFreshCheckInSession());
    setPersonalizedResponse(null);
    setPendingMilestone(null);
    setShowMilestoneModal(false);
    setShowShareModal(false);
    setCurrentStepIndex(0);
    setHomeKey((k) => k + 1);
    setIsHome(true);
  }, []);

  const handleBack = useCallback(() => {
    if (currentStepIndex === 0) {
      setIsHome(true);
    } else {
      setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }
  }, [currentStepIndex]);

  const handleNavigateBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }
    if (propOnBack) {
      propOnBack();
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#/';
    }
  }, [propOnBack]);

  // =========================================================================
  // State Transition Handlers (Dependency-Aware Invalidation)
  // =========================================================================

  // Rule 1: Changing Primary Quadrant Zone (Step 0 -> Step 1)
  const handleSelectZone = useCallback((zone) => {
    setSession((prev) => {
      // If changing to a different zone, invalidate all downstream selections
      if (prev.selectedZone?.id !== zone?.id) {
        return {
          ...prev,
          selectedZone: zone,
          primaryEmotion: null,
          additionalEmotions: [],
          intensity: 3,
          contexts: [],
          reflection: '',
          hasPersisted: false,
          isSubmitting: false
        };
      }
      return { ...prev, selectedZone: zone };
    });
    setPersonalizedResponse(null);
    setCurrentStepIndex(1);
  }, []);

  // Rule 2: Changing Specific Emotion (Step 1 -> Step 2)
  const handleConfirmSpecific = useCallback(({ primary, additional }) => {
    setSession((prev) => {
      const isDifferentEmotion = prev.primaryEmotion?.id !== primary?.id;
      return {
        ...prev,
        primaryEmotion: primary,
        additionalEmotions: additional || [],
        // Reset intensity & persistence flag if emotion changed
        intensity: isDifferentEmotion ? 3 : prev.intensity,
        hasPersisted: isDifferentEmotion ? false : prev.hasPersisted,
        isSubmitting: false
      };
    });
    setPersonalizedResponse(null);
    setCurrentStepIndex(2);
  }, []);

  // Rule 3: Setting Intensity (Step 2 -> Step 3)
  const handleConfirmIntensity = useCallback((lvl) => {
    setSession((prev) => ({
      ...prev,
      intensity: lvl,
      hasPersisted: false
    }));
    setCurrentStepIndex(3);
  }, []);

  // Rule 4: Setting Context (Step 3 -> Step 4)
  const handleConfirmContext = useCallback((ctxList, structuredContext) => {
    setSession((prev) => ({
      ...prev,
      contexts: ctxList || [],
      structuredContext: structuredContext || null,
      hasPersisted: false
    }));
    setCurrentStepIndex(4);
  }, []);

  const inFlightCheckInIdRef = React.useRef(null);

  // Rule 5: Submitting Reflection -> Atomic Idempotent DB Persistence (Step 4 -> Step 5)
  const handleConfirmReflection = useCallback(async (note) => {
    const reflectionText = note || '';

    // Prevent duplicate submissions for the same check-in session ID
    if (inFlightCheckInIdRef.current === session.checkInId) {
      setCurrentStepIndex(5);
      return;
    }
    inFlightCheckInIdRef.current = session.checkInId;

    const updatedSession = {
      ...session,
      reflection: reflectionText,
      isSubmitting: true
    };
    setSession(updatedSession);

    // Generate dynamic personalized recommendation
    const res = generatePersonalizedNextStep({
      primaryEmotion: updatedSession.primaryEmotion,
      additionalEmotions: updatedSession.additionalEmotions,
      intensity: updatedSession.intensity,
      contexts: updatedSession.contexts,
      reflection: reflectionText,
      zone: updatedSession.selectedZone
    });
    setPersonalizedResponse(res);
    setCurrentStepIndex(5);

    try {
      const currentUserId = getActiveUserId();
      const logRes = await logDailyCheckInToDB({
        userId: currentUserId,
        emotionZone: updatedSession.selectedZone?.id,
        primaryEmotion: updatedSession.primaryEmotion?.name,
        additionalEmotions: (updatedSession.additionalEmotions || []).map((e) => e.name),
        intensity: updatedSession.intensity,
        contexts: updatedSession.contexts,
        reflection: reflectionText,
        resultSummary: res.summary,
        recommendation: res.recommendation,
        rewardPoints: 10,
        metadata: {
          checkInId: updatedSession.checkInId,
          zoneTitle: updatedSession.selectedZone?.name,
          openingHeadline: res.openingHeadline,
          supportingMessage: res.supportingMessage,
          structured_context: updatedSession.structuredContext || null
        }
      });

      if (logRes?.success && logRes?.data) {
        setSession((s) => ({
          ...s,
          hasPersisted: true,
          isSubmitting: false,
          completedAt: new Date().toISOString()
        }));
        if (logRes.data.streak) {
          setLatestStreakData(logRes.data.streak);
          if (logRes.data.streak.newMilestoneAchieved) {
            setPendingMilestone(logRes.data.streak.newMilestoneAchieved);
          }
        }
        invalidateCheckInState(currentUserId);
      } else {
        setSession((s) => ({ ...s, isSubmitting: false }));
      }
    } catch (err) {
      console.warn('[DailyCheckIn] Failed to persist check-in:', err);
      setSession((s) => ({ ...s, isSubmitting: false }));
    }
  }, [session]);

  // Step 5 -> Step 6: Done for now
  const handleDoneForNow = useCallback(() => {
    setCurrentStepIndex(6);
  }, []);

  // Step 5: Start recommended activity
  const handleStartRecommendation = useCallback((rec) => {
    if (rec?.route && typeof window !== 'undefined') {
      window.location.hash = '#' + rec.route;
    } else {
      setCurrentStepIndex(6);
    }
  }, []);

  // Milestone Celebration Handlers
  const handleDismissMilestone = useCallback(() => {
    setShowMilestoneModal(false);
    setPendingMilestone(null);
  }, []);

  const handleKeepMoment = useCallback(() => {
    setShowMilestoneModal(false);
    setShowShareModal(true);
  }, []);

  const handleBackToCelebration = useCallback(() => {
    setShowShareModal(false);
    setShowMilestoneModal(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
    setPendingMilestone(null);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
        background: '#0D1B2A',
        color: '#f8fafc',
        fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        position: 'relative'
      }}
    >
      {/* Dynamic Ambient Background Illumination */}
      <motion.div
        animate={{
          background:
            isHome || currentStepIndex === 0 || !session.selectedZone
              ? 'radial-gradient(circle at 50% 25%, rgba(56, 189, 248, 0.16) 0%, rgba(13, 27, 42, 0) 75%)'
              : `radial-gradient(circle at 50% 25%, ${session.selectedZone.glowColor} 0%, rgba(13, 27, 42, 0) 75%)`
        }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* 1. Header with subtle segmented progress or Home Back Navigation */}
      {isHome ? (
        <header
          style={{
            height: '56px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'sticky',
            top: 0,
            background: 'rgba(13, 27, 42, 0.75)',
            backdropFilter: 'blur(20px)',
            zIndex: 30,
            boxSizing: 'border-box'
          }}
        >
          <motion.button
            type="button"
            onClick={handleNavigateBack}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </motion.button>
        </header>
      ) : (
        <DailyCheckInHeader
          currentStepIndex={currentStepIndex}
          totalSteps={6}
          onBack={handleBack}
          onClose={handleClose}
          canGoBack={true}
        />
      )}

      {/* 2. Scrollable Canvas with Centered Container */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isHome
            ? 'clamp(14px, 3vw, 24px) clamp(16px, 4vw, 24px) 32px'
            : 'clamp(12px, 3vw, 24px) clamp(16px, 4vw, 24px) 36px',
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            margin: '0 auto',
            flex: 1,
            minHeight: '100%'
          }}
        >
          <AnimatePresence mode="wait">
            {isHome && (
              <DailyCheckInHomeScreen
                key={`step-home-${homeKey}`}
                latestStreak={latestStreakData}
                onStartCheckIn={handleStartCheckIn}
              />
            )}

            {!isHome && currentStepIndex === 0 && (
              <EmotionMapScreen
                key={`step-map-${session.checkInId}`}
                onSelectZone={handleSelectZone}
              />
            )}

            {!isHome && currentStepIndex === 1 && session.selectedZone && (
              <SpecificEmotionScreen
                key={`step-specific-${session.checkInId}-${session.selectedZone.id}`}
                zone={session.selectedZone}
                selectedPrimary={session.primaryEmotion}
                selectedAdditional={session.additionalEmotions}
                onConfirm={handleConfirmSpecific}
              />
            )}

            {!isHome && currentStepIndex === 2 && (
              <IntensityScreen
                key={`step-intensity-${session.checkInId}-${session.primaryEmotion?.id || 'none'}`}
                zone={session.selectedZone}
                primaryEmotion={session.primaryEmotion}
                initialIntensity={session.intensity}
                onConfirm={handleConfirmIntensity}
              />
            )}

            {!isHome && currentStepIndex === 3 && (
              <ContextScreen
                key={`step-context-${session.checkInId}-${session.primaryEmotion?.id || 'none'}`}
                zone={session.selectedZone}
                primaryEmotion={session.primaryEmotion}
                initialContexts={session.contexts}
                onConfirm={handleConfirmContext}
              />
            )}

            {!isHome && currentStepIndex === 4 && (
              <ReflectionScreen
                key={`step-reflection-${session.checkInId}-${session.primaryEmotion?.id || 'none'}`}
                zone={session.selectedZone}
                primaryEmotion={session.primaryEmotion}
                initialReflection={session.reflection}
                onConfirm={handleConfirmReflection}
              />
            )}

            {!isHome && currentStepIndex === 5 && personalizedResponse && (
              <PersonalizedResponseScreen
                key={`step-response-${session.checkInId}`}
                zone={session.selectedZone}
                response={personalizedResponse}
                onStartRecommendation={handleStartRecommendation}
                onDoneForNow={handleDoneForNow}
              />
            )}

            {!isHome && currentStepIndex === 6 && (
              <CompletionScreen
                key={`step-complete-${session.checkInId}`}
                zone={session.selectedZone}
                primaryEmotion={session.primaryEmotion}
                additionalEmotions={session.additionalEmotions}
                intensity={session.intensity}
                contexts={session.contexts}
                reflection={session.reflection}
                streak={latestStreakData}
                onReturnHome={handleReturnHome}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 3. Milestone Celebration Modal */}
      <AnimatePresence>
        {showMilestoneModal && pendingMilestone && (
          <MilestoneCelebrationModal
            milestoneNumber={pendingMilestone.milestone}
            achievedAt={pendingMilestone.achievedAt}
            onKeepMoment={handleKeepMoment}
            onDismiss={handleDismissMilestone}
          />
        )}
      </AnimatePresence>

      {/* 4. Shareable Milestone Keepsake Card Modal */}
      <AnimatePresence>
        {showShareModal && pendingMilestone && (
          <ShareableMilestoneModal
            milestoneNumber={pendingMilestone.milestone}
            achievedAt={pendingMilestone.achievedAt}
            onBack={handleBackToCelebration}
            onClose={handleCloseShareModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
