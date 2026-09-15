const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../User pathways dashboard/src/views/DeveloperLessonsPage.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

const oldGetInitialTabRegex = /const getInitialTab = \(\) => \{[\s\S]*?return 'lessons';\s*\};/;
const newGetInitialTab = `const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = (window.location.hash || '').toLowerCase();
      if (hash.includes('users') || hash.includes('management') || hash.includes('admin/users')) return 'users';
      if (hash.includes('lessons') || hash.includes('pathways') || hash.includes('admin/pathways') || hash === '#/' || hash === '' || hash === '#/admin' || hash === '#/admin/dashboard') return 'lessons';
      const savedTab = sessionStorage.getItem('mantra_active_tab');
      if (savedTab && !hash.includes('pathways')) return savedTab;
    }
    return 'lessons';
  };`;

const oldHashEffectRegex = /useEffect\(\(\) => \{\s*const handleHashChange = \(\) => \{[\s\S]*?\}, \[\]\);/;
const newHashEffect = `useEffect(() => {
    const handleHashChange = () => {
      const hash = (window.location.hash || '').toLowerCase();
      if (hash.includes('users') || hash.includes('management') || hash.includes('admin/users')) {
        setActiveTab('users');
      } else {
        setActiveTab('lessons');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);`;

content = content.replace(oldGetInitialTabRegex, newGetInitialTab);
content = content.replace(oldHashEffectRegex, newHashEffect);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated DeveloperLessonsPage.jsx tab logic');
