const fs = require('fs');

const videoFiles = [
  'src/views/BookJoinSessionLessonPage.jsx',
  'src/views/HowTherapymantraWorksLessonPage.jsx'
];

const textFiles = [
  'src/views/CreateWellbeingPlanLessonPage.jsx',
  'src/views/HowCanTherapyHelpLessonPage.jsx'
];

// Update video files
videoFiles.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  
  // Update button text
  c = c.replace(/I Understand – Complete Lesson/g, 'Mark as Completed');
  
  // Add disabled logic
  c = c.replace(/<Button variant="primary" onClick=\{handleQuizComplete\}/, '<Button variant="primary" disabled={!videoWatched} onClick={handleQuizComplete}');
  
  // Change button background dynamically if disabled (or Button component handles disabled natively via CSS, but just to be sure we can add a visual cue)
  c = c.replace(/background: 'var\(--color-primary\)'/, "background: videoWatched ? 'var(--color-primary)' : '#cbd5e1'");
  
  fs.writeFileSync(file, c);
  console.log('Updated video file ' + file);
});

// Update text files
textFiles.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  
  // Update button text
  c = c.replace(/I Understand – Complete Lesson/g, 'Mark as Completed');
  
  fs.writeFileSync(file, c);
  console.log('Updated text file ' + file);
});
