import { AssessmentSchema } from './assessmentEngine';

export interface OcdDomainDefinition {
  id: string;
  nameKey: string;
  nameFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
  shortLabelKey: string;
  shortLabelFallback: string;
  maxScore: number;
}

export const OCD_DOMAINS: Record<string, OcdDomainDefinition> = {
  mental_rituals: {
    id: 'mental_rituals',
    nameKey: 'report.domain_mental_rituals_name',
    nameFallback: 'Mental rituals',
    descriptionKey: 'report.domain_mental_rituals_desc',
    descriptionFallback: 'Reviewing, checking, replaying or seeking certainty showed up in your responses.',
    shortLabelKey: 'report.domain_mental_rituals_short',
    shortLabelFallback: 'Mental rituals',
    maxScore: 4
  },
  intrusive_thoughts: {
    id: 'intrusive_thoughts',
    nameKey: 'report.domain_intrusive_thoughts_name',
    nameFallback: 'Intrusive thoughts',
    descriptionKey: 'report.domain_intrusive_thoughts_desc',
    descriptionFallback: 'Unwanted thoughts, doubts or images that feel difficult to dismiss stood out.',
    shortLabelKey: 'report.domain_intrusive_thoughts_short',
    shortLabelFallback: 'Intrusive thoughts',
    maxScore: 8
  },
  compulsions: {
    id: 'compulsions',
    nameKey: 'report.domain_compulsions_name',
    nameFallback: 'Compulsive responses',
    descriptionKey: 'report.domain_compulsions_desc',
    descriptionFallback: 'Feeling driven to repeat physical actions or habits to relieve discomfort showed up.',
    shortLabelKey: 'report.domain_compulsions_short',
    shortLabelFallback: 'Compulsive responses',
    maxScore: 4
  },
  functional_impact: {
    id: 'functional_impact',
    nameKey: 'report.domain_functional_impact_name',
    nameFallback: 'Daily-life impact',
    descriptionKey: 'report.domain_functional_impact_desc',
    descriptionFallback: 'These patterns may be taking noticeable time, focus or attention in your routine.',
    shortLabelKey: 'report.domain_functional_impact_short',
    shortLabelFallback: 'Daily-life impact',
    maxScore: 8
  },
  distress: {
    id: 'distress',
    nameKey: 'report.domain_distress_name',
    nameFallback: 'Distress & difficulty resisting',
    descriptionKey: 'report.domain_distress_desc',
    descriptionFallback: 'Notable internal discomfort or urges that feel hard to step back from appeared in your responses.',
    shortLabelKey: 'report.domain_distress_short',
    shortLabelFallback: 'Distress & tension',
    maxScore: 8
  }
};

export interface AnalyzedDomain {
  id: string;
  nameKey: string;
  nameFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
  score: number;
  maxScore: number;
  normalizedSignal: number; // 0.0 to 1.0
  standing: 'strong' | 'moderate' | 'low';
}

export type OcdResultState =
  | 'NO_PROMINENT_PATTERN'
  | 'PROMINENT_PATTERN'
  | 'MULTIPLE_PROMINENT_PATTERNS'
  | 'PATTERN_EMERGING';

export interface ScoreRangeInterpretation {
  range: 'lower' | 'middle' | 'higher';
  titleKey: string;
  titleFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
}

export interface OcdAssessmentAnalytics {
  resultState: OcdResultState;
  isLowSignal: boolean;
  hasTie: boolean;
  totalScore: number;
  maxPossibleScore: number;
  meterPosition: number; // 0 to 100 clamped
  interpretation: ScoreRangeInterpretation;
  domains: Record<string, AnalyzedDomain>;
  rankedDomains: AnalyzedDomain[];
  strongestPattern: AnalyzedDomain | null;
  tiedPatterns: AnalyzedDomain[];
  topPatterns: AnalyzedDomain[];
  headlineSummary: string;
  isActionElevated: boolean;
}

/**
 * Deterministic assessment analytics mapping responses to actual schema domains and visual meter metrics
 */
export function analyzeOcdAssessmentResponses(report: any): OcdAssessmentAnalytics {
  const results = report?.results || [];
  const resultMap: Record<string, { score: number; maxScore?: number }> = {};

  for (const r of results) {
    if (r && r.categoryId) {
      resultMap[r.categoryId] = {
        score: typeof r.score === 'number' ? r.score : 0,
        maxScore: typeof r.maxScore === 'number' ? r.maxScore : (OCD_DOMAINS[r.categoryId]?.maxScore ?? 8)
      };
    }
  }

  const analyzedDomains: Record<string, AnalyzedDomain> = {};
  const domainList: AnalyzedDomain[] = [];

  for (const domainKey of Object.keys(OCD_DOMAINS)) {
    const def = OCD_DOMAINS[domainKey];
    const rawScore = resultMap[domainKey]?.score ?? 0;
    const maxScore = def.maxScore;
    const normalizedSignal = maxScore > 0 ? Math.min(1, Math.max(0, rawScore / maxScore)) : 0;

    let standing: 'strong' | 'moderate' | 'low' = 'low';
    if (normalizedSignal >= 0.5) standing = 'strong';
    else if (normalizedSignal >= 0.25) standing = 'moderate';

    const analyzed: AnalyzedDomain = {
      id: def.id,
      nameKey: def.nameKey,
      nameFallback: def.nameFallback,
      descriptionKey: def.descriptionKey,
      descriptionFallback: def.descriptionFallback,
      score: rawScore,
      maxScore,
      normalizedSignal,
      standing
    };

    analyzedDomains[domainKey] = analyzed;
    domainList.push(analyzed);
  }

  // Sort domains by normalizedSignal descending, then rawScore descending
  domainList.sort((a, b) => {
    if (b.normalizedSignal !== a.normalizedSignal) {
      return b.normalizedSignal - a.normalizedSignal;
    }
    return b.score - a.score;
  });

  const totalScore = typeof report?.totalScore === 'number' ? report.totalScore : 0;
  const maxPossibleScore = 32; // 8 questions * 4 max = 32
  const meterPosition = maxPossibleScore > 0 ? Math.min(100, Math.max(0, (totalScore / maxPossibleScore) * 100)) : 0;

  // Filter domains that actually have meaningful non-zero signals
  const meaningfulDomains = domainList.filter((d) => d.score > 0 && d.normalizedSignal >= 0.25);

  const topDomain = meaningfulDomains.length > 0 ? meaningfulDomains[0] : null;
  const isLowSignal = totalScore <= 4 || !topDomain || meaningfulDomains.length === 0;

  // Near-tie detection among meaningful domains
  const secondDomain = meaningfulDomains.length > 1 ? meaningfulDomains[1] : null;
  const hasTie = !isLowSignal && secondDomain !== null && Math.abs(topDomain!.normalizedSignal - secondDomain.normalizedSignal) <= 0.06;

  let resultState: OcdResultState = 'NO_PROMINENT_PATTERN';
  let strongestPattern: AnalyzedDomain | null = null;
  let tiedPatterns: AnalyzedDomain[] = [];
  let topPatterns: AnalyzedDomain[] = [];

  if (isLowSignal) {
    resultState = 'NO_PROMINENT_PATTERN';
    strongestPattern = null;
    tiedPatterns = [];
    topPatterns = [];
  } else if (hasTie) {
    resultState = 'MULTIPLE_PROMINENT_PATTERNS';
    tiedPatterns = [topDomain!, secondDomain!];
    strongestPattern = null;
    topPatterns = meaningfulDomains.slice(0, 3);
  } else {
    resultState = topDomain!.normalizedSignal >= 0.5 ? 'PROMINENT_PATTERN' : 'PATTERN_EMERGING';
    strongestPattern = topDomain;
    tiedPatterns = [];
    topPatterns = meaningfulDomains.slice(0, 3);
  }

  // Interpretation band (Neutral, non-clinical score interpretation)
  let interpretation: ScoreRangeInterpretation;
  if (totalScore <= 8) {
    interpretation = {
      range: 'lower',
      titleKey: 'report.range_lower_title',
      titleFallback: 'LOWER RANGE',
      descriptionKey: 'report.range_lower_desc',
      descriptionFallback: 'Fewer symptoms and less day-to-day impact reported.'
    };
  } else if (totalScore <= 18) {
    interpretation = {
      range: 'middle',
      titleKey: 'report.range_middle_title',
      titleFallback: 'MIDDLE RANGE',
      descriptionKey: 'report.range_middle_desc',
      descriptionFallback: 'Some symptoms and noticeable impact reported.'
    };
  } else {
    interpretation = {
      range: 'higher',
      titleKey: 'report.range_higher_title',
      titleFallback: 'HIGHER RANGE',
      descriptionKey: 'report.range_higher_desc',
      descriptionFallback: 'More symptoms and meaningful impact reported.'
    };
  }

  // Action / Plan CTA elevation logic
  const functionalSignal = analyzedDomains.functional_impact?.normalizedSignal ?? 0;
  const distressSignal = analyzedDomains.distress?.normalizedSignal ?? 0;
  const isActionElevated = functionalSignal >= 0.5 || distressSignal >= 0.5 || totalScore >= 14;

  // Dynamic concise conversational summary generated strictly from score
  let headlineSummary = '';
  if (totalScore <= 4) {
    headlineSummary = 'Your responses suggest that OCD-related symptoms and their impact are currently limited.';
  } else if (totalScore <= 14) {
    headlineSummary = 'Your responses suggest that OCD-related symptoms and their impact may be taking some space in your day.';
  } else {
    headlineSummary = 'Your responses suggest that OCD-related symptoms and their impact may be taking meaningful space in your day.';
  }

  return {
    resultState,
    isLowSignal,
    hasTie,
    totalScore,
    maxPossibleScore,
    meterPosition,
    interpretation,
    domains: analyzedDomains,
    rankedDomains: domainList,
    strongestPattern,
    tiedPatterns,
    topPatterns,
    headlineSummary,
    isActionElevated
  };
}
