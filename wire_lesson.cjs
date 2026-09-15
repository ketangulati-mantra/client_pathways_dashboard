const fs = require('fs');

// 1. Update App.jsx
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Insert import if not exists
if (!app.includes('EarnWhileYouImproveLessonPage')) {
  app = app.replace(/import InsuranceLessonPage from '\.\/views\/InsuranceLessonPage';/, 
    "import InsuranceLessonPage from './views/InsuranceLessonPage';\nimport EarnWhileYouImproveLessonPage from './views/EarnWhileYouImproveLessonPage';");
  
  // Insert route
  const routeContent = `
    if (currentPath === '/earn-while-you-improve-your-wellbeing') {
      return (
        <EarnWhileYouImproveLessonPage
          onBack={() => navigate('/')}
        />
      );
    }
`;
  app = app.replace(/if \(currentPath === '\/earn-points'\) \{/, routeContent + '\n    if (currentPath === \'/earn-points\') {');
  fs.writeFileSync('src/App.jsx', app);
  console.log('App.jsx updated');
}

// 2. Update activities.ts
let activities = fs.readFileSync('src/mantra/activities.ts', 'utf8');
if (!activities.includes('earn-while-you-improve-your-wellbeing')) {
  const newActivity = `  {
    lessonId: 'earn-while-you-improve-your-wellbeing',
    activityId: '',
    service: 'Therapy',
    title: 'Earn While You Improve Your Wellbeing',
    rewardPoints: 50,
    estimatedDuration: '2 min',
    route: '/earn-while-you-improve-your-wellbeing'
  },`;
  activities = activities.replace(/];\s*$/, newActivity + '\n];\n');
  fs.writeFileSync('src/mantra/activities.ts', activities);
  console.log('activities.ts updated');
}
