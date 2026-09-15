const fs = require('fs');

const lessonIds = [
  'book-join-session',
  'how-therapymantra-works',
  'how-can-therapy-help',
  'emotional-wellbeing-assessment',
  'create-your-personalized-wellbeing-plan',
  'earn-while-you-improve-your-wellbeing'
];

let content = fs.readFileSync('src/mantra/activities.ts', 'utf8');

let newContent = content.replace(
  /\{\s*lessonId:\s*'([^']+)',([\s\S]*?)pathway:\s*'[^']+',/g,
  (match, id, middle) => {
    if (lessonIds.includes(id)) {
      console.log('Updating pathway for ' + id + ' to Foundational Therapy');
      return "{\n    lessonId: '" + id + "'," + middle + "pathway: 'Foundational Therapy',";
    }
    return match;
  }
);

fs.writeFileSync('src/mantra/activities.ts', newContent);
console.log('Update complete.');
