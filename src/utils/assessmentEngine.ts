export interface AssessmentCategory {
  id: string;
  name: string;
  description: string;
}

export interface Threshold {
  label: string; // e.g. 'Mild', 'Moderate', 'Severe', 'Extremely Severe'
  maxScore: number; // upper bound of this threshold (inclusive)
  color: string;
  message: string;
}

export interface AssessmentOption {
  label: string;
  score: number;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  categoryId: string;
  options: AssessmentOption[];
}

export interface AssessmentSchema {
  id: string;
  title: string;
  description: string;
  categories: AssessmentCategory[];
  thresholds: Record<string, Threshold[]>; // Maps categoryId -> array of thresholds (sorted by maxScore asc)
  questions: AssessmentQuestion[];
}

export interface AssessmentResponse {
  questionId: string;
  response: string;
  score: number;
  categoryId: string;
}

export interface CategoryResult {
  categoryId: string;
  categoryName: string;
  score: number;
  minPossibleScore: number;
  maxPossibleScore: number;
  severityLabel: string;
  color: string;
  message: string;
}

export interface AssessmentReport {
  results: CategoryResult[];
  totalScore: number;
  isComplete: boolean;
  unansweredQuestionIds: string[];
}

export interface WebhookContext {
  upaId?: string | number | null;
  uid?: string | null;
  entryId?: string | null;
  formId?: string | null;
  activityId?: string | null;
}

export interface AssessmentWebhookPayload {
  intent: string;
  entry_id: string;
  activity_id: string;
  parameter: Array<{ id: number; value: string }>;
  upa_id?: number;
  form_id: string;
  uid?: string;
}

/**
 * Validates all questions are answered and calculates separate category scores and severity levels.
 */
export function calculateAssessmentResults(
  responses: Record<string, AssessmentResponse>,
  schema: AssessmentSchema
): AssessmentReport {
  const unansweredQuestionIds: string[] = [];

  for (const q of schema.questions) {
    if (!responses[q.id] || typeof responses[q.id].score !== 'number') {
      unansweredQuestionIds.push(q.id);
    }
  }

  const isComplete = unansweredQuestionIds.length === 0;
  const results: CategoryResult[] = [];
  let totalScore = 0;

  for (const category of schema.categories) {
    const categoryQuestions = schema.questions.filter(q => q.categoryId === category.id);

    let catScore = 0;
    let minPossibleScore = 0;
    let maxPossibleScore = 0;

    for (const q of categoryQuestions) {
      const resp = responses[q.id];
      if (resp && typeof resp.score === 'number') {
        catScore += resp.score;
      }

      const scores = q.options.map(o => o.score);
      minPossibleScore += Math.min(...scores);
      maxPossibleScore += Math.max(...scores);
    }

    totalScore += catScore;

    // Find severity threshold
    const catThresholds = schema.thresholds[category.id] || [];
    let appliedThreshold = catThresholds[catThresholds.length - 1]; // default to highest

    for (const t of catThresholds) {
      if (catScore <= t.maxScore) {
        appliedThreshold = t;
        break;
      }
    }

    results.push({
      categoryId: category.id,
      categoryName: category.name,
      score: catScore,
      minPossibleScore,
      maxPossibleScore,
      severityLabel: appliedThreshold ? appliedThreshold.label : 'Mild',
      color: appliedThreshold ? appliedThreshold.color : '#34d399',
      message: appliedThreshold ? appliedThreshold.message : ''
    });
  }

  return {
    results,
    totalScore,
    isComplete,
    unansweredQuestionIds
  };
}

/**
 * Builds the structured webhook payload containing serialized parameter data.
 */
export function buildAssessmentWebhookPayload(
  results: CategoryResult[],
  context: WebhookContext = {}
): AssessmentWebhookPayload {
  const parameter = results.map((cat, idx) => ({
    id: idx + 1,
    value: `{${cat.categoryName}:${cat.score}}`
  }));

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const upaId = context.upaId || urlParams.get('upa_id');
  const uid = context.uid || urlParams.get('uid');
  const entryId = context.entryId || urlParams.get('entry_id') || '{entry_id}';
  const formId = context.formId || urlParams.get('form_id') || '{form_id}';
  const activityId = context.activityId || 'emotional-wellbeing-assessment';

  return {
    intent: 'complete_activity',
    entry_id: String(entryId),
    activity_id: String(activityId),
    parameter,
    upa_id: upaId ? Number(upaId) : undefined,
    form_id: String(formId),
    uid: uid ? String(uid) : undefined
  };
}

// Backward compatibility alias
export const calculateScores = (schema: AssessmentSchema, rawAnswers: Record<string, number | AssessmentResponse>) => {
  const normalizedResponses: Record<string, AssessmentResponse> = {};

  for (const q of schema.questions) {
    const item = rawAnswers[q.id];
    if (item && typeof item === 'object' && 'score' in item) {
      normalizedResponses[q.id] = item as AssessmentResponse;
    } else if (typeof item === 'number') {
      const matchedOpt = q.options.find(o => o.score === item) || q.options[0];
      normalizedResponses[q.id] = {
        questionId: q.id,
        response: matchedOpt?.label || '',
        score: item,
        categoryId: q.categoryId
      };
    }
  }

  return calculateAssessmentResults(normalizedResponses, schema);
};
