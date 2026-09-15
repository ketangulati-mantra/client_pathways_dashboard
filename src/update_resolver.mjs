import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetPath = path.resolve(__dirname, '../../User pathways dashboard/src/views/viewResolver.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

if (!content.includes('EmotionalWellbeingAssessmentPage')) {
  content = content.replace(
    "import FirstTherapySessionActivity from './FirstTherapySessionActivity';",
    "import FirstTherapySessionActivity from './FirstTherapySessionActivity';\nimport EmotionalWellbeingAssessmentPage from './EmotionalWellbeingAssessmentPage';"
  );

  content = content.replace(
    "'/task/activity-02': { default: FirstTherapySessionActivity },",
    "'/task/activity-02': { default: FirstTherapySessionActivity },\n  '/task/emotional-wellbeing-assessment': { default: EmotionalWellbeingAssessmentPage },\n  '/task/emotional_wellbeing_assessment': { default: EmotionalWellbeingAssessmentPage },\n  '/emotional-wellbeing-assessment': { default: EmotionalWellbeingAssessmentPage },"
  );

  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('Successfully added EmotionalWellbeingAssessmentPage to viewResolver.jsx');
} else {
  console.log('EmotionalWellbeingAssessmentPage already in viewResolver.jsx');
}
