import app from '../backend/dist/app.js';
import { config } from '../backend/dist/config/index.js';

const PORT = config.port || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Review API Test server listening on port ${PORT}`);

  try {
    // 1. Create a dummy submission
    console.log('\n1. Creating test submission for review...');
    const createRes = await fetch(`http://localhost:${PORT}/api/activity-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: `user_rev_${Date.now()}`,
        lessonId: 'profile-verification',
        activityTitle: 'Verify Your Profile',
        submissionType: 'profile_verification',
        formData: { screenshotUrl: 'https://res.cloudinary.com/demo/sample.png' }
      })
    });
    const createData = await createRes.json();
    const subId = createData.data.id;
    console.log(`Created submission ID: ${subId} | Initial Status: ${createData.data.status}`);

    // 2. Approve submission
    console.log(`\n2. Approving submission '${subId}'...`);
    const approveRes = await fetch(`http://localhost:${PORT}/api/activity-submissions/${subId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'approved',
        reviewNotes: 'Verified proof image. High resolution screenshot approved by admin.'
      })
    });
    const approveData = await approveRes.json();
    console.log(`Status code: ${approveRes.status}`);
    console.log(`Updated Status: ${approveData.data?.status}`);
    console.log(`Review Notes: ${approveData.data?.review_notes}`);

    if (!approveData.success || approveData.data?.status !== 'approved') {
      throw new Error('Approval test failed!');
    }

    // 3. Reject submission with notes
    console.log(`\n3. Rejecting submission '${subId}'...`);
    const rejectRes = await fetch(`http://localhost:${PORT}/api/activity-submissions/${subId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'rejected',
        reviewNotes: 'Image is blurry. Please re-upload a clear screenshot.'
      })
    });
    const rejectData = await rejectRes.json();
    console.log(`Status code: ${rejectRes.status}`);
    console.log(`Updated Status: ${rejectData.data?.status}`);
    console.log(`Review Notes: ${rejectData.data?.review_notes}`);

    if (!rejectData.success || rejectData.data?.status !== 'rejected') {
      throw new Error('Rejection test failed!');
    }

    // 4. Test invalid status validation
    console.log(`\n4. Testing invalid status validation...`);
    const invalidRes = await fetch(`http://localhost:${PORT}/api/activity-submissions/${subId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'invalid_status_code' })
    });
    const invalidData = await invalidRes.json();
    console.log(`Status code: ${invalidRes.status} (Expected 400)`);
    console.log(`Error message: ${invalidData.error}`);

    if (invalidRes.status !== 400 || !invalidData.error) {
      throw new Error('Invalid status validation failed!');
    }

    console.log('\n🎉 ALL REVIEW API TESTS PASSED SUCCESSFULLY!');

  } catch (err) {
    console.error('\n❌ Review API Test Failed:', err);
  } finally {
    server.close(() => {
      console.log('\n✅ Test server closed.');
      process.exit(0);
    });
  }
});
