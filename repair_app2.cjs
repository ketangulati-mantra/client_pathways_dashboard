const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

// Find lines that exactly equal: "  const dashboardTasks = [...activities]"
let found = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const dashboardTasks = [...activities]')) {
    found.push(i);
  }
}

console.log("Found dashboardTasks at lines:", found);

// Just completely reconstruct App.jsx safely because replace_file_content has corrupted it twice now
let validApp = `import React, { useState, useEffect } from 'react';
import ClientDashboard from './views/ClientDashboard';
import LessonTemplate from './components/LessonTemplate';
import EmotionalWellbeingAssessmentPage from './views/EmotionalWellbeingAssessmentPage';
import PremiumProviderLessonPage from './views/PremiumProviderLessonPage';
import HowCanTherapyHelpLessonPage from './views/HowCanTherapyHelpLessonPage';
import MarketYourselfLessonPage from './views/MarketYourselfLessonPage';
import ShareLinkedinLessonPage from './views/ShareLinkedinLessonPage';
import ShowAchievementsLessonPage from './views/ShowAchievementsLessonPage';
import GettingPaidLessonPage from './views/GettingPaidLessonPage';
import TherapyInternProgramLessonPage from './views/TherapyInternProgramLessonPage';
import TherapyNotesLessonPage from './views/TherapyNotesLessonPage';
import CoupleTherapyLessonPage from './views/CoupleTherapyLessonPage';
import CreatingPathwayLessonPage from './views/CreatingPathwayLessonPage';
import CannedResponsesLessonPage from './views/CannedResponsesLessonPage';
import MantraAssessmentsLessonPage from './views/MantraAssessmentsLessonPage';
import SupportHotlineLessonPage from './views/SupportHotlineLessonPage';
import CorporateEapLessonPage from './views/CorporateEapLessonPage';
import CommunityManagementLessonPage from './views/CommunityManagementLessonPage';
import ContentCreationLessonPage from './views/ContentCreationLessonPage';
import CampusAwarenessLessonPage from './views/CampusAwarenessLessonPage';
import FundRaisingLessonPage from './views/FundRaisingLessonPage';
import RecruitInternsLessonPage from './views/RecruitInternsLessonPage';
import ReferServicesLessonPage from './views/ReferServicesLessonPage';
import ConvertingClientsLessonPage from './views/ConvertingClientsLessonPage';
import InsuranceLessonPage from './views/InsuranceLessonPage';
import BookJoinSessionLessonPage from './views/BookJoinSessionLessonPage';
import HowTherapymantraWorksLessonPage from './views/HowTherapymantraWorksLessonPage';
import CreateWellbeingPlanLessonPage from './views/CreateWellbeingPlanLessonPage';
import EarnWhileYouImproveLessonPage from './views/EarnWhileYouImproveLessonPage';
import EarnPointsLessonPage from './views/EarnPointsLessonPage';
import ReferProviderLessonPage from './views/ReferProviderLessonPage';
import SalesPartnerLessonPage from './views/SalesPartnerLessonPage';
import CertificateDownloadPage from './views/CertificateDownloadPage';
import TherapyProviderCertificatePage from './views/TherapyProviderCertificatePage';
import TopListenerLessonPage from './views/TopListenerLessonPage';
import ListenerCertificatePage from './views/ListenerCertificatePage';
import YogaPathwayLessonPage from './views/YogaPathwayLessonPage';
import YogaRoutineLessonPage from './views/YogaRoutineLessonPage';
import YogaMindfulnessLessonPage from './views/YogaMindfulnessLessonPage';
import YogaNudgingLessonPage from './views/YogaNudgingLessonPage';
import YogaReferServicesLessonPage from './views/YogaReferServicesLessonPage';
import YogaMarketProfileLessonPage from './views/YogaMarketProfileLessonPage';
import YogaCertificatePage from './views/YogaCertificatePage';
import {
  BookOpen,
  Award,
  Smartphone,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import './App.css';
import { MANTRA_CONFIG } from './mantra';
import { activities } from './mantra/activities';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Custom router state listener
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate sorted dashboard tasks from the single source of truth
  const dashboardTasks = [...activities]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(activity => ({
      id: activity.lessonId,
      title: activity.title,
      path: activity.route,
      duration: activity.estimatedDuration,
      points: activity.rewardPoints,
      category: activity.route.includes('intern') || activity.route.includes('support') || activity.route.includes('corporate') || activity.route.includes('campus') ? 'Initiative' : 'Lesson',
      pathway: activity.pathway || 'General Health'
    }));

  // Render view based on route path
  const renderView = () => {
    if (currentPath === '/') {
      return (
        <ClientDashboard
          tasks={dashboardTasks}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/book-join-session') {
      return (
        <BookJoinSessionLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/how-therapymantra-works') {
      return (
        <HowTherapymantraWorksLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/create-your-personalized-wellbeing-plan') {
      return (
        <CreateWellbeingPlanLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/profile-verification') {
      window.location.href = 'https://provider.mantracare.com/verification';
      return null;
    }

    if (currentPath === '/emotional-wellbeing-assessment') {
      return (
        <EmotionalWellbeingAssessmentPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/premium-provider') {
      return (
        <PremiumProviderLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/how-can-therapy-help') {
      return (
        <HowCanTherapyHelpLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/market-yourself') {
      return (
        <MarketYourselfLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/share-linkedin') {
      return (
        <ShareLinkedinLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/show-achievements') {
      return (
        <ShowAchievementsLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/getting-paid') {
      return (
        <GettingPaidLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/intern-program') {
      return (
        <TherapyInternProgramLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/therapy-notes') {
      return (
        <TherapyNotesLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/couple-therapy') {
      return (
        <CoupleTherapyLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/creating-pathway') {
      return (
        <CreatingPathwayLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/canned-responses') {
      return (
        <CannedResponsesLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/mantra-assessments') {
      return (
        <MantraAssessmentsLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/support-hotline') {
      return (
        <SupportHotlineLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/corporate-eap') {
      return (
        <CorporateEapLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/community-management') {
      return (
        <CommunityManagementLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/content-creation') {
      return (
        <ContentCreationLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/campus-awareness') {
      return (
        <CampusAwarenessLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/fundraising') {
      return (
        <FundRaisingLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/recruit-interns') {
      return (
        <RecruitInternsLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/refer-services') {
      return (
        <ReferServicesLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/converting-clients') {
      return (
        <ConvertingClientsLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/insurance') {
      return (
        <InsuranceLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/earn-while-you-improve-your-wellbeing') {
      return (
        <EarnWhileYouImproveLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/earn-points') {
      return (
        <EarnPointsLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/refer-provider') {
      return (
        <ReferProviderLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/sales-partner') {
      return (
        <SalesPartnerLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/download-certificate') {
      return (
        <CertificateDownloadPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/provider-certificate') {
      return (
        <TherapyProviderCertificatePage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/top-listener-recognition') {
      return (
        <TopListenerLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/listener-certificate') {
      return (
        <ListenerCertificatePage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/yoga-pathway') {
      return (
        <YogaPathwayLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/yoga-routine') {
      return (
        <YogaRoutineLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/yoga-mindfulness') {
      return (
        <YogaMindfulnessLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/yoga-nudging') {
      return (
        <YogaNudgingLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/yoga-refer-services') {
      return (
        <YogaReferServicesLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/yoga-market-profile') {
      return (
        <YogaMarketProfileLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/yoga-certificate') {
      return (
        <YogaCertificatePage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath !== '/') {
      const activeLesson = activities.find(t => t.route === currentPath);

      if (activeLesson) {
        return (
          <LessonTemplate
            lesson={activeLesson}
            onBack={() => navigate('/')}
          />
        );
      }
    }

    // Default Fallback
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>
        <p>Page not found</p>
        <button onClick={() => navigate('/')} style={{ marginLeft: '10px', padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Go Home</button>
      </div>
    );
  };

  return (
    <div className="academy-layout">
      <ErrorBoundary>
        {renderView()}
      </ErrorBoundary>
    </div>
  );
}

export default App;
`;

fs.writeFileSync('src/App.jsx', validApp);
console.log('App.jsx repaired to a completely safe state.');
