const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

const importStr = "import LessonTemplate from './views/LessonTemplate';\nimport UnderstandDepressionLessonPage from './views/UnderstandDepressionLessonPage';";
code = code.replace(/import LessonTemplate from '\.\/views\/LessonTemplate';/, importStr);

const routeStr = `if (currentPath === '/understand-depression') {
      return (
        <UnderstandDepressionLessonPage
          onBack={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/book-join-session') {`;
code = code.replace(/if \(currentPath === '\/book-join-session'\) \{/, routeStr);

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx updated with new route');
