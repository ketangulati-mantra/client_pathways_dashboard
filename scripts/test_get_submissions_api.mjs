import app from '../backend/dist/app.js';
import { config } from '../backend/dist/config/index.js';

const PORT = config.port || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Test server listening on port ${PORT}`);

  try {
    // ── Test 1: GET /api/activity-submissions (List & Pagination) ─────────────
    console.log('\nTesting GET /api/activity-submissions?page=1&limit=5...');
    const res1 = await fetch(`http://localhost:${PORT}/api/activity-submissions?page=1&limit=5`);
    const json1 = await res1.json();
    console.log(`Status: ${res1.status}`);
    console.log(`Returned records count: ${json1.data?.length}`);
    console.log(`Pagination info:`, json1.pagination);

    if (!json1.success || !Array.isArray(json1.data) || !json1.pagination) {
      throw new Error('GET /api/activity-submissions failed!');
    }

    const firstItem = json1.data[0];

    // ── Test 2: GET /api/activity-submissions/:id ───────────────────────────
    if (firstItem && firstItem.id) {
      console.log(`\nTesting GET /api/activity-submissions/${firstItem.id}...`);
      const res2 = await fetch(`http://localhost:${PORT}/api/activity-submissions/${firstItem.id}`);
      const json2 = await res2.json();
      console.log(`Status: ${res2.status}`);
      console.log(`Retrieved submission ID: ${json2.data?.id}`);
      console.log(`Activity Title: ${json2.data?.activity_title}`);

      if (!json2.success || json2.data?.id !== firstItem.id) {
        throw new Error('GET /api/activity-submissions/:id failed!');
      }
    }

    // ── Test 3: GET /api/activity-submissions/user/:providerUid ──────────────
    if (firstItem && firstItem.user_id) {
      console.log(`\nTesting GET /api/activity-submissions/user/${firstItem.user_id}...`);
      const res3 = await fetch(`http://localhost:${PORT}/api/activity-submissions/user/${firstItem.user_id}`);
      const json3 = await res3.json();
      console.log(`Status: ${res3.status}`);
      console.log(`Submissions found for user '${firstItem.user_id}': ${json3.data?.length}`);

      if (!json3.success || !Array.isArray(json3.data)) {
        throw new Error('GET /api/activity-submissions/user/:providerUid failed!');
      }
    }

    console.log('\n🎉 ALL GET ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!');

  } catch (err) {
    console.error('\n❌ GET API Test Failed:', err);
  } finally {
    server.close(() => {
      console.log('\n✅ Test server closed.');
      process.exit(0);
    });
  }
});
