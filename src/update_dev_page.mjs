import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetPath = path.resolve(__dirname, '../../User pathways dashboard/src/views/DeveloperLessonsPage.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

const oldLaunchRegex = /const launchPathway = \([\s\S]*?\n  \};/;
const newLaunch = `const launchPathway = (act) => {
    if (!act) return;
    const targetRoute = act.route || \`/task/\${act.lessonId}\`;
    const cleanRoute = targetRoute.startsWith('/') ? targetRoute : '/' + targetRoute;
    const fullUrl = \`\${window.location.origin}\${window.location.pathname}#\${cleanRoute}\`;
    window.open(fullUrl, '_blank');
  };`;

content = content.replace(oldLaunchRegex, newLaunch);
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated launchPathway to open in new tab');
