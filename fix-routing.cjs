const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Replace the routing implementation
const newRouting = `  const basePath = '/provider_pathways';

  const getPath = () => {
    let p = window.location.pathname;
    if (p.startsWith(basePath)) {
      p = p.slice(basePath.length) || '/';
    }
    return p;
  };

  const [currentPath, setCurrentPath] = useState(getPath());

  // Custom router state listener
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const navigate = (path) => {
    // Every internal SPA route change replaces the current entry rather
    // than pushing a new one. The SPA must never accumulate its own
    // back-stack (fallback page, /dev, lessons, etc.) — the only valid
    // Back target is whatever real external page led into the SPA.
    const fullPath = path === '/' ? basePath : (basePath + path).replace('//', '/');
    window.history.replaceState(null, '', fullPath);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`;

content = content.replace(
  /const \[currentPath, setCurrentPath\] = useState\(window\.location\.pathname\);[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*};/,
  newRouting
);

fs.writeFileSync('src/App.jsx', content);
