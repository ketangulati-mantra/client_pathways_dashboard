// Self-contained verification script for OCD Assessment Analytics
const OCD_RESPONSE_OPTIONS = [
  { label: 'Not at all', score: 0 },
  { label: 'A little', score: 1 },
  { label: 'Moderately', score: 2 },
  { label: 'A lot', score: 3 },
  { label: 'Extremely', score: 4 }
];

const ocdAssessmentSchema = {
  id: 'ocd-assessment',
  title: 'OCD Check-In',
  description: 'A 2-3 minute check-in',
  categories: [
    { id: 'intrusive_thoughts', name: 'Unwanted Thoughts', description: '' },
    { id: 'compulsions', name: 'Repetitive Actions', description: '' },
    { id: 'mental_rituals', name: 'Mental Rituals', description: '' },
    { id: 'distress', name: 'Distress & Control', description: '' },
    { id: 'functional_impact', name: 'Daily Impact', description: '' }
  ],
  thresholds: {
    intrusive_thoughts: [{ label: 'Minimal', maxScore: 2 }, { label: 'Noticeable', maxScore: 5 }, { label: 'Elevated', maxScore: 8 }],
    compulsions: [{ label: 'Minimal', maxScore: 1 }, { label: 'Noticeable', maxScore: 2 }, { label: 'Elevated', maxScore: 4 }],
    mental_rituals: [{ label: 'Minimal', maxScore: 1 }, { label: 'Noticeable', maxScore: 2 }, { label: 'Elevated', maxScore: 4 }],
    distress: [{ label: 'Minimal', maxScore: 2 }, { label: 'Noticeable', maxScore: 5 }, { label: 'Elevated', maxScore: 8 }],
    functional_impact: [{ label: 'Minimal', maxScore: 2 }, { label: 'Noticeable', maxScore: 5 }, { label: 'Elevated', maxScore: 8 }]
  },
  questions: [
    { id: 'ocd_q1', categoryId: 'intrusive_thoughts', text: 'Q1', options: OCD_RESPONSE_OPTIONS },
    { id: 'ocd_q2', categoryId: 'intrusive_thoughts', text: 'Q2', options: OCD_RESPONSE_OPTIONS },
    { id: 'ocd_q3', categoryId: 'compulsions', text: 'Q3', options: OCD_RESPONSE_OPTIONS },
    { id: 'ocd_q4', categoryId: 'mental_rituals', text: 'Q4', options: OCD_RESPONSE_OPTIONS },
    { id: 'ocd_q5', categoryId: 'distress', text: 'Q5', options: OCD_RESPONSE_OPTIONS },
    { id: 'ocd_q6', categoryId: 'distress', text: 'Q6', options: OCD_RESPONSE_OPTIONS },
    { id: 'ocd_q7', categoryId: 'functional_impact', text: 'Q7', options: OCD_RESPONSE_OPTIONS },
    { id: 'ocd_q8', categoryId: 'functional_impact', text: 'Q8', options: OCD_RESPONSE_OPTIONS }
  ]
};

function calculateAssessmentResults(responses, schema) {
  const unansweredQuestionIds = [];
  for (const q of schema.questions) {
    if (!responses[q.id] || typeof responses[q.id].score !== 'number') {
      unansweredQuestionIds.push(q.id);
    }
  }

  const isComplete = unansweredQuestionIds.length === 0;
  const results = [];
  let totalScore = 0;

  for (const category of schema.categories) {
    const categoryQuestions = schema.questions.filter((q) => q.categoryId === category.id);
    let catScore = 0;
    let minPossibleScore = 0;
    let maxPossibleScore = 0;

    for (const q of categoryQuestions) {
      const resp = responses[q.id];
      if (resp && typeof resp.score === 'number') {
        catScore += resp.score;
      }
      const scores = q.options.map((o) => o.score);
      minPossibleScore += Math.min(...scores);
      maxPossibleScore += Math.max(...scores);
    }

    totalScore += catScore;
    results.push({
      categoryId: category.id,
      categoryName: category.name,
      score: catScore,
      minPossibleScore,
      maxPossibleScore
    });
  }

  return { results, totalScore, isComplete, unansweredQuestionIds };
}

const OCD_DOMAINS = {
  mental_rituals: { id: 'mental_rituals', nameFallback: 'Mental rituals', maxScore: 4 },
  intrusive_thoughts: { id: 'intrusive_thoughts', nameFallback: 'Intrusive thoughts', maxScore: 8 },
  compulsions: { id: 'compulsions', nameFallback: 'Compulsive responses', maxScore: 4 },
  functional_impact: { id: 'functional_impact', nameFallback: 'Daily-life impact', maxScore: 8 },
  distress: { id: 'distress', nameFallback: 'Distress & difficulty resisting', maxScore: 8 }
};

function analyzeOcdAssessmentResponses(report) {
  const results = report?.results || [];
  const resultMap = {};

  for (const r of results) {
    if (r && r.categoryId) {
      resultMap[r.categoryId] = {
        score: typeof r.score === 'number' ? r.score : 0,
        maxScore: typeof r.maxScore === 'number' ? r.maxScore : (OCD_DOMAINS[r.categoryId]?.maxScore ?? 8)
      };
    }
  }

  const analyzedDomains = {};
  const domainList = [];

  for (const domainKey of Object.keys(OCD_DOMAINS)) {
    const def = OCD_DOMAINS[domainKey];
    const rawScore = resultMap[domainKey]?.score ?? 0;
    const maxScore = def.maxScore;
    const normalizedSignal = maxScore > 0 ? Math.min(1, Math.max(0, rawScore / maxScore)) : 0;

    let standing = 'low';
    if (normalizedSignal >= 0.5) standing = 'strong';
    else if (normalizedSignal >= 0.25) standing = 'moderate';

    const analyzed = {
      id: def.id,
      nameFallback: def.nameFallback,
      score: rawScore,
      maxScore,
      normalizedSignal,
      standing
    };

    analyzedDomains[domainKey] = analyzed;
    domainList.push(analyzed);
  }

  domainList.sort((a, b) => {
    if (b.normalizedSignal !== a.normalizedSignal) {
      return b.normalizedSignal - a.normalizedSignal;
    }
    return b.score - a.score;
  });

  const totalScore = typeof report?.totalScore === 'number' ? report.totalScore : 0;
  const meaningfulDomains = domainList.filter((d) => d.score > 0 && d.normalizedSignal >= 0.25);
  const topDomain = meaningfulDomains.length > 0 ? meaningfulDomains[0] : null;
  const isLowSignal = !topDomain || meaningfulDomains.length === 0;

  const secondDomain = meaningfulDomains.length > 1 ? meaningfulDomains[1] : null;
  const hasTie = !isLowSignal && secondDomain !== null && Math.abs(topDomain.normalizedSignal - secondDomain.normalizedSignal) <= 0.06;

  let resultState = 'NO_PROMINENT_PATTERN';
  let strongestPattern = null;
  let tiedPatterns = [];
  let topPatterns = [];

  if (isLowSignal) {
    resultState = 'NO_PROMINENT_PATTERN';
    strongestPattern = null;
    tiedPatterns = [];
    topPatterns = [];
  } else if (hasTie) {
    resultState = 'MULTIPLE_PROMINENT_PATTERNS';
    tiedPatterns = [topDomain, secondDomain];
    strongestPattern = null;
    topPatterns = meaningfulDomains.slice(0, 3);
  } else {
    resultState = topDomain.normalizedSignal >= 0.5 ? 'PROMINENT_PATTERN' : 'PATTERN_EMERGING';
    strongestPattern = topDomain;
    tiedPatterns = [];
    topPatterns = meaningfulDomains.slice(0, 3);
  }

  let headlineSummary = '';
  if (isLowSignal) {
    headlineSummary = "Your responses didn't point strongly toward one particular pattern. This check-in is simply a starting point for noticing what may be showing up.";
  } else if (hasTie && tiedPatterns.length >= 2) {
    headlineSummary = `Your responses pointed most strongly toward ${tiedPatterns[0]?.nameFallback.toLowerCase()} and ${tiedPatterns[1]?.nameFallback.toLowerCase()}.`;
  } else if (strongestPattern) {
    const second = meaningfulDomains.length > 1 && meaningfulDomains[1]?.normalizedSignal >= 0.35 ? meaningfulDomains[1] : null;
    if (second && second.id !== strongestPattern.id) {
      headlineSummary = `Your responses pointed most strongly toward ${strongestPattern.nameFallback.toLowerCase()} and their impact on your day.`;
    } else {
      headlineSummary = `Your responses pointed most strongly toward ${strongestPattern.nameFallback.toLowerCase()}.`;
    }
  }

  return {
    resultState,
    isLowSignal,
    hasTie,
    totalScore,
    domains: analyzedDomains,
    rankedDomains: domainList,
    strongestPattern,
    tiedPatterns,
    topPatterns,
    headlineSummary
  };
}

function runTests() {
  console.log('=== TEST SUITE FOR OCD ASSESSMENT DATA FLOW & ANALYTICS ===\n');

  // TEST 1: ALL "NOT AT ALL" (Score = 0 across every question)
  const allZeroResponses = {};
  for (const q of ocdAssessmentSchema.questions) {
    allZeroResponses[q.id] = { questionId: q.id, response: 'Not at all', score: 0, categoryId: q.categoryId };
  }

  const repZero = calculateAssessmentResults(allZeroResponses, ocdAssessmentSchema);
  const anaZero = analyzeOcdAssessmentResponses(repZero);

  console.log('TEST 1: ALL "NOT AT ALL"');
  console.log('  Total Score:', repZero.totalScore);
  console.log('  Result State:', anaZero.resultState);
  console.log('  Strongest Pattern:', anaZero.strongestPattern);
  console.log('  Top Patterns:', anaZero.topPatterns);
  console.log('  Headline:', anaZero.headlineSummary);

  if (
    repZero.totalScore === 0 &&
    anaZero.resultState === 'NO_PROMINENT_PATTERN' &&
    anaZero.strongestPattern === null &&
    anaZero.topPatterns.length === 0 &&
    anaZero.headlineSummary.includes("didn't point strongly toward one particular pattern")
  ) {
    console.log('  ✅ TEST 1 PASSED: Zero responses produce NO patterns.\n');
  } else {
    console.error('  ❌ TEST 1 FAILED\n');
    process.exit(1);
  }

  // TEST 2: Only Mental Rituals
  const mentalOnlyResponses = { ...allZeroResponses };
  mentalOnlyResponses['ocd_q4'] = { questionId: 'ocd_q4', response: 'Extremely', score: 4, categoryId: 'mental_rituals' };

  const repMental = calculateAssessmentResults(mentalOnlyResponses, ocdAssessmentSchema);
  const anaMental = analyzeOcdAssessmentResponses(repMental);

  console.log('TEST 2: ONLY MENTAL RITUALS (Score=4/4)');
  console.log('  Strongest Pattern ID:', anaMental.strongestPattern?.id);
  console.log('  Top Patterns Count:', anaMental.topPatterns.length);
  if (anaMental.strongestPattern?.id === 'mental_rituals' && anaMental.topPatterns.length === 1) {
    console.log('  ✅ TEST 2 PASSED: Only mental rituals is returned.\n');
  } else {
    console.error('  ❌ TEST 2 FAILED\n');
    process.exit(1);
  }

  // TEST 3: Only Intrusive Thoughts
  const intrusiveOnlyResponses = { ...allZeroResponses };
  intrusiveOnlyResponses['ocd_q1'] = { questionId: 'ocd_q1', response: 'Extremely', score: 4, categoryId: 'intrusive_thoughts' };
  intrusiveOnlyResponses['ocd_q2'] = { questionId: 'ocd_q2', response: 'Extremely', score: 4, categoryId: 'intrusive_thoughts' };

  const repIntrusive = calculateAssessmentResults(intrusiveOnlyResponses, ocdAssessmentSchema);
  const anaIntrusive = analyzeOcdAssessmentResponses(repIntrusive);

  console.log('TEST 3: ONLY INTRUSIVE THOUGHTS (Score=8/8)');
  console.log('  Strongest Pattern ID:', anaIntrusive.strongestPattern?.id);
  console.log('  Top Patterns Count:', anaIntrusive.topPatterns.length);
  if (anaIntrusive.strongestPattern?.id === 'intrusive_thoughts' && anaIntrusive.topPatterns.length === 1) {
    console.log('  ✅ TEST 3 PASSED: Only intrusive thoughts is returned.\n');
  } else {
    console.error('  ❌ TEST 3 FAILED\n');
    process.exit(1);
  }

  // TEST 4: Tied Domains
  const tiedResponses = { ...allZeroResponses };
  tiedResponses['ocd_q4'] = { questionId: 'ocd_q4', response: 'Extremely', score: 4, categoryId: 'mental_rituals' };
  tiedResponses['ocd_q3'] = { questionId: 'ocd_q3', response: 'Extremely', score: 4, categoryId: 'compulsions' };

  const repTied = calculateAssessmentResults(tiedResponses, ocdAssessmentSchema);
  const anaTied = analyzeOcdAssessmentResponses(repTied);

  console.log('TEST 4: TWO EQUAL TIED DOMAINS');
  console.log('  Result State:', anaTied.resultState);
  console.log('  Tied Patterns Count:', anaTied.tiedPatterns.length);
  if (anaTied.resultState === 'MULTIPLE_PROMINENT_PATTERNS' && anaTied.tiedPatterns.length === 2) {
    console.log('  ✅ TEST 4 PASSED: Handled ties cleanly without arbitrary ranking.\n');
  } else {
    console.error('  ❌ TEST 4 FAILED\n');
    process.exit(1);
  }

  console.log('🎉 ALL DATA FLOW & CALCULATION TESTS PASSED CLEANLY!');
}

runTests();
