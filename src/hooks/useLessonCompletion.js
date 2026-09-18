import { useState, useEffect, useRef } from 'react';
import { completeLesson, goToDashboard } from '../mantra';
import { logUserActivityToDB } from '../services/activityLogger';
import { getActiveUserId } from '../services/authService';
import { useToast } from '../components';

/**
 * Shared hook to manage progress state for all lessons.
 * 
 * Rules:
 * - Automatically calculates equal weights based on active features.
 * - For Video + Assessment ONLY, it enforces 50% / 50% weight.
 * - Video completion is triggered via `onCompleted` (reaching 90%).
 */
export function useLessonCompletion(lessonId, onBack, features = {}) {
  const {
    hasVideo = true,
    hasQuiz = true,
    hasChecklist = false,
    hasScenario = false,
    hasAction = false
  } = features;

  const { showToast } = useToast();
  const isInitialMount = useRef(true);
  const storageKey = `lesson_progress_${lessonId}`;

  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load lesson progress from localStorage', e);
    }
    return {
      videoWatched: false,
      quizDone: false,
      checklistDone: false,
      scenarioAttempted: false,
      actionDone: false,
      celebrationShown: false
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedSteps));
    } catch (e) {
      console.warn('Failed to save lesson progress to localStorage', e);
    }
  }, [completedSteps, storageKey]);

  const [lessonProgress, setLessonProgress] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);

  useEffect(() => {
    let totalSteps = 0;
    let completedCount = 0;

    if (hasVideo) {
      totalSteps += 1;
      if (completedSteps.videoWatched) completedCount += 1;
    }
    if (hasChecklist) {
      totalSteps += 1;
      if (completedSteps.checklistDone) completedCount += 1;
    }
    if (hasScenario) {
      totalSteps += 1;
      if (completedSteps.scenarioAttempted) completedCount += 1;
    }
    if (hasQuiz) {
      totalSteps += 1;
      if (completedSteps.quizDone) completedCount += 1;
    }
    if (hasAction) {
      totalSteps += 1;
      if (completedSteps.actionDone) completedCount += 1;
    }

    const percentage = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 100;
    setLessonProgress(percentage);

    if (percentage === 100 && totalSteps > 0 && !completedSteps.celebrationShown) {
      setCompletedSteps((prev) => ({ ...prev, celebrationShown: true }));
      const userId = getActiveUserId();
      logUserActivityToDB({
        userId,
        activityId: lessonId,
        activityType: 'lesson_activity',
        lessonId,
        service: 'therapy',
        resultSummary: { completed: true },
        rewardPoints: 25
      }).catch(() => {});
      completeLesson(lessonId).catch((e) => console.warn('[useLessonCompletion] completeLesson error:', e));
      setTimeout(() => {
        if (onBack) {
          onBack();
        } else {
          goToDashboard();
        }
      }, 500);
    }
  }, [completedSteps, hasVideo, hasChecklist, hasScenario, hasQuiz, hasAction, lessonId, onBack]);

  const handleVideoComplete = () => {
    setCompletedSteps((prev) => ({ ...prev, videoWatched: true }));
  };

  const handleQuizComplete = () => {
    setCompletedSteps((prev) => ({ ...prev, quizDone: true }));
  };

  const handleChecklistComplete = (isDone) => {
    setCompletedSteps((prev) => ({ ...prev, checklistDone: isDone }));
  };

  const handleScenarioComplete = () => {
    setCompletedSteps((prev) => ({ ...prev, scenarioAttempted: true }));
  };

  const handleActionComplete = async () => {
    setCompletedSteps((prev) => ({ ...prev, videoWatched: true, actionDone: true, celebrationShown: true }));
    try {
      const userId = getActiveUserId();
      await logUserActivityToDB({
        userId,
        activityId: lessonId,
        activityType: 'lesson_activity',
        lessonId,
        service: 'therapy',
        resultSummary: { completed: true },
        rewardPoints: 25
      }).catch(() => {});
      await completeLesson(lessonId);
    } catch (e) {
      console.warn('[useLessonCompletion] completeLesson error:', e);
    }
    if (onBack) {
      onBack();
    } else {
      goToDashboard();
    }
  };

  const handleCloseCelebration = async () => {
    setShowCelebrate(false);
    setCompletedSteps((prev) => ({
      ...prev,
      celebrationShown: true
    }));

    try {
      const userId = getActiveUserId();
      await logUserActivityToDB({
        userId,
        activityId: lessonId,
        activityType: 'lesson_activity',
        lessonId,
        service: 'therapy',
        resultSummary: { completed: true },
        rewardPoints: 25
      }).catch(() => {});
      await completeLesson(lessonId);
    } catch (e) {}

    if (onBack) {
      onBack();
    } else {
      goToDashboard();
    }
  };

  return {
    videoWatched: completedSteps.videoWatched,
    quizDone: completedSteps.quizDone,
    checklistDone: completedSteps.checklistDone,
    scenarioAttempted: completedSteps.scenarioAttempted,
    actionDone: completedSteps.actionDone,
    lessonProgress,
    showCelebrate,
    handleVideoComplete,
    handleQuizComplete,
    handleChecklistComplete,
    handleScenarioComplete,
    handleActionComplete,
    handleCloseCelebration
  };
}
