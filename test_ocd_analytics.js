import { calculateAssessmentResults } from './src/utils/assessmentEngine.ts';
import { ocdAssessmentSchema } from './src/utils/ocdAssessmentSchema.ts';
import { analyzeOcdAssessmentResponses } from './src/utils/ocdAssessmentAnalytics.ts';

function runTests() {
  console.log('=== RUNNING OCD ASSESSMENT ANALYTICS & VISUAL METER TESTS ===\n');

  // TEST 1: All "Not at all" (Score = 0)
  const allZeroResponses = {};
  for (const q of ocdAssessmentSchema.questions) {
    allZeroResponses[q.id] = {
      questionId: q.id,
      response: 'Not at all',
      score: 0,
      categoryId: q.categoryId
    };
  }

  const reportZero = calculateAssessmentResults(allZeroResponses, ocdAssessmentSchema);
  const analyticsZero = analyzeOcdAssessmentResponses(reportZero);

  console.log('TEST 1: All "Not at all"');
  console.log('  Total Score:', reportZero.totalScore, '(Expected: 0)');
  console.log('  Meter Position:', analyticsZero.meterPosition, '% (Expected: 0)');
  console.log('  Interpretation Range:', analyticsZero.interpretation.range, '(Expected: lower)');
  console.log('  Result State:', analyticsZero.resultState, '(Expected: NO_PROMINENT_PATTERN)');
  console.log('  Strongest Pattern:', analyticsZero.strongestPattern, '(Expected: null)');
  console.log('  Top Patterns Length:', analyticsZero.topPatterns.length, '(Expected: 0)');
  console.log('  Headline Summary:', analyticsZero.headlineSummary);

  if (
    reportZero.totalScore === 0 &&
    analyticsZero.meterPosition === 0 &&
    analyticsZero.interpretation.range === 'lower' &&
    analyticsZero.resultState === 'NO_PROMINENT_PATTERN' &&
    analyticsZero.strongestPattern === null &&
    analyticsZero.topPatterns.length === 0
  ) {
    console.log('  ✅ TEST 1 PASSED (0 Score, 0% Meter, No False Patterns)\n');
  } else {
    console.error('  ❌ TEST 1 FAILED\n');
    process.exit(1);
  }

  // TEST 2: All "Extremely" (Score = 32)
  const allMaxResponses = {};
  for (const q of ocdAssessmentSchema.questions) {
    allMaxResponses[q.id] = {
      questionId: q.id,
      response: 'Extremely',
      score: 4,
      categoryId: q.categoryId
    };
  }

  const reportMax = calculateAssessmentResults(allMaxResponses, ocdAssessmentSchema);
  const analyticsMax = analyzeOcdAssessmentResponses(reportMax);

  console.log('TEST 2: All "Extremely"');
  console.log('  Total Score:', reportMax.totalScore, '(Expected: 32)');
  console.log('  Meter Position:', analyticsMax.meterPosition, '% (Expected: 100)');
  console.log('  Interpretation Range:', analyticsMax.interpretation.range, '(Expected: higher)');
  if (
    reportMax.totalScore === 32 &&
    analyticsMax.meterPosition === 100 &&
    analyticsMax.interpretation.range === 'higher'
  ) {
    console.log('  ✅ TEST 2 PASSED (Max Score, 100% Meter, Higher Range)\n');
  } else {
    console.error('  ❌ TEST 2 FAILED\n');
    process.exit(1);
  }

  // TEST 3: Mental Rituals Only (q4 score = 4, everything else = 0)
  const mentalOnlyResponses = { ...allZeroResponses };
  mentalOnlyResponses['ocd_q4'] = {
    questionId: 'ocd_q4',
    response: 'Extremely',
    score: 4,
    categoryId: 'mental_rituals'
  };

  const reportMental = calculateAssessmentResults(mentalOnlyResponses, ocdAssessmentSchema);
  const analyticsMental = analyzeOcdAssessmentResponses(reportMental);

  console.log('TEST 3: Only Mental Rituals Scored');
  console.log('  Result State:', analyticsMental.resultState, '(Expected: PROMINENT_PATTERN)');
  console.log('  Strongest Pattern ID:', analyticsMental.strongestPattern?.id, '(Expected: mental_rituals)');
  console.log('  Top Patterns Count:', analyticsMental.topPatterns.length, '(Expected: 1)');
  if (
    analyticsMental.resultState === 'PROMINENT_PATTERN' &&
    analyticsMental.strongestPattern?.id === 'mental_rituals' &&
    analyticsMental.topPatterns.length === 1
  ) {
    console.log('  ✅ TEST 3 PASSED\n');
  } else {
    console.error('  ❌ TEST 3 FAILED\n');
    process.exit(1);
  }

  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTests();
