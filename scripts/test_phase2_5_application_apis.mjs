const BASE_URL = 'http://localhost:5000/api/campus-program';
const TEST_USER = 'test_provider_phase2_5_' + Date.now();

async function runPhase2_5Tests() {
  console.log('🚀 Starting Phase 2.5 Campus Application Modal & DB Integration API Tests...\n');

  try {
    // 1. Submit Application via POST /api/campus-program/application with country_code
    console.log('1️⃣ Submitting application form with country_code (POST /api/campus-program/application)...');
    const appPayload = {
      userId: TEST_USER,
      full_name: 'Dr. Jane Ambassador',
      email: 'jane.ambassador@stanford.edu',
      country_code: '+91',
      phone: '9876543210',
      college: 'Stanford University',
      course: 'M.S. Clinical Psychology',
      year: 'Postgraduate',
      city: 'Palo Alto',
      motivation: 'Extremely passionate about student mental health advocacy and early distress interventions on campus.',
      availability: '3–5 hours/week',
      linkedin_url: 'https://linkedin.com/in/janeambassador',
      previous_experience: 'Led peer counseling drives for 2 years'
    };

    const res1 = await fetch(`${BASE_URL}/application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appPayload)
    });

    const data1 = await res1.json();
    console.log('   Response Status:', res1.status);
    console.log('   Journey Stage:', data1.data?.journeyStage);
    console.log('   Submitted Country Code:', data1.data?.application?.country_code);
    console.log('   Submitted Phone:', data1.data?.application?.phone);
    if (data1.data?.application?.country_code !== '+91') {
      throw new Error(`Expected +91, got ${data1.data?.application?.country_code}`);
    }
    console.log('   ✅ Application stored with country_code in DB!\n');

    // 2. Fetch existing application via GET /api/campus-program/application
    console.log('2️⃣ Fetching stored application (GET /api/campus-program/application)...');
    const res2 = await fetch(`${BASE_URL}/application?userId=${TEST_USER}`);
    const data2 = await res2.json();
    console.log('   Retrieved Country Code:', data2.data?.country_code);
    console.log('   Retrieved Phone:', data2.data?.phone);
    if (data2.data?.country_code !== '+91') {
      throw new Error(`Expected +91, got ${data2.data?.country_code}`);
    }
    console.log('   ✅ Stored application country code retrieval verified!\n');

    console.log('🎉 ALL COUNTRY CODE & APPLICATION DB TESTS PASSED CLEANLY!');
  } catch (err) {
    console.error('❌ Phase 2.5 API Test Failed:', err);
    process.exit(1);
  }
}

runPhase2_5Tests();
