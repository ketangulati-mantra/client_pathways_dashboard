import React, { useState } from 'react';
import {
  ChallengeDashboardPayload,
  Challenge,
  ChallengeEnrollment
} from '../../services/challengeService';
import Mantra21InviteModal from '../Mantra21InviteModal';

interface ActiveChallengeDashboardViewProps {
  dashboard: ChallengeDashboardPayload;
  onRefresh?: () => void;
  onNavigatePathwayTask?: (taskId: string) => void;
}

export const ActiveChallengeDashboardView: React.FC<ActiveChallengeDashboardViewProps> = ({
  dashboard,
  onRefresh,
  onNavigatePathwayTask
}) => {
  const { challenge, enrollment, today, progress, milestones, suggestions, therapyRecommendation, leaderboard } = dashboard;
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const totalDays = challenge?.durationDays || 21;
  const currentDay = enrollment?.currentDay || 1;
  const completedDays = progress?.completedDays ?? enrollment?.completedDays ?? 0;
  const currentStreak = progress?.currentStreak ?? enrollment?.currentStreak ?? 0;
  const longestStreak = progress?.longestStreak ?? enrollment?.longestStreak ?? 0;
  const progressPercent = progress?.percentage ?? Math.min(100, Math.round((completedDays / totalDays) * 100));

  const handleContinueToday = () => {
    const route = today?.actionRoute || '/task/mantra-21';
    if (onNavigatePathwayTask) {
      onNavigatePathwayTask(route);
    } else {
      window.location.hash = route.startsWith('/') ? route : `/${route}`;
    }
  };

  const handleBookTherapy = () => {
    const route = therapyRecommendation?.actionRoute || '/task/how-can-therapy-help';
    if (onNavigatePathwayTask) {
      onNavigatePathwayTask(route);
    } else {
      window.location.hash = route.startsWith('/') ? route : `/${route}`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-950/60 via-slate-900 to-slate-950 border-b border-sky-900/30 px-4 pt-8 pb-10 sm:px-6 lg:px-8">
        {/* Glow backdrop circles */}
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Tag & Challenge Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                ACTIVE CHALLENGE
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {challenge.category?.toUpperCase()}
              </span>
            </div>

            {/* Invite Button */}
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow-sm active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Invite Buddy</span>
            </button>
          </div>

          {/* Title & Tagline */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {challenge?.name || 'Mantra 21'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {challenge?.tagline || challenge?.description}
          </p>

          {/* Main Action Bar / Daily Tracker Card */}
          <div className="mt-8 bg-slate-900/90 border border-sky-500/20 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl shadow-sky-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div>
                <div className="text-xs font-semibold text-sky-400 tracking-wider uppercase">
                  Current Checkpoint
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                  Day {String(currentDay).padStart(2, '0')}{' '}
                  <span className="text-base font-normal text-slate-400">
                    / {totalDays}
                  </span>
                </div>
                {today && (
                  <div className="text-sm font-medium text-slate-200 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    {today.title}
                    <span className="text-xs text-slate-400 font-normal">({today.estimatedMinutes} min)</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleContinueToday}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>Continue Today's Task</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Progress Bar & Stats */}
            <div className="pt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Overall Completion</span>
                  <span className="font-semibold text-sky-300">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, progressPercent)}%` }}
                  />
                </div>
              </div>

              {/* Mini Stats row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-center">
                  <div className="text-lg sm:text-xl font-extrabold text-amber-400">
                    🔥 {currentStreak} <span className="text-xs font-normal text-slate-400">days</span>
                  </div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide mt-0.5">
                    Current Streak
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-center">
                  <div className="text-lg sm:text-xl font-extrabold text-emerald-400">
                    ✓ {completedDays} <span className="text-xs font-normal text-slate-400">days</span>
                  </div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide mt-0.5">
                    Completed
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-center">
                  <div className="text-lg sm:text-xl font-extrabold text-sky-400">
                    🏆 {longestStreak} <span className="text-xs font-normal text-slate-400">best</span>
                  </div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide mt-0.5">
                    Longest Streak
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Section 1: Milestones Track */}
        {milestones && milestones.length > 0 && (
          <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
              <span className="text-sky-400">📍</span> Journey Milestones
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {milestones.map((m) => (
                <div
                  key={m.day}
                  className={`p-3.5 rounded-xl border transition-all ${
                    m.isReached
                      ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Day {m.day}
                    </span>
                    <span>{m.isReached ? '✓' : '🔒'}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {m.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {m.isReached ? 'Unlocked' : (m.isCurrent ? 'Current' : 'Upcoming')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Personalized Pathway Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-indigo-400">✨</span> Personalized For Your Pathway
              </h2>
              <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full">
                Tailored Routine
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Complements your universal challenge with focused micro-practices for your current state.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col justify-between gap-3 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-sky-400">{sug.tag || 'ACTIVITY'}</span>
                      <span className="text-[11px] text-slate-400">{sug.estimatedMinutes || 5} min</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">{sug.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">{sug.description}</p>
                  </div>
                  {sug.actionRoute && (
                    <button
                      onClick={() => {
                        if (onNavigatePathwayTask) {
                          onNavigatePathwayTask(sug.actionRoute);
                        } else {
                          window.location.hash = sug.actionRoute.startsWith('#') ? sug.actionRoute : `#${sug.actionRoute}`;
                        }
                      }}
                      className="text-xs font-medium text-sky-300 hover:text-sky-200 flex items-center gap-1 self-start group"
                    >
                      Start micro-activity
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Contextual Therapy Recommendation Card */}
        {therapyRecommendation && (
          <section className="relative overflow-hidden bg-gradient-to-r from-teal-950/40 via-slate-900 to-sky-950/40 border border-teal-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <span className="text-[10px] font-bold tracking-widest text-teal-300 uppercase bg-teal-950/80 px-2.5 py-0.5 rounded-md border border-teal-500/30">
                  {therapyRecommendation.subtitle || 'RECOMMENDED'}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {therapyRecommendation.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {therapyRecommendation.description}
                </p>
              </div>
              <button
                onClick={handleBookTherapy}
                className="whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 transition-all active:scale-95"
              >
                {therapyRecommendation.ctaText || 'EXPLORE SUPPORT →'}
              </button>
            </div>
          </section>
        )}

        {/* Section 4: Daily Snapshot Leaderboard Slice */}
        {leaderboard && (
          <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-amber-400">⚡</span> Community Momentum
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Snapshot calculated daily. Sticking to small habits together.
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              {leaderboard.top?.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm bg-slate-950/40 border-slate-800/80 text-slate-300"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        entry.rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : entry.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <span>
                      {entry.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-amber-400 font-semibold">
                      🔥 {entry.streak}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Social Invitation Modal */}
      {isInviteOpen && (
        <Mantra21InviteModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      )}
    </div>
  );
};

export default ActiveChallengeDashboardView;
