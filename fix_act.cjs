const fs = require('fs');

let content = fs.readFileSync('src/mantra/activities.ts', 'utf8');

// The file currently starts with:
// /**
// ...
//   estimatedDuration: string;
//     rewardPoints: 10,
// ...

const fixedStart = `/**
 * Registered Lesson Activities Config
 * Single source of truth for all lesson pathways, point systems, routes, and identifiers.
 */
export interface Activity {
  lessonId: string;
  activityId: string;
  title: string;
  rewardPoints: number;
  estimatedDuration: string;
  route: string;
  completionEndpoint?: string;
  redirectAfterCompletion?: boolean;
  pathway?: string;
}

export const activities: Activity[] = [
  {
    lessonId: 'understand-depression',
    activityId: '',
    pathway: 'Depression',
    title: 'Understand What is Depression?',
    rewardPoints: 50,
    estimatedDuration: '4 min',
    route: '/understand-depression'
  },
  {
    lessonId: 'book-join-session',
    activityId: '', // Filled in during backend integration
    pathway: 'Foundational Therapy',
    title: 'How to Book & Join a Session',
`;

// Find where "    rewardPoints: 10," occurs for the first time
const splitIndex = content.indexOf("    rewardPoints: 10,");

let fixedContent = fixedStart + content.substring(splitIndex);

fs.writeFileSync('src/mantra/activities.ts', fixedContent);
console.log('Fixed activities.ts');
