const fs = require('fs');
const files = [
  'src/views/BookJoinSessionLessonPage.jsx',
  'src/views/HowTherapymantraWorksLessonPage.jsx',
  'src/views/CreateWellbeingPlanLessonPage.jsx',
  'src/views/HowCanTherapyHelpLessonPage.jsx'
];

files.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  
  // The first run turned the QuizCard into `<id={LESSON_ID} ... />` because we did a global replace on `QuizCard`.
  // We need to match the mangled `<id={LESSON_ID}.../>` block and replace it with our button.
  
  const buttonJSX = `<div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Button variant="primary" onClick={handleQuizComplete} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white' }}>
              <CheckCircle2 size={18} />
              <span>I Understand – Complete Lesson</span>
            </Button>
          </div>`;
          
  // Match the broken tag: `<id={LESSON_ID}... />`
  c = c.replace(/<id=\{LESSON_ID\}[\s\S]*?\/>/g, buttonJSX);
  
  // Fix the "Quiz Section" comment to "Completion Section"
  c = c.replace(/{\/\* Quiz Section \*\/}/g, '{/* Completion Section */}');
  
  fs.writeFileSync(file, c);
  console.log('Fixed ' + file);
});
