import { useState, useEffect, useCallback, useRef } from 'react';
import { storyService } from '../services/storyService.js';

export function useStoryState(userId) {
  const [storyState, setStoryState] = useState(null);
  const [latestChapter, setLatestChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [canUnlockNextChapter, setCanUnlockNextChapter] = useState(false);
  const [dailyEligibility, setDailyEligibility] = useState(null);
  const [nextChapterHint, setNextChapterHint] = useState(null);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);
  const activeFetchRef = useRef(false);

  const loadStoryData = useCallback(async (force = false) => {
    if (!userId || activeFetchRef.current) return;
    activeFetchRef.current = true;

    try {
      setError(null);
      const unified = await storyService.getStoryState(userId);

      if (isMountedRef.current && unified) {
        setStoryState(unified.state || null);
        setLatestChapter(unified.latestChapter || null);
        setChapters(unified.chapters || []);
        setCanUnlockNextChapter(Boolean(unified.canUnlockNextChapter));
        setDailyEligibility(unified.dailyEligibility || null);
        setNextChapterHint(unified.nextChapterHint || null);
        setCurrentCycle(unified.currentCycle || null);
        setIsGenerating(Boolean(unified.state?.is_generating));
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.warn('[useStoryState] Failed to fetch story data:', err);
        setError(err.message || 'Unable to load story');
      }
    } finally {
      activeFetchRef.current = false;
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    isMountedRef.current = true;
    loadStoryData();

    // Listen for state broadcast across Journal, check-ins, and story updates
    const handleRevalidate = () => {
      if (isMountedRef.current) {
        loadStoryData(true);
      }
    };

    window.addEventListener('story-state-updated', handleRevalidate);
    window.addEventListener('journal-entry-saved', handleRevalidate);
    window.addEventListener('daily-checkin-completed', handleRevalidate);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('story-state-updated', handleRevalidate);
      window.removeEventListener('journal-entry-saved', handleRevalidate);
      window.removeEventListener('daily-checkin-completed', handleRevalidate);
    };
  }, [userId, loadStoryData]);

  const generateChapter = useCallback(async () => {
    if (!userId || isGenerating) return null;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await storyService.generateNextChapter(userId);
      if (isMountedRef.current && result) {
        setLatestChapter(result.chapter);
        setStoryState(result.state);
        setChapters((prev) => {
          const exists = prev.some((c) => c.chapter_number === result.chapter.chapter_number);
          if (exists) return prev.map((c) => (c.chapter_number === result.chapter.chapter_number ? result.chapter : c));
          return [...prev, result.chapter].sort((a, b) => a.chapter_number - b.chapter_number);
        });
        if (result.unified) {
          setCanUnlockNextChapter(Boolean(result.unified.canUnlockNextChapter));
          setDailyEligibility(result.unified.dailyEligibility || null);
          setNextChapterHint(result.unified.nextChapterHint || null);
          setCurrentCycle(result.unified.currentCycle || null);
        }
      }
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        if (err.isDailyLimit) {
          setError("Today's chapter is already complete. Your story will continue tomorrow.");
        } else if (err.isLockConflict) {
          setError('Your next chapter is already taking shape. Please wait a moment.');
        } else {
          setError(err.message || 'Generation failed. Please try again.');
        }
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  }, [userId, isGenerating]);

  const hasChapters = Boolean(storyState && storyState.current_chapter_number > 0);

  return {
    storyState,
    latestChapter,
    chapters,
    hasChapters,
    canUnlockNextChapter,
    dailyEligibility,
    nextChapterHint,
    currentCycle,
    isLoading,
    isGenerating,
    error,
    generateChapter,
    refetch: () => loadStoryData(true)
  };
}
