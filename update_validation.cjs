const fs = require('fs');

// 1. Update activities.ts
let activities = fs.readFileSync('src/mantra/activities.ts', 'utf8');
activities = activities.replace(/'\/task\//g, "'/");
activities = activities.replace(/service:\s*'Therapist'/g, "service: 'Therapy'");
fs.writeFileSync('src/mantra/activities.ts', activities);

// 2. Update App.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Replace import DeveloperLessonsPage with ClientDashboard
app = app.replace(
  /import DeveloperLessonsPage from '\.\/views\/DeveloperLessonsPage';/g,
  "import ClientDashboard from './views/ClientDashboard';"
);

// Replace /dev fallback with ClientDashboard for root
app = app.replace(
  /if \(currentPath === '\/dev'\) \{[\s\S]*?<DeveloperLessonsPage[\s\S]*?\/>\s*\);\s*\}/,
  `if (currentPath === '/') {\n      return (\n        <ClientDashboard\n          tasks={dashboardTasks}\n          onNavigate={navigate}\n        />\n      );\n    }`
);

// Remove the Mantra Provider Academy Root / fallback completely
app = app.replace(
  /\/\/ Default Bare-bones Branded Fallback for Root \/ and other paths[\s\S]*?return \([\s\S]*?<div className="academy-layout">/,
  `// Default Fallback\n    return (\n      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>\n        <p>Page not found</p>\n        <button onClick={() => navigate('/')} style={{ marginLeft: '10px', padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Go Home</button>\n      </div>\n    );\n  };\n\n  return (\n    <div className="academy-layout">`
);

// Change /task/ routes in App.jsx
app = app.replace(/currentPath === '\/task\//g, "currentPath === '/");
app = app.replace(/currentPath\.startsWith\('\/task\/'\)/g, "currentPath !== '/'"); // currentPath !== '/' because everything else not matched is checked here. Actually just let it be a fallback.
// Better: the dynamic route loader:
// if (currentPath.startsWith('/task/')) { ... }
// We can change it to:
// const activeLesson = activities.find(t => t.route === currentPath);
// if (activeLesson) { return <LessonTemplate ... /> }
app = app.replace(
  /if \(currentPath\.startsWith\('\/task\/'\)\) \{[\s\S]*?const activeLesson = activities\.find\(t => t\.route === currentPath\);[\s\S]*?if \(activeLesson\) \{/,
  "const activeLesson = activities.find(t => t.route === currentPath);\n\n      if (activeLesson) {"
);
// Now we need to remove the closing bracket of the removed if block. 
// A safer way is to just do exactly this:
app = app.replace(
  /if \(currentPath\.startsWith\('\/task\/'\)\) \{\s*const activeLesson = activities\.find\(t => t\.route === currentPath\);\s*if \(activeLesson\) \{\s*return \(\s*<LessonTemplate\s*lesson=\{activeLesson\}\s*onBack=\{\(\) => navigate\('\/dev'\)\}\s*\/>\s*\);\s*\}\s*\}/,
  `const activeLesson = activities.find(t => t.route === currentPath);
    if (activeLesson) {
      return (
        <LessonTemplate
          lesson={activeLesson}
          onBack={() => navigate('/')}
        />
      );
    }`
);

// Change all onBack navigate
app = app.replace(/onBack=\{.*?navigate\('\/dev'\).*?\}/g, "onBack={() => navigate('/')}");

// Change dashboard category mapping in App.jsx
app = app.replace(/activity\.service \|\| 'Therapist'/g, "activity.service || 'Therapy'");

fs.writeFileSync('src/App.jsx', app);
console.log("Updates completed");
