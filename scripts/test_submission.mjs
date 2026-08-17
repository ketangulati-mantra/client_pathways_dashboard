import app from '../backend/dist/app.js';
import { config } from '../backend/dist/config/index.js';

const PORT = config.port || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Test server started on port ${PORT}`);

  try {
    // 1. Test POST /api/activity-submissions (VALID)
    const validBody = {
      userId: "user_prov_101",
      lessonId: "campus-awareness",
      activityTitle: "Campus Ambassador Program",
      submissionType: "interest_form",
      submissionData: {
        interested: true,
        college: "Stanford University",
        comments: "Looking forward to starting this initiative!"
      }
    };

    const resValid = await fetch(`http://localhost:${PORT}/api/activity-submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody)
    });
    const dataValid = await resValid.json();
    console.log(`\n1. Valid submission status (${resValid.status}):`);
    console.log(JSON.stringify(dataValid, null, 2));

    // 2. Test POST /api/activity-submissions (INVALID / MISSING REQUIRED FIELDS)
    const invalidBody = {
      userId: "user_prov_101",
      // missing lessonId, activityTitle, submissionType
    };

    const resInvalid = await fetch(`http://localhost:${PORT}/api/activity-submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidBody)
    });
    const dataInvalid = await resInvalid.json();
    console.log(`\n2. Invalid submission status (${resInvalid.status}):`);
    console.log(JSON.stringify(dataInvalid, null, 2));

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    server.close(() => {
      console.log("\n✅ Submission API test completed cleanly.");
      process.exit(0);
    });
  }
});
