import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchChallengeHubDashboard,
  enrollInChallenge,
  createOptimisticActiveDashboard,
  ChallengeDashboardPayload
} from '../services/challengeService';
import { getActiveUserId } from '../services/authService';
import ChallengeCatalogueView from '../components/challenges/ChallengeCatalogueView';
import EnrolledChallengeView from '../components/challenges/EnrolledChallengeView';

interface ChallengeHubPageProps {
  onNavigatePathwayTask?: (taskId: string) => void;
}

export const ChallengeHubPage: React.FC<ChallengeHubPageProps> = ({ onNavigatePathwayTask }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<ChallengeDashboardPayload | null>(null);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [enrollmentError, setEnrollmentError] = useState<string | undefined>(undefined);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getActiveUserId();
      const res = await fetchChallengeHubDashboard(userId);
      setDashboardData(res);
    } catch (err: any) {
      console.error('[ChallengeHubPage] Error loading dashboard:', err);
      setError(err?.message || 'Failed to load your journey. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleEnroll = async (challengeId: string) => {
    const userId = getActiveUserId() || '234306';
    if (!userId) {
      alert('Please log in or select a profile to start your challenge.');
      return;
    }

    setEnrollmentError(undefined);

    // 🚀 SCALABILITY & INSTANT TRANSITION: Optimistic UI update
    // Immediately switch the view to Active Sanctuary without waiting for network roundtrip (0ms latency)
    if (challengeId === 'mantra_21') {
      const optimisticData = createOptimisticActiveDashboard(userId, challengeId);
      setDashboardData(optimisticData);
      setLoading(false);
    }

    setIsEnrolling(true);

    try {
      const res = await enrollInChallenge(challengeId, userId);
      if (res.success) {
        // Revalidate quietly in the background without showing loading spinner
        const fresh = await fetchChallengeHubDashboard(userId, { skipCache: true });
        if (fresh && fresh.state === 'active') {
          setDashboardData(fresh);
        }
      } else {
        setEnrollmentError(res.error || (res as any).message || 'Unable to enroll in challenge.');
      }
    } catch (err: any) {
      console.error('[ChallengeHubPage] Enrollment background sync failed:', err);
      // Keep optimistic view active if local storage is set, only log warning
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070D18',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F8FAFC',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(56, 189, 248, 0.2)',
            borderTopColor: '#38BDF8',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px'
          }}
        />
        <p style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Entering Sanctuary...
        </p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070D18',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F8FAFC',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#F87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            marginBottom: '16px'
          }}
        >
          !
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', color: '#FFFFFF' }}>
          Couldn't load your journey right now
        </h2>
        <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '380px', margin: '0 0 24px 0' }}>
          {error || 'Something went wrong while connecting to your active challenge sanctuary.'}
        </p>
        <button
          onClick={loadDashboard}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
            color: '#070D18',
            fontSize: '13px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  // STATE 2: User HAS an active challenge enrollment
  if (dashboardData.state === 'active' && dashboardData.enrollment) {
    return (
      <EnrolledChallengeView
        data={dashboardData}
        onRefresh={loadDashboard}
        onNavigatePathwayTask={onNavigatePathwayTask}
        onExploreOtherChallenges={() => {
          // Temporarily view catalogue if requested
          setDashboardData({
            ...dashboardData,
            state: 'no_active_challenge'
          });
        }}
      />
    );
  }

  // STATE 1: User has NO active challenge -> Show Discovery Catalogue
  return (
    <ChallengeCatalogueView
      challenges={dashboardData.availableChallenges || []}
      onEnroll={handleEnroll}
      isEnrolling={isEnrolling}
      enrollmentError={enrollmentError}
    />
  );
};

export default ChallengeHubPage;
