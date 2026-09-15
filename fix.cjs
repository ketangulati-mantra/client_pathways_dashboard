const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
c = c.replace(/if \(currentPath === '\/'\) \{[\s\S]*?if \(currentPath === '\/market-yourself'\)/, `if (currentPath === '/') {
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

    if (currentPath === '/using-mantra') {
      return (
        <UsingMantraLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/profile-verification') {
      window.location.href = 'https://provider.mantracare.com/verification';
      return null;
    }

    if (currentPath === '/premium-provider') {
      return (
        <PremiumProviderLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/getting-clients') {
      return (
        <GettingClientsLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/market-yourself')`);
fs.writeFileSync('src/App.jsx', c);
