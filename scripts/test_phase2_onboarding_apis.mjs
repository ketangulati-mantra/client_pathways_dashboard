const BASE_URL = 'http://localhost:5000/api/campus-program';
const TEST_USER = 'test_provider_phase2_' + Date.now();

async function runPhase2Tests() {
  console.log('🚀 Starting Phase 2 Interactive Onboarding API Integration Tests...\n');

  try {
    // 1. Initial status query
    console.log('1️⃣ Querying initial status for new provider...');
    const res1 = await fetch(`${BASE_URL}/me?userId=${TEST_USER}`);
    const data1 = await res1.json();
    console.log('   Current Step:', data1.data?.profile?.current_step);
    if (data1.data?.profile?.current_step !== 1) {
      throw new Error(`Expected initial step 1, got ${data1.data?.profile?.current_step}`);
    }
    console.log('   ✅ Initial step 1 verified!\n');

    // 2. Advance to Step 3 and persist
    console.log('2️⃣ Persisting Step 3 in database (POST /api/campus-program/step)...');
    const res2 = await fetch(`${BASE_URL}/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: TEST_USER, step: 3 })
    });
    const data2 = await res2.json();
    console.log('   Response Status:', res2.status);
    console.log('   Saved Step:', data2.data?.profile?.current_step);
    if (data2.data?.profile?.current_step !== 3) {
      throw new Error(`Expected saved step 3, got ${data2.data?.profile?.current_step}`);
    }
    console.log('   ✅ Step 3 successfully saved in database!\n');

    // 3. Simulate page reload / reopening module and verify state resumes at Step 3
    console.log('3️⃣ Simulating app reload (re-querying GET /api/campus-program/me)...');
    const res3 = await fetch(`${BASE_URL}/me?userId=${TEST_USER}`);
    const data3 = await res3.json();
    console.log('   Resumed Step:', data3.data?.profile?.current_step);
    if (data3.data?.profile?.current_step !== 3) {
      throw new Error(`State resumption failed! Expected step 3, got ${data3.data?.profile?.current_step}`);
    }
    console.log('   ✅ State resumption verified: Resumed at Step 3 from database!\n');

    // 4. Test Step 6 Opt-Out ("Maybe Later")
    const OPT_OUT_USER = 'test_opt_out_' + Date.now();
    console.log('4️⃣ Testing Step 6 "Maybe Later" (POST /api/campus-program/opt-out)...');
    const res4 = await fetch(`${BASE_URL}/opt-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: OPT_OUT_USER })
    });
    const data4 = await res4.json();
    console.log('   Opt-Out Status:', data4.data?.status);
    if (data4.data?.status !== 'maybe_later') {
      throw new Error(`Expected status maybe_later, got ${data4.data?.status}`);
    }
    console.log('   ✅ Opt-out status maybe_later verified!\n');

    console.log('🎉 ALL PHASE 2 INTERACTIVE ONBOARDING API TESTS PASSED CLEANLY!');
  } catch (err) {
    console.error('❌ Phase 2 API Test Failed:', err);
    process.exit(1);
  }
}

runPhase2Tests();
