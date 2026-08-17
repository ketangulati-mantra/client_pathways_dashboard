import app from './app.js';
import { config } from './config/index.js';
import { setupDb } from './utils/setupDb.js';

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception caught to keep server alive:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = config.port;

// Automatically verify and initialize Neon DB tables on boot
setupDb()
  .then(() => console.log('✅ Neon DB Schema & Tables verified successfully'))
  .catch((err) => console.error('⚠️ DB Setup Warning:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Provider Pathways Backend server running on port ${PORT} (0.0.0.0)`);
});
