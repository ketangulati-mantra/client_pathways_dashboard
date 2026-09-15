const fs = require('fs');
const files = [
  'src/views/BookJoinSessionLessonPage.jsx',
  'src/views/HowTherapymantraWorksLessonPage.jsx',
  'src/views/CreateWellbeingPlanLessonPage.jsx',
  'src/views/HowCanTherapyHelpLessonPage.jsx'
];

files.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  
  // Remove QUIZ_QUESTIONS
  c = c.replace(/const QUIZ_QUESTIONS = \[\s*\{[\s\S]*?\];\s*/, '');
  
  // Remove QuizCard from imports
  c = c.replace(/QuizCard,?\s*/g, '');
  
  // Replace <QuizCard /> with the completion button
  const buttonJSX = `<div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Button variant="primary" onClick={handleQuizComplete} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white' }}>
              <CheckCircle2 size={18} />
              <span>I Understand – Complete Lesson</span>
            </Button>
          </div>`;
  c = c.replace(/<QuizCard[\s\S]*?\/>/g, buttonJSX);
  
  // Make sure Button is imported
  if (!c.includes('Button,')) {
    c = c.replace(/CompletionScreen,/, 'Button,\n  CompletionScreen,');
  }
  
  // Make sure CheckCircle2 is imported
  if (!c.includes('CheckCircle2')) {
    c = c.replace(/import \{ useLessonCompletion \} from '\.\.\/hooks\/useLessonCompletion';/, "import { useLessonCompletion } from '../hooks/useLessonCompletion';\nimport { CheckCircle2 } from 'lucide-react';");
  }
  
  // Change hasQuiz to false and remove hasQuiz line if true (to reflect the new logic if needed, but the user said "only remove quizzes", and we are keeping handleQuizComplete for simplicity as it triggers the backend hook)
  c = c.replace(/hasQuiz:\s*true,?/g, 'hasQuiz: false,');
  
  fs.writeFileSync(file, c);
  console.log('Updated ' + file);
});
