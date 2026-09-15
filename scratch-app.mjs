import fs from 'fs';

const renderViewReplacement = `  const renderView = () => {
    if (currentPath === '/dev') {
      return (
        <DeveloperLessonsPage
          tasks={dashboardTasks}
          onNavigate={navigate}
        />
      );
    }

    const activeLesson = activities.find(t => t.route === currentPath);

    if (activeLesson) {
      if (activeLesson.lessonId === 'profile-verification') {
        window.location.href = 'https://provider.mantracare.com/verification';
        return null;
      }

      switch (activeLesson.lessonId) {
        case 'introduction': return <IntroductionLessonPage onBack={() => navigate('/dev')} />;
        case 'mobile-app': return <MobileAppLessonPage onBack={() => navigate('/dev')} />;
        case 'using-mantra': return <UsingMantraLessonPage onBack={() => navigate('/dev')} />;
        case 'premium-provider': return <PremiumProviderLessonPage onBack={() => navigate('/dev')} />;
        case 'getting-clients': return <GettingClientsLessonPage onBack={() => navigate('/dev')} />;
        case 'market-yourself': return <MarketYourselfLessonPage onBack={() => navigate('/dev')} />;
        case 'share-linkedin': return <ShareLinkedinLessonPage onBack={() => navigate('/dev')} />;
        case 'show-achievements': return <ShowAchievementsLessonPage onBack={() => navigate('/dev')} />;
        case 'getting-paid': return <GettingPaidLessonPage onBack={() => navigate('/dev')} />;
        case 'intern-program': return <TherapyInternProgramLessonPage onBack={() => navigate('/dev')} />;
        case 'therapy-notes': return <TherapyNotesLessonPage onBack={() => navigate('/dev')} />;
        case 'couple-therapy': return <CoupleTherapyLessonPage onBack={() => navigate('/dev')} />;
        case 'creating-pathway': return <CreatingPathwayLessonPage onBack={() => navigate('/dev')} />;
        case 'canned-responses': return <CannedResponsesLessonPage onBack={() => navigate('/dev')} />;
        case 'mantra-assessments': return <MantraAssessmentsLessonPage onBack={() => navigate('/dev')} />;
        case 'support-hotline': return <SupportHotlineLessonPage onBack={() => navigate('/dev')} />;
        case 'corporate-eap': return <CorporateEapLessonPage onBack={() => navigate('/dev')} />;
        case 'community-management': return <CommunityManagementLessonPage onBack={() => navigate('/dev')} />;
        case 'content-creation': return <ContentCreationLessonPage onBack={() => navigate('/dev')} />;
        case 'campus-awareness': return <CampusAwarenessLessonPage onBack={() => navigate('/dev')} />;
        case 'fundraising': return <FundRaisingLessonPage onBack={() => navigate('/dev')} />;
        case 'recruit-interns': return <RecruitInternsLessonPage onBack={() => navigate('/dev')} />;
        case 'refer-services': return <ReferServicesLessonPage onBack={() => navigate('/dev')} />;
        case 'converting-clients': return <ConvertingClientsLessonPage onBack={() => navigate('/dev')} />;
        case 'insurance': return <InsuranceLessonPage onBack={() => navigate('/dev')} />;
        case 'earn-points': return <EarnPointsLessonPage onBack={() => navigate('/dev')} />;
        case 'refer-provider': return <ReferProviderLessonPage onBack={() => navigate('/dev')} />;
        case 'sales-partner': return <SalesPartnerLessonPage onBack={() => navigate('/dev')} />;
        case 'download-certificate': return <CertificateDownloadPage onBack={() => navigate('/dev')} />;
        case 'provider-certificate': return <TherapyProviderCertificatePage onBack={() => navigate('/dev')} />;
        case 'top-listener-recognition': return <TopListenerLessonPage onBack={() => navigate('/dev')} />;
        case 'listener-certificate': return <ListenerCertificatePage onBack={() => navigate('/dev')} />;
        case 'yoga-pathway': return <YogaPathwayLessonPage onBack={() => navigate('/dev')} />;
        case 'yoga-routine': return <YogaRoutineLessonPage onBack={() => navigate('/dev')} />;
        case 'yoga-mindfulness': return <YogaMindfulnessLessonPage onBack={() => navigate('/dev')} />;
        case 'yoga-nudging': return <YogaNudgingLessonPage onBack={() => navigate('/dev')} />;
        case 'yoga-refer-services': return <YogaReferServicesLessonPage onBack={() => navigate('/dev')} />;
        case 'yoga-market-profile': return <YogaMarketProfileLessonPage onBack={() => navigate('/dev')} />;
        case 'yoga-certificate': return <YogaCertificatePage onBack={() => navigate('/dev')} />;
        default: return <LessonTemplate lesson={activeLesson} onBack={() => navigate('/dev')} />;
      }
    }

    // Default Bare-bones Branded Fallback for Root / and other paths
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--bg-app)',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div className="academy-card glass-panel text-center animate-scale-in" style={{ maxWidth: '440px', padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <img src="/logo.svg" alt="Mantra Logo" style={{ height: '36px', display: 'block', marginBottom: '8px' }} />

          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-main)', fontSize: '1.35rem', marginBottom: '8px' }}>
              Mantra Provider Academy
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '4px' }}>
              This application powers interactive learning modules for providers.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Lessons are launched directly from the Provider Dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  };`;

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Also update 'Therapist' to 'Therapy' in dashboardTasks mapper
content = content.replace(/service: activity.service \|\| 'Therapist'/g, "service: activity.service || 'Therapy'");

const startIndex = content.indexOf('  const renderView = () => {');
const endIndex = content.indexOf('  return (\n    <div className="academy-layout">');
const endIndex2 = content.indexOf('  return (\r\n    <div className="academy-layout">');

const targetEndIndex = endIndex !== -1 ? endIndex : endIndex2;

if (startIndex !== -1 && targetEndIndex !== -1) {
  content = content.substring(0, startIndex) + renderViewReplacement + '\n\n' + content.substring(targetEndIndex);
  fs.writeFileSync('src/App.jsx', content);
  console.log('App.jsx refactored successfully.');
} else {
  console.log('Could not find indices.', {startIndex, endIndex, endIndex2});
}
