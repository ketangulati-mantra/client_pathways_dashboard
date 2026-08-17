import fs from 'fs';
let content = fs.readFileSync('src/mantra/activities.ts', 'utf8');
content = content.replace(/service:\s*'Therapist'/g, "service: 'Therapy'");

content = content.replace(/\{([^{}]*?)\}/g, (match, inner) => {
    const serviceMatch = inner.match(/service:\s*'([^']+)'/);
    if (serviceMatch) {
        const service = serviceMatch[1].toLowerCase();
        const newInner = inner.replace(/route:\s*'\/task\/([^']+)'/, (m, id) => {
            return `route: '/${service}/${id}'`;
        });
        return '{' + newInner + '}';
    }
    return match;
});

fs.writeFileSync('src/mantra/activities.ts', content);
console.log('Done!');
