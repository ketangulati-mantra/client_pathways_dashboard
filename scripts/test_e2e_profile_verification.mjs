import app from '../backend/dist/app.js';
import { config } from '../backend/dist/config/index.js';
import { sql } from '../backend/dist/db/index.js';

const PORT = config.port || 5000;

// Sample transparent PNG buffer representing uploaded profile screenshot
const SAMPLE_SCREENSHOT = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const server = app.listen(PORT, async () => {
  console.log(`🚀 End-To-End Test server listening on port ${PORT}`);

  try {
    const testUserId = `prov_e2e_${Date.now()}`;
    const testUpaId = `upa_98765`;
    const testUid = `uid_12345`;

    // ── Step 1: Upload Screenshot to Cloudinary ──────────────────────────────
    console.log('\nStep 1: Uploading screenshot proof to Cloudinary...');
    const uploadFormData = new FormData();
    const blob = new Blob([SAMPLE_SCREENSHOT], { type: 'image/png' });
    uploadFormData.append('file', blob, 'profile_verification_proof.png');
    uploadFormData.append('folder', 'provider_verification_e2e');

    const uploadRes = await fetch(`http://localhost:${PORT}/api/uploads`, {
      method: 'POST',
      body: uploadFormData,
    });
    const uploadJson = await uploadRes.json();
    console.log(`Upload Response Status: ${uploadRes.status}`);
    console.log(`Cloudinary Secure URL: ${uploadJson.data?.secure_url}`);

    if (!uploadJson.success || !uploadJson.data?.secure_url) {
      throw new Error('Cloudinary upload step failed!');
    }

    const screenshotUrl = uploadJson.data.secure_url;
    const publicId = uploadJson.data.public_id;

    // ── Step 2: Submit Activity Form to Neon Backend ─────────────────────────
    console.log('\nStep 2: Submitting Profile Verification Activity to Backend...');
    const submissionBody = {
      userId: testUserId,
      lessonId: 'profile-verification',
      activityTitle: 'Verify Your Profile',
      submissionType: 'profile_verification',
      service: 'therapy',
      providerUid: testUid,
      upaId: testUpaId,
      formData: {
        screenshotUrl,
        publicId,
        fileName: 'profile_verification_proof.png',
        fileSize: 70,
        fileType: 'image/png',
        uploadedAt: new Date().toISOString()
      }
    };

    const subRes = await fetch(`http://localhost:${PORT}/api/activity-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionBody)
    });
    const subJson = await subRes.json();
    console.log(`Submission Response Status: ${subRes.status}`);
    console.log(JSON.stringify(subJson, null, 2));

    if (!subJson.success) {
      throw new Error('Activity submission step failed!');
    }

    // ── Step 3: Database Verification in Neon PostgreSQL ─────────────────────
    console.log('\nStep 3: Querying Neon PostgreSQL to verify record persistence...');
    const rows = await sql`
      SELECT * FROM activity_submissions 
      WHERE user_id = ${testUserId} AND lesson_id = 'profile-verification';
    `;

    console.log(`Found ${rows.length} record(s) in Neon PostgreSQL database.`);
    if (rows.length > 0) {
      const rec = rows[0];
      console.log(`Record ID: ${rec.id}`);
      console.log(`User ID: ${rec.user_id}`);
      console.log(`Lesson ID: ${rec.lesson_id}`);
      console.log(`Activity Title: ${rec.activity_title}`);
      console.log(`Submission Data:`, rec.submission_data);
      console.log(`Created At: ${rec.created_at}`);

      console.log('\n🎉 COMPLETE END-TO-END FLOW VERIFIED SUCCESSFULLY!');
    } else {
      throw new Error('No record found in Neon DB!');
    }

  } catch (err) {
    console.error('\n❌ End-To-End Test Failed:', err);
  } finally {
    server.close(() => {
      console.log('\n✅ E2E test server closed cleanly.');
      process.exit(0);
    });
  }
});
