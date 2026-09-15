const fs = require('fs');

let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Restore imports
const missingImports = `import BookJoinSessionLessonPage from './views/BookJoinSessionLessonPage';
import HowTherapymantraWorksLessonPage from './views/HowTherapymantraWorksLessonPage';
import CreateWellbeingPlanLessonPage from './views/CreateWellbeingPlanLessonPage';
import PremiumProviderLessonPage from './views/PremiumProviderLessonPage';
import HowCanTherapyHelpLessonPage from './views/HowCanTherapyHelpLessonPage';
import EmotionalWellbeingAssessmentPage from './views/EmotionalWellbeingAssessmentPage';
`;

c = c.replace(/import ClientDashboard from '\.\/views\/ClientDashboard';/, "import ClientDashboard from './views/ClientDashboard';\n" + missingImports);

// 2. Inject the route block
const routeBlock = `
    if (currentPath === '/emotional-wellbeing-assessment') {
      return (
        <EmotionalWellbeingAssessmentPage
          onBack={() => navigate('/')}
        />
      );
    }
`;

if (!c.includes('/emotional-wellbeing-assessment')) {
  c = c.replace(/if \(currentPath === '\/premium-provider'\) \{/, routeBlock + "\n    if (currentPath === '/premium-provider') {");
}

fs.writeFileSync('src/App.jsx', c);
console.log('App.jsx repaired and updated!');
