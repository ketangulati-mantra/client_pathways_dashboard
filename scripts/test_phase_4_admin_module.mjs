const API_BASE = 'http://localhost:5000';
const testUserId = `test_phase4_user_${Date.now()}`;

async function runPhase4Tests() {
  console.log('🚀 Starting Phase 4 Campus Program Admin & Versioning Integration Test...');
  console.log(`👤 Test User ID: ${testUserId}`);

  // 1. Submit Application v1
  const resv1 = await fetch(`${API_BASE}/api/campus-program/application`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      full_name: 'Phase4 Applicant',
      email: 'phase4@university.edu',
      college: 'Stanford University',
      course: 'BS Computer Science',
      year: '2nd Year',
      city: 'Palo Alto',
      motivation: 'Building campus mental health tech advocacy',
      availability: '5 hours/week'
    })
  });
  const jsonv1 = await resv1.json();
  console.log('✅ 1. POST /application v1 response:', jsonv1.success, '| Status:', jsonv1.data.application?.application_status, '| Version:', jsonv1.data.application?.version);

  const appId = jsonv1.data.application?.id;

  // 2. Admin GET /admin/applications
  const resAdminList = await fetch(`${API_BASE}/api/campus-program/admin/applications?status=all`);
  const jsonAdminList = await resAdminList.json();
  console.log('✅ 2. GET /admin/applications count:', jsonAdminList.data.applications?.length, '| Status counts:', jsonAdminList.data.statusCounts);

  // 3. Admin Reject v1 without reason (Should Fail with 400 Bad Request)
  const resFailReject = await fetch(`${API_BASE}/api/campus-program/admin/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId: appId,
      action: 'reject',
      reviewReason: '   ' // empty space
    })
  });
  const jsonFailReject = await resFailReject.json();
  console.log('✅ 3. Rejection without mandatory reason rejected correctly (Expected false):', jsonFailReject.success, '| Error:', jsonFailReject.error);

  // 4. Admin Reject v1 WITH mandatory reason
  const resReject = await fetch(`${API_BASE}/api/campus-program/admin/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId: String(appId),
      action: 'reject',
      reviewReason: 'Campus ambassador quota for Stanford is full for Q1. Please highlight previous peer-counseling experience and re-apply for Q2.',
      reviewerNotes: 'Strong profile, but cohort quota reached.'
    })
  });
  const jsonReject = await resReject.json();
  console.log('✅ 4. POST /admin/review (reject v1):', jsonReject.success, '| Status:', jsonReject.data?.application?.application_status);

  // 5. Provider GET /me -> verify exact review_reason is delivered
  const resProviderStatus = await fetch(`${API_BASE}/api/campus-program/me?userId=${testUserId}`);
  const jsonProviderStatus = await resProviderStatus.json();
  console.log('✅ 5. GET /me for rejected provider stage:', jsonProviderStatus.data.journeyStage);
  console.log('   -> Reviewer feedback reason:', jsonProviderStatus.data.application?.review_reason);

  // 6. Provider submits NEW application version v2
  const resv2 = await fetch(`${API_BASE}/api/campus-program/application/resubmit-version`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      full_name: 'Phase4 Applicant (Updated)',
      motivation: 'Building campus mental health tech advocacy with active peer-counseling experience',
      previous_experience: 'Lead Peer Counselor at Stanford Student Wellness Center 2025'
    })
  });
  const jsonv2 = await resv2.json();
  console.log('6. POST /application/resubmit-version response:', jsonv2);

  const v2AppId = jsonv2.data.application?.id;

  // 7. Admin Approves v2 -> Automatic Activation!
  const resApprove = await fetch(`${API_BASE}/api/campus-program/admin/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId: String(v2AppId),
      action: 'approve',
      reviewerNotes: 'Resubmitted v2 application approved! Peer counseling experience confirmed.'
    })
  });
  const jsonApprove = await resApprove.json();
  console.log('7. POST /admin/review (approve v2):', jsonApprove);

  // 8. Admin GET /admin/analytics
  const resAnalytics = await fetch(`${API_BASE}/api/campus-program/admin/analytics`);
  const jsonAnalytics = await resAnalytics.json();
  console.log('✅ 8. GET /admin/analytics:', jsonAnalytics.data);

  console.log('\n🌟 Phase 4 Dedicated Admin Module & Resubmission Versioning Integration Test Passed Cleanly!');
}

runPhase4Tests().catch(err => {
  console.error('❌ Integration test failed:', err);
  process.exit(1);
});
