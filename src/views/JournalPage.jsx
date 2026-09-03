import React, { useState, useEffect } from 'react';
import JournalIntroScreen from '../components/journal/JournalIntroScreen';
import JournalSetupScreen from '../components/journal/JournalSetupScreen';
import JournalHomeScreen from '../components/journal/JournalHomeScreen';
import JournalEditor from '../components/journal/JournalEditor';
import ReflectOnTodayFlow from '../components/journal/ReflectOnTodayFlow';
import GuidedPromptsFlow from '../components/journal/GuidedPromptsFlow';
import JournalDetailView from '../components/journal/JournalDetailView';
import JournalHistoryScreen from '../components/journal/JournalHistoryScreen';
import JournalCalendarScreen from '../components/journal/JournalCalendarScreen';
import JournalSearchScreen from '../components/journal/JournalSearchScreen';
import JournalPatternsScreen from '../components/journal/JournalPatternsScreen';
import JournalStoryScreen from '../components/journal/JournalStoryScreen';
import { useCheckInState } from '../hooks/useCheckInState';
import { getActiveUserId, getActiveUserName } from '../services/authService';

export default function JournalPage({ onBack }) {
  const userId = getActiveUserId();
  const userName = getActiveUserName() || '';

  // View state: 'intro' | 'setup' | 'home' | 'history' | 'calendar' | 'search' | 'patterns' | 'story' | 'detail' | 'editor' | 'reflect_today' | 'guided_prompts'
  const [viewState, setViewState] = useState('intro');
  const [previousViewState, setPreviousViewState] = useState('intro');
  const [editorEntryType, setEditorEntryType] = useState('free_write');
  const [editorInitialPrompt, setEditorInitialPrompt] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [customReflectionDate, setCustomReflectionDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Centralized Canonical Check-In State from Database
  const {
    hasCheckedInToday: hasCompletedCheckIn,
    todayLatestCheckIn: latestCheckIn,
    streak: dbStreak,
    refetch: refetchCheckInState
  } = useCheckInState(userId);

  // 1. Navigation Handlers
  const handleBeginWritingFromIntro = () => {
    setViewState('setup');
  };

  const handleSelectSetupOption = (optionId) => {
    setEditingEntry(null);
    setEditorInitialPrompt(null);
    setCustomReflectionDate(null);

    if (optionId === 'free_write') {
      setEditorEntryType('free_write');
      setViewState('editor');
    } else if (optionId === 'reflect_today') {
      setViewState('reflect_today');
    } else if (optionId === 'guided_prompt') {
      setViewState('guided_prompts');
    }
  };

  const handleOpenDetail = (entry) => {
    setPreviousViewState(viewState);
    setSelectedEntry(entry);
    setViewState('detail');
  };

  const handleStartNewFreeWrite = () => {
    setEditingEntry(null);
    setEditorInitialPrompt(null);
    setCustomReflectionDate(null);
    setEditorEntryType('free_write');
    setViewState('editor');
  };

  const handleStartReflectOnToday = () => {
    setEditingEntry(null);
    setEditorInitialPrompt(null);
    setCustomReflectionDate(null);
    setViewState('reflect_today');
  };

  const handleStartGuidedPrompt = () => {
    setEditingEntry(null);
    setEditorInitialPrompt(null);
    setCustomReflectionDate(null);
    setViewState('guided_prompts');
  };

  const handleStartReflectionOnDate = (dateObj) => {
    setEditingEntry(null);
    setEditorInitialPrompt(null);
    setCustomReflectionDate(dateObj);
    setEditorEntryType('free_write');
    setViewState('editor');
  };

  const handleStartEdit = (entry) => {
    setEditingEntry(entry);
    setEditorInitialPrompt(null);
    setEditorEntryType(entry.entry_type || 'free_write');
    setViewState('editor');
  };

  const handleSavedEntry = (savedEntry, wasEditing) => {
    if (refetchCheckInState) refetchCheckInState();
    if (wasEditing) {
      setSelectedEntry(savedEntry);
      setToastMessage('✓ Reflection saved');
      setViewState('detail');
    } else {
      setToastMessage('✓ Reflection saved');
      setViewState('history');
    }
  };

  const handleDeletedEntry = (deletedId) => {
    if (refetchCheckInState) refetchCheckInState();
    setSelectedEntry(null);
    setToastMessage('Reflection deleted');
    setViewState(
      previousViewState === 'patterns'
        ? 'patterns'
        : previousViewState === 'search'
        ? 'search'
        : previousViewState === 'calendar'
        ? 'calendar'
        : previousViewState === 'history'
        ? 'history'
        : 'history'
    );
  };

  const handleBackToHome = () => {
    setSelectedEntry(null);
    setEditingEntry(null);
    setCustomReflectionDate(null);
    setViewState('intro');
  };

  const handleNavigateToCheckIn = () => {
    if (typeof window !== 'undefined') {
      window.location.hash = '#/task/daily-check-in';
    }
  };

  // 2. Render Active View
  if (viewState === 'intro') {
    return (
      <JournalIntroScreen
        userName={userName}
        latestCheckIn={latestCheckIn}
        hasCompletedCheckIn={hasCompletedCheckIn}
        onBack={onBack}
        onBeginWriting={handleBeginWritingFromIntro}
        onNavigateToCheckIn={handleNavigateToCheckIn}
      />
    );
  }

  if (viewState === 'setup') {
    return (
      <JournalSetupScreen
        onBack={() => setViewState('intro')}
        onSelectOption={handleSelectSetupOption}
        onViewHistory={() => setViewState('history')}
        latestCheckIn={latestCheckIn}
        hasCompletedCheckIn={hasCompletedCheckIn}
      />
    );
  }

  if (viewState === 'reflect_today') {
    return (
      <ReflectOnTodayFlow
        onBack={() => setViewState('setup')}
        onSaved={handleSavedEntry}
        onNavigateToCheckIn={handleNavigateToCheckIn}
        latestCheckIn={latestCheckIn}
        hasCompletedCheckIn={hasCompletedCheckIn}
      />
    );
  }

  if (viewState === 'guided_prompts') {
    return (
      <GuidedPromptsFlow
        onBack={() => setViewState('setup')}
        onSaved={handleSavedEntry}
        latestCheckIn={latestCheckIn}
        hasCompletedCheckIn={hasCompletedCheckIn}
      />
    );
  }

  if (viewState === 'editor') {
    return (
      <JournalEditor
        entryType={editorEntryType}
        initialPrompt={editorInitialPrompt}
        editingEntry={editingEntry}
        onBack={() => {
          if (editingEntry) {
            setViewState('detail');
          } else if (customReflectionDate) {
            setViewState('calendar');
          } else {
            setViewState('setup');
          }
        }}
        onSaved={handleSavedEntry}
        onNavigateToCheckIn={handleNavigateToCheckIn}
        latestCheckIn={latestCheckIn}
        hasCompletedCheckIn={hasCompletedCheckIn}
      />
    );
  }

  if (viewState === 'detail') {
    return (
      <JournalDetailView
        entry={selectedEntry}
        onBack={() => {
          setSelectedEntry(null);
          setViewState(
            previousViewState === 'patterns'
              ? 'patterns'
              : previousViewState === 'search'
              ? 'search'
              : previousViewState === 'calendar'
              ? 'calendar'
              : previousViewState === 'history'
              ? 'history'
              : 'history'
          );
        }}
        onEdit={handleStartEdit}
        onDeleted={handleDeletedEntry}
      />
    );
  }

  if (viewState === 'patterns') {
    return (
      <JournalPatternsScreen
        onBack={() => setViewState('history')}
        onOpenWrite={() => setViewState('write')}
        onNavigateToCalendar={() => setViewState('calendar')}
        onNavigateToHistory={() => setViewState('history')}
      />
    );
  }

  if (viewState === 'search') {
    return (
      <JournalSearchScreen
        initialQuery={searchQuery}
        onBack={() => setViewState('history')}
        onSelectEntry={handleOpenDetail}
      />
    );
  }

  if (viewState === 'calendar') {
    return (
      <JournalCalendarScreen
        onBack={() => setViewState('history')}
        onSelectEntry={handleOpenDetail}
        onStartReflectionOnDate={handleStartReflectionOnDate}
      />
    );
  }

  if (viewState === 'story') {
    return (
      <JournalStoryScreen
        userId={userId}
        onBack={() => setViewState(previousViewState === 'story' ? 'home' : previousViewState || 'home')}
      />
    );
  }

  if (viewState === 'history') {
    return (
      <JournalHistoryScreen
        onBack={() => setViewState('setup')}
        onSelectEntry={handleOpenDetail}
        onStartNewEntry={() => setViewState('setup')}
        onOpenCalendar={() => setViewState('calendar')}
        onOpenSearch={() => setViewState('search')}
        onOpenPatterns={() => setViewState('patterns')}
        onOpenStory={() => {
          setPreviousViewState('history');
          setViewState('story');
        }}
      />
    );
  }

  return (
    <JournalHomeScreen
      onBack={onBack}
      onNavigateToCheckIn={handleNavigateToCheckIn}
      onStartFreeWrite={handleStartNewFreeWrite}
      onStartReflectOnToday={handleStartReflectOnToday}
      onStartGuidedPrompt={handleStartGuidedPrompt}
      onSelectEntry={handleOpenDetail}
      onViewAllHistory={() => setViewState('history')}
      onOpenStory={() => {
        setPreviousViewState('home');
        setViewState('story');
      }}
      successToastMessage={toastMessage}
    />
  );
}
