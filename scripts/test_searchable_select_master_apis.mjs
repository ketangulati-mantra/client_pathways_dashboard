const BASE_URL = 'http://localhost:5000/api/campus-program/master';

async function runMasterApiTests() {
  console.log('🚀 Starting Master Data Autocomplete API Integration Tests...\n');

  try {
    // 1. GET /api/campus-program/master/colleges?query=mait
    console.log('1️⃣ Searching GGSIPU colleges (GET /api/campus-program/master/colleges?query=mait)...');
    const res1 = await fetch(`${BASE_URL}/colleges?query=mait`);
    const data1 = await res1.json();
    console.log('   Status:', res1.status);
    console.log('   Results Count:', data1.data?.length);
    console.log('   Matches:', data1.data);
    if (!data1.data?.some(c => c.toLowerCase().includes('mait') || c.toLowerCase().includes('maharaja agrasen'))) {
      throw new Error('Expected MAIT in matching colleges');
    }
    console.log('   ✅ College master data endpoint verified with GGSIPU search!\n');

    // 2. GET /api/campus-program/master/courses?query=comp
    console.log('2️⃣ Searching courses (GET /api/campus-program/master/courses?query=comp)...');
    const res2 = await fetch(`${BASE_URL}/courses?query=comp`);
    const data2 = await res2.json();
    console.log('   Status:', res2.status);
    console.log('   Results Count:', data2.data?.length);
    console.log('   First 5 Matches:', data2.data?.slice(0, 5));
    if (!data2.data?.some(c => c.toLowerCase().includes('computer'))) {
      throw new Error('Expected Computer Science degree in matching courses');
    }
    console.log('   ✅ Course master data endpoint verified!\n');

    // 3. GET /api/campus-program/master/cities?query=delhi
    console.log('3️⃣ Searching cities (GET /api/campus-program/master/cities?query=delhi)...');
    const res3 = await fetch(`${BASE_URL}/cities?query=delhi`);
    const data3 = await res3.json();
    console.log('   Status:', res3.status);
    console.log('   Results Count:', data3.data?.length);
    console.log('   Matches:', data3.data);
    if (!data3.data?.includes('New Delhi')) {
      throw new Error('Expected New Delhi in matching cities');
    }
    console.log('   ✅ City master data endpoint verified!\n');

    console.log('🎉 ALL MASTER DATA AUTOCOMPLETE API TESTS PASSED CLEANLY!');
  } catch (err) {
    console.error('❌ Master API Test Failed:', err);
    process.exit(1);
  }
}

runMasterApiTests();
