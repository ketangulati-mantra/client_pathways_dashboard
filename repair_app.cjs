const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

// Find the first sort() 
let firstSort = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('sort((a, b) => a.title.localeCompare(b.title))')) {
    firstSort = i;
    break;
  }
}

// Find the second sort()
let secondSort = -1;
for (let i = firstSort + 1; i < lines.length; i++) {
  if (lines[i].includes('sort((a, b) => a.title.localeCompare(b.title))')) {
    secondSort = i;
    break;
  }
}

// We need to keep everything up to firstSort, and then from the secondSort onwards.
// Actually, firstSort is line 68. The duplicate block starts at 69 and ends at secondSort-2 (since there is `const dashboardTasks = [...activities]` before secondSort).
// Let's just remove lines between firstSort and secondSort!
if (firstSort !== -1 && secondSort !== -1) {
  // Let's check what's just before secondSort
  console.log("firstSort:", firstSort);
  console.log("secondSort:", secondSort);
  // Before secondSort is `const dashboardTasks = [...activities]`, which is at secondSort-1
  // We want to delete from firstSort to secondSort - 2.
  lines.splice(firstSort, (secondSort - 1) - firstSort);
  fs.writeFileSync('src/App.jsx', lines.join('\n'));
  console.log("App.jsx repaired.");
} else {
  console.log("Could not find duplicate block.");
}
