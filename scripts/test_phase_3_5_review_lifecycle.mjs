const API_BASE = 'http://localhost:5000';
const testUserId = `test_phase35_user_${Date.now()}`;

async function runTests() {
  console.log('🚀 Starting Phase 3.5 Application Review & Activation Integration Test...');
  console.log(`👤 Test User ID: ${testUserId}`);

  // 1. Initial status query
  const res1 = await fetch(`${API_BASE}/api/campus-program/me?userId=${testUserId}`);
  const json1 = await res1.json();
  console.log('GET /me response:', json1);

  // 2. Submit Application
  const resApp = await fetch(`${API_BASE}/api/campus-program/application`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      full_name: 'Test Ambassador Candidate',
      email: 'candidate@university.edu',
      college: 'Harvard University',
      course: 'BS Psychology',
      year: '3rd Year',
      city: 'Boston',
      motivation: 'Passionate about student mental health advocacy',
      availability: '3-5 hours/week'
    })
  });
  const jsonApp = await resApp.json();
  console.log('✅ POST /application response:', jsonApp.success, '| Status:', jsonApp.data?.application?.application_status);

  // 3. GET /application-status
  const resStatus = await fetch(`${API_BASE}/api/campus-program/application-status?userId=${testUserId}`);
  const jsonStatus = await resStatus.json();
  console.log('✅ GET /application-status response:', jsonStatus.success, '| Status:', jsonStatus.data?.application?.application_status);

  // 4. GET /timeline
  const resTimeline = await fetch(`${API_BASE}/api/campus-program/timeline?userId=${testUserId}`);
  const jsonTimeline = await resTimeline.json();
  console.log('✅ GET /timeline response:', jsonTimeline.success, '| Timeline items count:', jsonTimeline.data?.length);

  // 5. PATCH /application -> request more info
  const resReqInfo = await fetch(`${API_BASE}/api/campus-program/application`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      status: 'more_info_required',
      reviewerNotes: 'Please clarify your weekly availability hours and campus club leadership role.',
      requestedFields: ['availability', 'previous_experience']
    })
  });
  const jsonReqInfo = await resReqInfo.json();
  console.log('✅ PATCH /application (more_info_required):', jsonReqInfo.success, '| New Stage:', jsonReqInfo.data?.journeyStage);

  // 6. POST /application/resubmit -> resubmit requested fields
  const resResubmit = await fetch(`${API_BASE}/api/campus-program/application/resubmit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      availability: '5-10 hours/week',
      previous_experience: 'President of Psychology Club 2025'
    })
  });
  const jsonResubmit = await resResubmit.json();
  console.log('✅ POST /application/resubmit:', jsonResubmit.success, '| Resubmission Count:', jsonResubmit.data?.application?.resubmission_count);

  // 7. PATCH /application -> approve application (automatic activation!)
  const resApprove = await fetch(`${API_BASE}/api/campus-program/application`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      status: 'approved',
      reviewerNotes: 'Application approved by clinical review committee!'
    })
  });
  const jsonApprove = await resApprove.json();
  console.log('🎉 PATCH /application (approved -> ACTIVE):', jsonApprove.success);
  console.log('   -> Final Stage:', jsonApprove.data?.journeyStage);
  console.log('   -> Ambassador ID:', jsonApprove.data?.profile?.ambassador_id);
  console.log('   -> Referral Code:', jsonApprove.data?.profile?.referral_code);

  console.log('\n🌟 Phase 3.5 Review Lifecycle Integration Test Completed Successfully!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
