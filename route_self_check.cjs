const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

const importStr = "import UnderstandDepressionLessonPage from './views/UnderstandDepressionLessonPage';\nimport SelfCheckLowMoodLessonPage from './views/SelfCheckLowMoodLessonPage';";
code = code.replace(/import UnderstandDepressionLessonPage from '\.\/views\/UnderstandDepressionLessonPage';/, importStr);

const routeStr = `if (currentPath === '/self-check-low-mood') {
      return (
        <SelfCheckLowMoodLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/understand-depression') {`;
code = code.replace(/if \(currentPath === '\/understand-depression'\) \{/, routeStr);

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx updated with new self-check route');
