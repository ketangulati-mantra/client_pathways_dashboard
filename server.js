import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 80;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // Strip known subpath prefixes if present (longest prefix first with boundary check)
  const knownPrefixes = [
    '/app/content/provider_pathways',
    '/provider_activity/app/content',
    '/app/content',
    '/provider_pathways_dashboard_v3',
    '/provider_pathways_dashboard_v2',
    '/provider_pathways_dashboard_v1',
    '/provider_dashboard_v1',
    '/provider_pathways_v2_testing',
    '/provider_pathways',
    '/provider_pathway',
    '/provider_activity'
  ];

  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of knownPrefixes) {
      if (reqPath === prefix || reqPath.startsWith(prefix + '/')) {
        reqPath = reqPath.slice(prefix.length) || '/';
        changed = true;
        break;
      }
    }
  }

  let filePath = path.join(DIST_DIR, reqPath === '/' ? 'index.html' : reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const ext = path.extname(reqPath).toLowerCase();
      if (ext && MIME_TYPES[ext]) {
        const filename = path.basename(reqPath);
        const inAssets = path.join(DIST_DIR, 'assets', filename);
        const inDist = path.join(DIST_DIR, filename);

        if (fs.existsSync(inAssets)) {
          filePath = inAssets;
        } else if (fs.existsSync(inDist)) {
          filePath = inDist;
        } else if (filename.startsWith('index-') && filename.endsWith('.js')) {
          const assetsDir = path.join(DIST_DIR, 'assets');
          if (fs.existsSync(assetsDir)) {
            const assetsFiles = fs.readdirSync(assetsDir);
            const latestMainJs = assetsFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
            if (latestMainJs) {
              filePath = path.join(assetsDir, latestMainJs);
            } else {
              filePath = path.join(DIST_DIR, 'index.html');
            }
          } else {
            filePath = path.join(DIST_DIR, 'index.html');
          }
        } else {
          filePath = path.join(DIST_DIR, 'index.html');
        }
      } else {
        // Fallback to index.html for SPA client-side routing
        filePath = path.join(DIST_DIR, 'index.html');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      const headers = { 'Content-Type': contentType };
      if (filePath.endsWith('index.html')) {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }
      res.writeHead(200, headers);
      res.end(content, 'utf-8');
    });
  });
});

server.listen(PORT, () => {
  console.log(`Provider Pathways subpath server running on port ${PORT} at /provider_pathways`);
});
