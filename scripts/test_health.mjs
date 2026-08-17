import app from '../backend/dist/app.js';
import { config } from '../backend/dist/config/index.js';

const PORT = config.port || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Test server started on port ${PORT}`);

  try {
    // 1. Test GET /api/health
    const resHealth = await fetch(`http://localhost:${PORT}/api/health`);
    const dataHealth = await resHealth.json();
    console.log('\n1. GET /api/health response:');
    console.log(JSON.stringify(dataHealth, null, 2));

    // 2. Test GET /api/health/db
    const resDb = await fetch(`http://localhost:${PORT}/api/health/db`);
    const dataDb = await resDb.json();
    console.log('\n2. GET /api/health/db response:');
    console.log(JSON.stringify(dataDb, null, 2));

    // 3. Test POST /api/health/db-write
    const resWrite = await fetch(`http://localhost:${PORT}/api/health/db-write`, { method: 'POST' });
    const dataWrite = await resWrite.json();
    console.log('\n3. POST /api/health/db-write response:');
    console.log(JSON.stringify(dataWrite, null, 2));

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close(() => {
      console.log('\n✅ Health check test server closed cleanly.');
      process.exit(0);
    });
  }
});
