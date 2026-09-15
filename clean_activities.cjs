const fs = require('fs');

const keepIds = [
  'book-join-session',
  'how-therapymantra-works',
  'create-your-personalized-wellbeing-plan',
  'how-can-therapy-help',
  'emotional-wellbeing-assessment',
  'earn-while-you-improve-your-wellbeing',
  'understand-depression',
  'self-check-low-mood'
];

let content = fs.readFileSync('src/mantra/activities.ts', 'utf8');

const startToken = 'export const activities: Activity[] = [';
const startIndex = content.indexOf(startToken);

if (startIndex === -1) {
  console.error("Could not find start token");
  process.exit(1);
}

const header = content.substring(0, startIndex + startToken.length);
const arrayContent = content.substring(startIndex + startToken.length);

const blocks = [];
let currentBlock = "";
let bracketCount = 0;

for (let i = 0; i < arrayContent.length; i++) {
  const char = arrayContent[i];
  currentBlock += char;
  
  if (char === '{') {
    bracketCount++;
  } else if (char === '}') {
    bracketCount--;
    if (bracketCount === 0) {
      blocks.push(currentBlock.trim());
      currentBlock = "";
    }
  }
}

const filteredBlocks = blocks.filter(block => {
  return keepIds.some(id => block.includes("lessonId: '" + id + "'"));
});

const newArrayContent = '\n  ' + filteredBlocks.join(',\n  ') + '\n];\n';

fs.writeFileSync('src/mantra/activities.ts', header + newArrayContent);
console.log('activities.ts cleaned successfully! Kept ' + filteredBlocks.length + ' activities.');
