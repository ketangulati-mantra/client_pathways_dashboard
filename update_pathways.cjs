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

// The file has objects like:
// {
//   lessonId: 'book-join-session',
//   activityId: '',
//   pathway: 'Client',
//   ...

// We can use a regex to match the blocks for each lessonId and replace the pathway line inside them.
// A simpler way is to split by "{" and process each object.
let newContent = content.replace(
  /\{\s*lessonId:\s*'([^']+)',([\s\S]*?)pathway:\s*'[^']+',/g,
  (match, id, middle) => {
    if (lessonIds.includes(id)) {
      console.log(\`Updating pathway for \${id} to 'Foundational Therapy'\`);
      return \`{
    lessonId: '\${id}',\${middle}pathway: 'Foundational Therapy',\`;
    }
    return match; // return unchanged if not in list
  }
);

// We should also check for ones that might have a different format, but they all should have `pathway: 'something'` because I previously replaced `service:` with `pathway:`.

fs.writeFileSync('src/mantra/activities.ts', newContent);
console.log('Update complete.');
