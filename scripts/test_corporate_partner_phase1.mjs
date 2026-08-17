const API_BASE = 'http://localhost:5000';

async function testCorporatePartnerPhase1() {
  console.log('🚀 Running Corporate Partner Program Phase 1 Verification Test...');

  const testUserId = `test_corp_partner_${Date.now()}`;

  // 1. Initial Status Check
  console.log('\n1. Testing GET /api/corporate-program/me...');
  const res1 = await fetch(`${API_BASE}/api/corporate-program/me?userId=${testUserId}`);
  const json1 = await res1.json();
  console.log('Response:', json1);
  if (!json1.success || json1.data.applicationStatus !== 'NOT_APPLIED') {
    throw new Error('Initial status check failed');
  }

  // 2. Express Interest
  console.log('\n2. Testing POST /api/corporate-program/interest...');
  const res2 = await fetch(`${API_BASE}/api/corporate-program/interest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: testUserId })
  });
  const json2 = await res2.json();
  console.log('Response:', json2);
  if (!json2.success || json2.data.applicationStatus !== 'interested') {
    throw new Error('Express interest failed');
  }

  // 3. Submit Application
  console.log('\n3. Testing POST /api/corporate-program/application...');
  const appData = {
    userId: testUserId,
    fullName: 'Dr. Sarah Connor',
    email: 'sarah.connor@example.com',
    countryCode: '+1',
    phone: '5550199',
    city: 'San Francisco',
    companyConnections: 'Acme Corp, TechStark Inc, BioHealth LLC',
    industries: 'Technology, Healthcare, Biotechnology',
    linkedinUrl: 'https://linkedin.com/in/sarahconnor',
    previousExperience: 'Managed B2B corporate wellness workshops for 3 years.',
    motivation: 'Passionate about improving employee mental health & organizational wellbeing.',
    availability: 'Part-Time (5-10 hrs/wk)',
    termsAccepted: true
  };
  const res3 = await fetch(`${API_BASE}/api/corporate-program/application`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appData)
  });
  const json3 = await res3.json();
  console.log('Response:', json3);
  if (!json3.success || json3.data.applicationStatus !== 'submitted') {
    throw new Error('Application submission failed');
  }

  // 4. Admin Applications Fetch
  console.log('\n4. Testing GET /api/corporate-program/admin/applications...');
  const res4 = await fetch(`${API_BASE}/api/corporate-program/admin/applications`);
  const json4 = await res4.json();
  console.log('Admin applications json4:', json4);
  if (!json4.success || !Array.isArray(json4.data?.applications)) {
    throw new Error('Admin applications fetch failed');
  }

  console.log('\n✅ ALL CORPORATE PARTNER PHASE 1 TESTS PASSED SUCCESSFULLY!');
}

testCorporatePartnerPhase1().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
