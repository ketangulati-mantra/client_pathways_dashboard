const fs = require('fs');

const files = [
  'src/views/BookJoinSessionLessonPage.jsx',
  'src/views/HowTherapymantraWorksLessonPage.jsx',
  'src/views/CreateWellbeingPlanLessonPage.jsx',
  'src/views/HowCanTherapyHelpLessonPage.jsx'
];

files.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');

  // Change handleQuizComplete to handleActionComplete in the destructuring
  c = c.replace(/handleQuizComplete/g, 'handleActionComplete');
  
  // Also we don't need quizDone, we need actionDone (though it's not even used in the UI, we can just replace it)
  c = c.replace(/quizDone/g, 'actionDone');
  
  // Fix the hook call arguments to explicitly use hasAction instead of hasQuiz
  if (file.includes('BookJoinSession') || file.includes('HowTherapymantraWorks')) {
    // Video lessons
    c = c.replace(/useLessonCompletion\(LESSON_ID,\s*onBack(.*?)\);/, 'useLessonCompletion(LESSON_ID, onBack, { hasVideo: true, hasAction: true, hasQuiz: false });');
  } else {
    // Text lessons
    c = c.replace(/useLessonCompletion\(LESSON_ID,\s*onBack(.*?)\);/, 'useLessonCompletion(LESSON_ID, onBack, { hasVideo: false, hasAction: true, hasQuiz: false });');
  }
  
  fs.writeFileSync(file, c);
  console.log('Fixed ' + file);
});
