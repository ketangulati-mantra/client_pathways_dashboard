const fs = require('fs');
const lines = fs.readFileSync('src/mantra/activities.ts', 'utf8').split('\n');
// We need to keep lines 0 to 367 (which is up to line 368 in 1-indexed)
// And lines 563 to the end (which is line 564 in 1-indexed)
const newLines = [...lines.slice(0, 368), ...lines.slice(563)];
fs.writeFileSync('src/mantra/activities.ts', newLines.join('\n'));
console.log('Fixed array duplication in activities.ts');
