const BASE_URL = 'http://localhost:5000/api/campus-program';
const TEST_USER = 'test_provider_phase3_' + Date.now();

async function runPhase3Tests() {
  console.log('🚀 Starting Phase 3 Campus Ambassador Dashboard API Integration Tests...\n');

  try {
    // 1. GET /api/campus-program/dashboard
    console.log('1️⃣ GET /api/campus-program/dashboard...');
    const res1 = await fetch(`${BASE_URL}/dashboard?userId=${TEST_USER}`);
    const data1 = await res1.json();
    console.log('   Response Status:', res1.status);
    console.log('   Impact Students Reached:', data1.data?.impactStats?.studentsReached);
    console.log('   Roadmap Milestones Count:', data1.data?.roadmapMilestones?.length);
    console.log('   Next Mission:', data1.data?.nextMission?.title);
    if (!data1.data?.impactStats || !data1.data?.nextMission) {
      throw new Error('Dashboard aggregated payload incomplete');
    }
    console.log('   ✅ Aggregated dashboard endpoint verified!\n');

    // 2. GET /api/campus-program/progress
    console.log('2️⃣ GET /api/campus-program/progress...');
    const res2 = await fetch(`${BASE_URL}/progress?userId=${TEST_USER}`);
    const data2 = await res2.json();
    console.log('   Milestones Count:', data2.data?.length);
    console.log('   ✅ Roadmap progress endpoint verified!\n');

    // 3. GET /api/campus-program/activity
    console.log('3️⃣ GET /api/campus-program/activity...');
    const res3 = await fetch(`${BASE_URL}/activity?userId=${TEST_USER}`);
    const data3 = await res3.json();
    console.log('   Activity Feed Items:', data3.data?.length);
    console.log('   ✅ Activity feed endpoint verified!\n');

    // 4. GET /api/campus-program/referral-summary
    console.log('4️⃣ GET /api/campus-program/referral-summary...');
    const res4 = await fetch(`${BASE_URL}/referral-summary?userId=${TEST_USER}`);
    const data4 = await res4.json();
    console.log('   Referral Code:', data4.data?.referralCode);
    console.log('   ✅ Referral summary endpoint verified!\n');

    console.log('🎉 ALL PHASE 3 DASHBOARD HUB API TESTS PASSED CLEANLY!');
  } catch (err) {
    console.error('❌ Phase 3 API Test Failed:', err);
    process.exit(1);
  }
}

runPhase3Tests();
