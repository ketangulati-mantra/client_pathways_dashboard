import app from '../backend/dist/app.js';
import { config } from '../backend/dist/config/index.js';
import { sql } from '../backend/dist/db/index.js';

const PORT = config.port || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Certificate Test server listening on port ${PORT}`);

  try {
    const testUserId = `user_elig_${Date.now()}`;
    const userName = `Dr. Alex Vance`;
    const pathwayName = `Clinical Psychology & Therapy Pathway`;

    // ── 1. Check Eligibility when not eligible ────────────────────────────────
    console.log('\n1. Checking eligibility for user with 0 completions...');
    const check1Res = await fetch(`http://localhost:${PORT}/api/certificates/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, userName, pathwayName })
    });
    const check1Json = await check1Res.json();
    console.log(`Status: ${check1Res.status} | Eligible: ${check1Json.eligible}`);
    console.log(`Message: ${check1Json.message}`);

    if (check1Json.eligible !== false) {
      throw new Error('Ineligible user test failed!');
    }

    // ── 2. Add completion record in DB & re-check eligibility ─────────────────
    console.log('\n2. Inserting completion record into Neon DB...');
    await sql`
      INSERT INTO lesson_completions (user_id, service, lesson_id, reward_points)
      VALUES (${testUserId}, 'therapy', 'intro-lesson', 10)
      ON CONFLICT DO NOTHING;
    `;

    console.log('Re-checking eligibility after completion...');
    const check2Res = await fetch(`http://localhost:${PORT}/api/certificates/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, userName, pathwayName, service: 'therapy' })
    });
    const check2Json = await check2Res.json();
    console.log(`Status: ${check2Res.status} | Eligible: ${check2Json.eligible}`);
    console.log(`Generated Certificate ID: ${check2Json.certificate?.certificate_id}`);

    if (!check2Json.eligible || !check2Json.certificate?.certificate_id) {
      throw new Error('Eligible certificate generation failed!');
    }

    const certId = check2Json.certificate.certificate_id;

    // ── 3. Test Download Endpoint ─────────────────────────────────────────────
    console.log(`\n3. Testing download endpoint for '${certId}'...`);
    const downRes = await fetch(`http://localhost:${PORT}/api/certificates/${certId}/download`);
    const downJson = await downRes.json();
    console.log(`Status: ${downRes.status} | Download URL: ${downJson.downloadUrl}`);

    if (!downJson.success || !downJson.downloadUrl) {
      throw new Error('Download certificate API failed!');
    }

    console.log('\n🎉 CERTIFICATE ELIGIBILITY & GENERATION APIS VERIFIED SUCCESSFULLY!');

  } catch (err) {
    console.error('\n❌ Certificate API Test Failed:', err);
  } finally {
    server.close(() => {
      console.log('\n✅ Test server closed.');
      process.exit(0);
    });
  }
});
