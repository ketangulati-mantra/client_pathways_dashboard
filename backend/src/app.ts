import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import healthRoutes from './routes/health.js';
import userRoutes from './routes/userRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import reviewerRoutes from './routes/reviewerRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// API Routes & Health Checks
const apiPrefixes = [
  '/api',
  '/client_tasks/api',
  '/user_pathways/api',
  '/provider_pathways/api',
  '/provider_activity/api'
];

apiPrefixes.forEach((prefix) => {
  app.use(prefix, healthRoutes);
  app.use(prefix, submissionRoutes);
  app.use(prefix, uploadRoutes);
  app.use(prefix, certificateRoutes);
  app.use(`${prefix}/admin/auth`, adminAuthRoutes);
  app.use(`${prefix}/admin/users`, adminUserRoutes);
  app.use(`${prefix}/admin/reviewers`, reviewerRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/activities`, activityRoutes);
});

// Serve Frontend Static Assets in Production (supporting root and subpaths)
const distPath = path.join(__dirname, '../../dist');

// Direct static file serving for root and subpaths
app.use(express.static(distPath));
app.use('/assets', express.static(path.join(distPath, 'assets')));

const subpaths = [
  '/client_tasks',
  '/client-tasks',
  '/app/content/provider_pathways',
  '/provider_activity/app/content',
  '/app/content',
  '/provider_pathways_dashboard_v3',
  '/provider_pathways_dashboard_v2',
  '/provider_dashboard_v1',
  '/provider_pathways_dashboard_v1',
  '/provider_pathways_v2_testing',
  '/provider_pathways',
  '/provider_pathway',
  '/provider_activity'
];

subpaths.forEach((subpath) => {
  app.use(`${subpath}/assets`, express.static(path.join(distPath, 'assets')));
  app.use(subpath, express.static(distPath));
});

import fs from 'fs';

// Fallback to index.html for SPA routing (only if not requesting a file with extension)
app.get('*', (req, res, next) => {
  if (req.path.includes('/api/')) return next();
  
  // If request has a file extension (e.g. .js, .css, .png) and reached here, attempt smart fallback from dist/assets
  if (/\.[a-zA-Z0-9]+$/.test(req.path)) {
    const filename = path.basename(req.path);
    const inAssets = path.join(distPath, 'assets', filename);
    const inDist = path.join(distPath, filename);

    if (fs.existsSync(inAssets)) {
      return res.sendFile(inAssets);
    } else if (fs.existsSync(inDist)) {
      return res.sendFile(inDist);
    }

    // Smart Fallback: If an old build bundle JS file is requested, serve the latest index-*.js entry bundle
    if (filename.startsWith('index-') && filename.endsWith('.js')) {
      const assetsDir = path.join(distPath, 'assets');
      if (fs.existsSync(assetsDir)) {
        const assetsFiles = fs.readdirSync(assetsDir);
        const latestMainJs = assetsFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
        if (latestMainJs) {
          return res.sendFile(path.join(assetsDir, latestMainJs));
        }
      }
    }

    return res.status(404).send('Asset not found');
  }

  // Prevent browser caching for SPA index.html to guarantee instant updates on new deployments
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Error Middleware
app.use(errorHandler);

export default app;
