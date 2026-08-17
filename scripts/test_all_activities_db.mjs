import app from '../backend/dist/app.js';
import { config } from '../backend/dist/config/index.js';
import { sql } from '../backend/dist/db/index.js';

const PORT = config.port || 5000;

const TEST_ACTIVITIES = [
  {
    lessonId: 'profile-verification',
    activityTitle: 'Verify Your Profile',
    submissionType: 'profile_verification',
    formData: { screenshotUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', fileName: 'proof.png' }
  },
  {
    lessonId: 'show-achievements',
    activityTitle: 'Showcase Your Achievements',
    submissionType: 'show_achievements_proof',
    formData: { screenshotUrl: 'https://res.cloudinary.com/demo/image/upload/cert.png', title: 'Award' }
  },
  {
    lessonId: 'share-linkedin',
    activityTitle: 'Share on LinkedIn',
    submissionType: 'share_linkedin_proof',
    formData: { postUrl: 'https://linkedin.com/posts/12345', screenshotUrl: 'https://res.cloudinary.com/demo/image/upload/linkedin.png' }
  },
  {
    lessonId: 'fundraising',
    activityTitle: 'Fund Raising for Mantra Foundation',
    submissionType: 'fundraising_pledge',
    formData: { initiative: 'Fund Raising', fullName: 'Test User', email: 'test@example.com', phone: '+1234567890' }
  },
  {
    lessonId: 'sales-partner',
    activityTitle: 'Become a Sales Partner',
    submissionType: 'sales_partner_application',
    formData: { fullName: 'Sales User', email: 'sales@example.com', knowsOrganizations: 'Yes', reasonToJoin: 'Great network' }
  },
  {
    lessonId: 'yoga-market-profile',
    activityTitle: 'Market Your Yoga Profile',
    submissionType: 'yoga_market_profile_proof',
    formData: { screenshotUrl: 'https://res.cloudinary.com/demo/image/upload/yoga.jpg' }
  },
  {
    lessonId: 'recruit-interns',
    activityTitle: 'Recruit Interns',
    submissionType: 'recruit_interns_proof',
    formData: { referralName: 'John Doe', referralEmail: 'john@intern.com' }
  },
  {
    lessonId: 'community-management',
    activityTitle: 'Community Management',
    submissionType: 'community_management_proof',
    formData: { screenshotUrl: 'https://res.cloudinary.com/demo/image/upload/community.png' }
  },
  {
    lessonId: 'content-creation',
    activityTitle: 'Content Creation Initiative',
    submissionType: 'content_creation_proof',
    formData: { screenshotUrl: 'https://res.cloudinary.com/demo/image/upload/content.png' }
  }
];

const server = app.listen(PORT, async () => {
  console.log(`🚀 Verification test server running on port ${PORT}`);

  try {
    const testUserId = `test_phase6_${Date.now()}`;
    console.log(`Testing all ${TEST_ACTIVITIES.length} form activities for user: ${testUserId}\n`);

    for (const act of TEST_ACTIVITIES) {
      const res = await fetch(`http://localhost:${PORT}/api/activity-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: testUserId,
          lessonId: act.lessonId,
          activityTitle: act.activityTitle,
          submissionType: act.submissionType,
          formData: act.formData
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(`Failed to submit activity '${act.lessonId}': ${data.error}`);
      }
      console.log(`✅ Submitted: ${act.activityTitle} (${act.lessonId}) -> ID: ${data.data.id}`);
    }

    console.log('\nQuerying Neon PostgreSQL database to verify all records...');
    const rows = await sql`
      SELECT * FROM activity_submissions WHERE user_id = ${testUserId} ORDER BY created_at ASC;
    `;

    console.log(`\nFound ${rows.length} stored record(s) in Neon PostgreSQL database for user ${testUserId}:`);
    rows.forEach((r, idx) => {
      console.log(` ${idx + 1}. [${r.lesson_id}] "${r.activity_title}" -> Type: ${r.submission_type} | Data keys: ${Object.keys(r.submission_data || {}).join(', ')}`);
    });

    if (rows.length === TEST_ACTIVITIES.length) {
      console.log('\n🎉 ALL FORM ACTIVITIES VERIFIED IN NEON POSTGRESQL DB SUCCESSFULLY!');
    } else {
      throw new Error(`Expected ${TEST_ACTIVITIES.length} rows in DB, but found ${rows.length}`);
    }

  } catch (err) {
    console.error('\n❌ Activity Verification Error:', err);
  } finally {
    server.close(() => {
      console.log('\n✅ Verification test server closed.');
      process.exit(0);
    });
  }
});
