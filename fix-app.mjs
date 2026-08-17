import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Wrap /dev route in devMode check
content = content.replace(
  /if \(currentPath === '\/dev'\) {[\s\S]*?return \([\s\S]*?<DeveloperLessonsPage[\s\S]*?\/>[\s\S]*?\);[\s\S]*?}/,
  `if (currentPath === '/dev') {
      if (!MANTRA_CONFIG.devMode) {
        window.location.replace(MANTRA_CONFIG.dashboardUrl);
        return null;
      }
      return (
        <DeveloperLessonsPage
          tasks={dashboardTasks}
          onNavigate={navigate}
        />
      );
    }`
);

// Replace all hardcoded onBack
content = content.replace(
  /onBack=\{\(\) => navigate\('\/dev'\)\}/g,
  'onBack={MANTRA_CONFIG.devMode ? () => navigate(\'/dev\') : undefined}'
);

fs.writeFileSync('src/App.jsx', content);
