const API_BASE = 'http://localhost:5000';

async function testCorporateLearningAcademy() {
  console.log('🎓 Running Corporate Learning Academy Phase 2 Verification...\n');

  const testUserId = `test_learning_${Date.now()}`;

  // 1. Get initial progress (should be empty/default)
  console.log('1. GET /api/corporate-program/learning/progress (initial)...');
  const res1 = await fetch(`${API_BASE}/api/corporate-program/learning/progress?userId=${testUserId}`);
  const json1 = await res1.json();
  console.log('   →', JSON.stringify(json1.data));
  if (!json1.success || json1.data.currentModuleId !== 'corp_mod_1' || json1.data.progressPercent !== 0) {
    throw new Error('Initial progress check failed');
  }
  console.log('   ✅ Initial progress is correct (Module 1, 0%)\n');

  // 2. Complete Module 1
  console.log('2. POST /api/corporate-program/learning/complete (corp_mod_1)...');
  const res2 = await fetch(`${API_BASE}/api/corporate-program/learning/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: testUserId, moduleId: 'corp_mod_1', timeSpentSeconds: 120 })
  });
  const json2 = await res2.json();
  console.log('   →', JSON.stringify(json2.data));
  if (!json2.success || json2.data.progressPercent !== 10 || json2.data.currentModuleId !== 'corp_mod_2') {
    throw new Error('Module 1 completion failed');
  }
  console.log('   ✅ Module 1 completed. Progress: 10%, Next: corp_mod_2\n');

  // 3. Complete Modules 2-5 in sequence
  for (let i = 2; i <= 5; i++) {
    console.log(`3.${i-1}. Completing corp_mod_${i}...`);
    const res = await fetch(`${API_BASE}/api/corporate-program/learning/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, moduleId: `corp_mod_${i}`, timeSpentSeconds: 60 })
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Module ${i} completion failed`);
    console.log(`   ✅ Module ${i} done. Progress: ${json.data.progressPercent}%`);
  }
  console.log('');

  // 4. Navigate back to Module 3 (should work, already completed)
  console.log('4. POST /api/corporate-program/learning/navigate (back to corp_mod_3)...');
  const res4 = await fetch(`${API_BASE}/api/corporate-program/learning/navigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: testUserId, moduleId: 'corp_mod_3', timeSpentSeconds: 10 })
  });
  const json4 = await res4.json();
  if (!json4.success || json4.data.currentModuleId !== 'corp_mod_3') {
    throw new Error('Navigation back to Module 3 failed');
  }
  console.log('   ✅ Successfully navigated back to Module 3\n');

  // 5. Verify progress persists after re-fetch
  console.log('5. GET /api/corporate-program/learning/progress (after completions)...');
  const res5 = await fetch(`${API_BASE}/api/corporate-program/learning/progress?userId=${testUserId}`);
  const json5 = await res5.json();
  console.log('   → Completed:', json5.data.completedModuleIds);
  console.log('   → Progress:', json5.data.progressPercent + '%');
  console.log('   → Time Spent:', json5.data.timeSpentSeconds + 's');
  if (json5.data.completedModuleIds.length !== 5 || json5.data.progressPercent !== 50) {
    throw new Error('Progress persistence check failed');
  }
  console.log('   ✅ Progress correctly persisted: 5/10 modules, 50%\n');

  // 6. Complete remaining modules
  for (let i = 6; i <= 10; i++) {
    const res = await fetch(`${API_BASE}/api/corporate-program/learning/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, moduleId: `corp_mod_${i}`, timeSpentSeconds: 90 })
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Module ${i} completion failed`);
  }

  // 7. Final check - 100% complete
  console.log('6. Final progress check (should be 100%)...');
  const res7 = await fetch(`${API_BASE}/api/corporate-program/learning/progress?userId=${testUserId}`);
  const json7 = await res7.json();
  console.log('   → Progress:', json7.data.progressPercent + '%');
  console.log('   → Completed:', json7.data.completedModuleIds.length + '/10 modules');
  if (json7.data.progressPercent !== 100 || json7.data.completedModuleIds.length !== 10) {
    throw new Error('Final 100% check failed');
  }
  console.log('   ✅ Academy fully completed: 100%, 10/10 modules\n');

  console.log('🎓 ALL CORPORATE LEARNING ACADEMY TESTS PASSED! ✅');
}

testCorporateLearningAcademy().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
