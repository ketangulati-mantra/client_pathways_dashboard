const fs = require('fs');

// 1. Update index.css
let indexCss = fs.readFileSync('src/index.css', 'utf8');

const typographyTokens = `  /* Typography & Spacing Tokens */
  --text-h1: clamp(1.5rem, 4vw, 2rem);
  --text-h2: clamp(1.25rem, 3.5vw, 1.5rem);
  --text-h3: clamp(1.125rem, 3vw, 1.25rem);
  --text-body: 1rem;
  --text-sm: 0.875rem;
  
  --spacing-section: 24px;
  --spacing-card-p: 16px;`;

indexCss = indexCss.replace(/\/\* Layout and Spacing \*\//, typographyTokens + '\n\n  /* Layout and Spacing */');
fs.writeFileSync('src/index.css', indexCss);

// 2. Update components.css
let compCss = fs.readFileSync('src/components/components.css', 'utf8');

// Compress Header
compCss = compCss.replace(/padding:\s*12px\s+24px\s+16px;/, 'padding: 12px 16px;'); // main padding
compCss = compCss.replace(/\.academy-header-top\s*\{[\s\S]*?\}/, `.academy-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}`);
compCss = compCss.replace(/\.academy-header-logo img\s*\{\s*height:\s*24px;\s*\}/, `.academy-header-logo img { height: 20px; }`);
compCss = compCss.replace(/\.academy-header-title\s*\{[\s\S]*?\}/, `.academy-header-title {
  font-size: var(--text-h3);
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  line-height: 1.2;
}`);

// Compress Buttons
compCss = compCss.replace(/\.btn-academy\s*\{[\s\S]*?\}/, `.btn-academy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
}`);

// Compress Cards
compCss = compCss.replace(/\.academy-card\s*\{[\s\S]*?\}/, `.academy-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-card-p);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}`);

compCss = compCss.replace(/\.academy-main-container\s*\{[\s\S]*?\}/, `.academy-main-container {
  padding: var(--spacing-section) 16px 48px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-section);
}`);

// Compress info cards
compCss = compCss.replace(/\.info-card-title\s*\{[\s\S]*?\}/, `.info-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}`);

fs.writeFileSync('src/components/components.css', compCss);

// 3. Update AssessmentQuestionCard.jsx
let qCard = fs.readFileSync('src/components/assessment/AssessmentQuestionCard.jsx', 'utf8');

qCard = qCard.replace(/marginBottom:\s*'32px'/g, "marginBottom: '16px'");
qCard = qCard.replace(/padding:\s*'20px'/g, "padding: '12px 16px'");
qCard = qCard.replace(/fontSize:\s*'1\.75rem'/g, "fontSize: 'var(--text-h2)'");
qCard = qCard.replace(/fontSize:\s*'1\.15rem'/g, "fontSize: '1rem'");
qCard = qCard.replace(/marginTop:\s*'40px'/g, "marginTop: '24px'");
qCard = qCard.replace(/padding:\s*'12px\s*24px'/g, "padding: '8px 20px'");
qCard = qCard.replace(/padding:\s*'12px\s*32px'/g, "padding: '8px 24px'");
qCard = qCard.replace(/fontSize:\s*'1\.05rem'/g, "fontSize: '0.95rem'");

fs.writeFileSync('src/components/assessment/AssessmentQuestionCard.jsx', qCard);

// 4. Update AssessmentReport.jsx
let repCard = fs.readFileSync('src/components/assessment/AssessmentReport.jsx', 'utf8');

repCard = repCard.replace(/padding:\s*'24px'/g, "padding: '16px'");
repCard = repCard.replace(/marginBottom:\s*'24px'/g, "marginBottom: '16px'");
repCard = repCard.replace(/fontSize:\s*'1\.25rem'/g, "fontSize: '1.1rem'");
repCard = repCard.replace(/fontSize:\s*'2\.2rem'/g, "fontSize: 'var(--text-h1)'");
repCard = repCard.replace(/marginBottom:\s*'40px'/g, "marginBottom: '24px'");
repCard = repCard.replace(/marginTop:\s*'40px'/g, "marginTop: '24px'");
repCard = repCard.replace(/padding:\s*'32px'/g, "padding: '24px'");
repCard = repCard.replace(/fontSize:\s*'1\.5rem'/g, "fontSize: 'var(--text-h2)'");
repCard = repCard.replace(/fontSize:\s*'1\.1rem'/g, "fontSize: '0.95rem'");
repCard = repCard.replace(/padding:\s*'16px\s*32px'/g, "padding: '12px 24px'");
repCard = repCard.replace(/size=\{32\}/g, "size={24}");
repCard = repCard.replace(/width:\s*'64px',\s*height:\s*'64px'/g, "width: '48px', height: '48px'");

fs.writeFileSync('src/components/assessment/AssessmentReport.jsx', repCard);

console.log("Global UI Compression Complete.");
