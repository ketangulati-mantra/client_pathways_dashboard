const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Replace import
content = content.replace(
  /import DeveloperLessonsPage from '\.\/views\/DeveloperLessonsPage';/g,
  "import ClientDashboard from './views/ClientDashboard';"
);

// Replace /dev route with / and update component
content = content.replace(
  /if \(currentPath === '\/dev'\) \{[\s\S]*?<DeveloperLessonsPage[\s\S]*?\/>\s*\);\s*\}/,
  `if (currentPath === '/') {\n      return (\n        <ClientDashboard\n          tasks={dashboardTasks}\n          onNavigate={navigate}\n        />\n      );\n    }`
);

// Replace all onBack navigate('/dev') to navigate('/')
content = content.replace(/onBack=\{.*?navigate\('\/dev'\).*?\}/g, "onBack={() => navigate('/')}");

// Remove the default fallback (Mantra Provider Academy page)
content = content.replace(
  /\/\/ Default Bare-bones Branded Fallback for Root \/ and other paths[\s\S]*?return \([\s\S]*?<div className="academy-layout">/,
  `// Default Fallback
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-app)' }}>
        <p>Page not found</p>
        <button onClick={() => navigate('/')} style={{ marginLeft: '10px', padding: '8px 16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Go Home</button>
      </div>
    );
  };

  return (
    <div className="academy-layout">`
);

fs.writeFileSync('src/App.jsx', content);
