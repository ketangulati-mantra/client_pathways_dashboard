import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { useStoryState } from '../../hooks/useStoryState.js';
import StoryDiscovery from './story/StoryDiscovery.jsx';
import StoryHome from './story/StoryHome.jsx';
import StoryChapterReader from './story/StoryChapterReader.jsx';
import StoryGenerationExperience from './story/StoryGenerationExperience.jsx';

export default function JournalStoryScreen({ userId, onBack }) {
  const {
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
    refetch,
    generateChapter
  } = useStoryState(userId);

  const [activeView, setActiveView] = useState('main'); // 'main' | 'reader'
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Handle Begin / Next Chapter Generation
  const handleGenerate = async () => {
    try {
      const result = await generateChapter();
      if (result && result.chapter) {
        setSelectedChapter(result.chapter);
        setActiveView('reader');
      }
    } catch (err) {
      console.warn('[JournalStoryScreen] Generation error:', err);
    }
  };

  const handleOpenChapter = (ch) => {
    setSelectedChapter(ch);
    setActiveView('reader');
  };

  // 1. Generation State View
  if (isGenerating) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StoryGenerationExperience />
      </div>
    );
  }

  // 2. Layout-Stable Skeleton Loading View (Prevents Layout Shifts)
  if (isLoading && !storyState && !hasChapters) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#FAF7F2',
          padding: '16px 18px 64px',
          maxWidth: '740px',
          margin: '0 auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#EDE7DC' }} />
          <div style={{ width: '140px', height: '24px', borderRadius: '9999px', background: '#EDE7DC' }} />
        </div>
        <div style={{ width: '100%', height: '180px', borderRadius: '24px', background: '#E2DBD0' }} />
        <div style={{ width: '100%', height: '120px', borderRadius: '20px', background: '#EDE7DC' }} />
        <div style={{ width: '100%', height: '80px', borderRadius: '18px', background: '#EDE7DC' }} />
      </div>
    );
  }

  // 3. Error Fallback View (Calm & Recoverable)
  if (error && !storyState && !hasChapters) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#FAF7F2',
          padding: '32px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '14px',
          maxWidth: '480px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: 600 }}>
          Your story is momentarily quiet
        </span>
        <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
          {error || 'Unable to connect to your story realm. Please check your connection and try again.'}
        </p>
        <button
          type="button"
          onClick={refetch}
          style={{
            marginTop: '8px',
            background: '#0F172A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            padding: '10px 22px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // 4. Reader View
  if (activeView === 'reader' && (selectedChapter || latestChapter)) {
    return (
      <StoryChapterReader
        chapter={selectedChapter || latestChapter}
        storyState={storyState}
        onBack={() => {
          setSelectedChapter(null);
          setActiveView('main');
        }}
        onOpenNextChapter={canUnlockNextChapter ? handleGenerate : null}
        isGeneratingNext={isGenerating}
        canUnlockNextChapter={canUnlockNextChapter}
        dailyEligibility={dailyEligibility}
      />
    );
  }

  // 5. Discovery View (First-time user)
  if (!hasChapters) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FAF7F2', boxSizing: 'border-box', padding: '16px 16px 64px' }}>
        <StoryDiscovery
          onBegin={handleGenerate}
          isGenerating={isGenerating}
          error={error}
        />
      </div>
    );
  }

  // 6. Active Story Home
  return (
    <div style={{ minHeight: '100dvh', background: '#FAF7F2', boxSizing: 'border-box' }}>
      <StoryHome
        storyState={storyState}
        latestChapter={latestChapter}
        chapters={chapters}
        canUnlockNextChapter={canUnlockNextChapter}
        dailyEligibility={dailyEligibility}
        nextChapterHint={nextChapterHint}
        currentCycle={currentCycle}
        onSelectChapter={handleOpenChapter}
        onGenerateNext={handleGenerate}
        isGenerating={isGenerating}
        onBack={onBack}
      />
    </div>
  );
}
