const API_BASE = 'http://localhost:5000';
const TEST_USER = 'test_user_db_check_99';

async function testBackendDB() {
  console.log('🚀 Checking Backend DB API Endpoints...\n');

  try {
    // 1. GET /api/campus-program/me
    console.log('1️⃣ GET /api/campus-program/me...');
    const res1 = await fetch(`${API_BASE}/api/campus-program/me?userId=${TEST_USER}`);
    const json1 = await res1.json();
    console.log('   Status:', res1.status);
    console.log('   Response:', JSON.stringify(json1, null, 2));

    if (!res1.ok || !json1.success) {
      console.error('❌ GET /me failed!');
      return;
    }

    // 2. POST /api/campus-program/learning (mod_1_advocacy)
    console.log('\n2️⃣ POST /api/campus-program/learning (mod_1_advocacy)...');
    const res2 = await fetch(`${API_BASE}/api/campus-program/learning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: TEST_USER, moduleId: 'mod_1_advocacy' })
    });
    const json2 = await res2.json();
    console.log('   Status:', res2.status);
    console.log('   Response success:', json2.success);

    if (!res2.ok || !json2.success) {
      console.error('❌ POST /learning failed:', json2);
      return;
    }

    console.log('\n🎉 ALL BACKEND DB API ENDPOINTS PASSED CLEANLY!');
  } catch (err) {
    console.error('❌ Network / DB Error:', err);
  }
}

testBackendDB();
