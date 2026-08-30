import { useState, useEffect, useRef } from 'react';
import { completeLesson, goToDashboard } from '../mantra';
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
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (completedSteps.celebrationShown) {
        showToast("🎉 Welcome back! This activity has already been completed. You can review the lesson whenever you'd like.", "success", 4000);
      }
    }
  }, [completedSteps.celebrationShown, showToast]);

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
      const timer = setTimeout(() => {
        setShowCelebrate(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [completedSteps, hasVideo, hasChecklist, hasScenario, hasQuiz, hasAction]);

  const handleVideoComplete = () => {
    setCompletedSteps((prev) => ({ ...prev, videoWatched: true }));
  };

  const handleQuizComplete = () => {
    if (completedSteps.celebrationShown) {
      showToast("You've already completed this activity.", "success", 3000);
      if (onBack) {
        setTimeout(() => {
          goToDashboard();
        }, 1800);
      }
      return;
    }
    setCompletedSteps((prev) => ({ ...prev, quizDone: true }));
  };

  const handleChecklistComplete = (isDone) => {
    setCompletedSteps((prev) => ({ ...prev, checklistDone: isDone }));
  };

  const handleScenarioComplete = () => {
    setCompletedSteps((prev) => ({ ...prev, scenarioAttempted: true }));
  };

  const handleActionComplete = () => {
    if (completedSteps.celebrationShown) {
      showToast("You've already completed this activity.", "success", 3000);
      if (onBack) {
        setTimeout(() => {
          goToDashboard();
        }, 1800);
      }
      return;
    }
    setCompletedSteps((prev) => ({ ...prev, actionDone: true }));
  };

  /*  const handleCloseCelebration = async () => {
    console.log("HANDLE CLOSE CELEBRATION FIRED");
  
    setShowCelebrate(false);
    setCompletedSteps(prev => ({
      ...prev,
      celebrationShown: true
    }));
  
    await completeLesson(lessonId);
  
    if (onBack) {
      goToDashboard();
    }
  }; */

  const handleCloseCelebration = async () => {

    setShowCelebrate(false);

    setCompletedSteps((prev) => ({
      ...prev,
      celebrationShown: true
    }));

    await completeLesson(lessonId);

    if (onBack) {
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
