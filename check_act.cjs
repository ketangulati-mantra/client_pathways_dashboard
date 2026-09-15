const fs = require('fs');

let content = fs.readFileSync('src/mantra/activities.ts', 'utf8');

// I need to see what's actually in activities.ts now
console.log(content.slice(0, 500));
