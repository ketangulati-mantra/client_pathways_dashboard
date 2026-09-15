const fs = require('fs');

let content = fs.readFileSync('src/mantra/activities.ts', 'utf8');

const newActivity = `  {
    lessonId: 'self-check-low-mood',
    activityId: '',
    pathway: 'Depression',
    title: 'A Self-Check for Low Mood',
    rewardPoints: 100,
    estimatedDuration: '5–7 min',
    route: '/self-check-low-mood'
  },
`;

const insertIndex = content.indexOf('export const activities: Activity[] = [\n') + 'export const activities: Activity[] = [\n'.length;

let newContent = content.substring(0, insertIndex) + newActivity + content.substring(insertIndex);

fs.writeFileSync('src/mantra/activities.ts', newContent);
console.log('Added self-check-low-mood to activities.ts');
