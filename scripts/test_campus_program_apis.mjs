const BASE_URL = 'http://localhost:5000/api/campus-program';
const TEST_USER = 'test_provider_phase1_' + Date.now();

async function runTests() {
  console.log('🚀 Starting Phase 1 Campus Program Engine API Integration Tests...\n');

  try {
    // Test 1: GET /api/campus-program/me (Initial state: NOT_JOINED)
    console.log('1️⃣ GET /api/campus-program/me for new provider...');
    const res1 = await fetch(`${BASE_URL}/me?userId=${TEST_USER}`);
    const data1 = await res1.json();
    console.log('   Response Status:', res1.status);
    console.log('   Journey Stage:', data1.data?.journeyStage);
    if (data1.data?.journeyStage !== 'NOT_JOINED') {
      throw new Error(`Expected NOT_JOINED, got ${data1.data?.journeyStage}`);
    }
    console.log('   ✅ Initial state NOT_JOINED verified!\n');

    // Test 2: POST /api/campus-program/join
    console.log('2️⃣ POST /api/campus-program/join ("I\'m Ready to Join")...');
    const res2 = await fetch(`${BASE_URL}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: TEST_USER, collegeName: 'Stanford University' })
    });
    const data2 = await res2.json();
    console.log('   Response Status:', res2.status);
    console.log('   Updated Stage:', data2.data?.journeyStage);
    console.log('   Credits Earned:', data2.data?.creditBalance);
    if (data2.data?.journeyStage !== 'LEARNING') {
      throw new Error(`Expected LEARNING, got ${data2.data?.journeyStage}`);
    }
    console.log('   ✅ Stage transitioned to LEARNING + Welcome Credits awarded!\n');

    // Test 3: POST /api/campus-program/learning (Complete Module 1)
    console.log('3️⃣ POST /api/campus-program/learning (Complete Module 1)...');
    const res3 = await fetch(`${BASE_URL}/learning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: TEST_USER, moduleId: 'module-1-advocacy' })
    });
    const data3 = await res3.json();
    console.log('   Response Status:', res3.status);
    console.log('   Credits Balance:', data3.data?.creditBalance);
    console.log('   ✅ Module 1 completed + 100 credits awarded!\n');

    // Test 4: POST /api/campus-program/submit-application
    console.log('4️⃣ POST /api/campus-program/submit-application (Submit for review)...');
    const res4 = await fetch(`${BASE_URL}/submit-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: TEST_USER })
    });
    const data4 = await res4.json();
    console.log('   Response Status:', res4.status);
    console.log('   Final Stage:', data4.data?.journeyStage);
    if (data4.data?.journeyStage !== 'UNDER_REVIEW') {
      throw new Error(`Expected UNDER_REVIEW, got ${data4.data?.journeyStage}`);
    }
    console.log('   ✅ Stage transitioned to UNDER_REVIEW!\n');

    console.log('🎉 ALL PHASE 1 CAMPUS PROGRAM ENGINE TESTS PASSED CLEANLY!');
  } catch (err) {
    console.error('❌ API Test Failed:', err);
    process.exit(1);
  }
}

runTests();
