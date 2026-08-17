const fs = require('fs');
const path = require('path');

const files = [
  'TherapyInternProgramLessonPage.jsx',
  'MarketYourselfLessonPage.jsx',
  'ShareLinkedinLessonPage.jsx',
  'ShowAchievementsLessonPage.jsx'
];

const dir = 'c:/Users/Mantra/Desktop/Provider Pathways/src/views';

files.forEach(f => {
  const filepath = path.join(dir, f);
  let content = fs.readFileSync(filepath, 'utf8');
  
  if (!content.includes('isValidEmail')) {
    content = content.replace(
      "import { completeLesson",
      "import { isValidEmail, isValidIndianPhone } from '../mantra/validation';\nimport { completeLesson"
    );
  }
  
  if (!content.includes('useToast')) {
    content = content.replace(
      "import { Header, CompletionScreen, Button } from '../components';",
      "import { Header, CompletionScreen, Button, useToast } from '../components';"
    );
  }

  const componentName = f.replace('.jsx', '');
  const searchStr = `export default function ${componentName}({ onBack }) {`;
  const insertStr = `\n  const { showToast } = useToast();
  const emailRef = useRef(null);
  const phoneRef = useRef(null);

  const validateEmail = () => {
    if (!emailRef.current) return true;
    if (!isValidEmail(emailRef.current.value)) {
      showToast('Please enter a valid email address.', 'warning');
      emailRef.current.focus();
      return false;
    }
    return true;
  };

  const validatePhone = () => {
    if (!phoneRef.current) return true;
    if (!isValidIndianPhone(phoneRef.current.value)) {
      showToast('Please enter a valid mobile number.', 'warning');
      phoneRef.current.focus();
      return false;
    }
    return true;
  };
`;
  if (!content.includes('validateEmail')) {
    content = content.replace(searchStr, searchStr + insertStr);
  }

  content = content.replace(
    /<input type="email" placeholder="Email Address"/g,
    '<input type="email" ref={emailRef} onBlur={validateEmail} placeholder="Email Address"'
  );
  
  content = content.replace(
    /<input type="tel" placeholder="Phone Number"/g,
    '<input type="tel" ref={phoneRef} onBlur={validatePhone} placeholder="Phone Number"'
  );

  const submitStr = 'const handleSubmit = (e) => {\n    e.preventDefault();';
  const submitInsert = `\n    if (!validateEmail()) return;\n    if (phoneRef.current && !validatePhone()) return;`;
  
  if (content.includes(submitStr) && !content.includes('!validateEmail()')) {
    content = content.replace(submitStr, submitStr + submitInsert);
  }
  
  if (!content.includes('useRef')) {
    content = content.replace('useState, useEffect', 'useState, useEffect, useRef');
  }

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Processed', f);
});
