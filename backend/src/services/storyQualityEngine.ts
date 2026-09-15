import { ComposedStoryChapter, NarrativeMemory } from './storyComposerService.js';
import { StoryPersonalization } from './storyPersonalizationService.js';
import { StoryContext } from './storyContextService.js';

export interface QualityReport {
  overallScore: number;
  isSufficient: boolean;
  breakdown: {
    personalRelevanceScore: number;
    emotionalAccuracyScore: number;
    userDataUsageScore: number;
    fantasyImmersionScore: number;
    curiosityScore: number;
    readabilityScore: number;
    wordCount: number;
  };
  detectedPersonalDimensions: string[];
  penalizedPhrases: string[];
  reasons: string[];
}

// Strictly penalize purple prose and unnecessarily complicated words
const BANNED_PURPLE_PROSE = [
  'ethereal',
  'profound',
  'transcendence',
  'melancholy',
  'wistful',
  'solace',
  'reverie',
  'luminous',
  'ephemeral',
  'enigmatic',
  'beckoning',
  'weary',
  'threshold',
  'sanctuary',
  'unfolding',
  'correspondence',
  'destiny',
  'ancient secrets'
];

// Detect generic "wisdom" statements that preach rather than show
const PREACHING_PATTERNS = [
  'you realized with quiet certainty',
  'showing up for yourself is always the right choice',
  'taking care of yourself isn\'t something you have to earn',
  'you don\'t have to carry yesterday\'s worries',
  'stepping back doesn\'t mean falling behind',
  'whatever tomorrow brings, you know you can',
  'you are more than your',
  'the universe was telling you',
  'trust the process',
  'everything happens for a reason',
  'you are exactly where you need to be',
  'this is your journey',
  'the path chose you'
];

export const storyQualityEngine = {
  /**
   * Evaluates story quality across 6 dimensions:
   * 1. Personal Relevance: Does this feel like THIS user's story?
   * 2. Emotional Accuracy: Do the emotions match what the user reported?
   * 3. User Data Usage: Are the user's actual words/situations/people present?
   * 4. Fantasy Immersion: Does the world feel real and engaging?
   * 5. Curiosity: Does the chapter make you want to read the next one?
   * 6. Readability: Is the language simple, natural, and jargon-free?
   */
  evaluateChapterQuality(
    chapter: ComposedStoryChapter,
    personalization: StoryPersonalization,
    context: StoryContext,
    memory?: NarrativeMemory
  ): QualityReport {
    const content = chapter.content.toLowerCase();
    const words = chapter.content.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const detectedDimensions: string[] = [];
    const reasons: string[] = [];
    const penalizedPhrases: string[] = [];

    const truths = personalization.personalTruths;
    const dailyArc = truths.dailyArc;

    // ======================================================
    // 1. PERSONAL RELEVANCE (0 - 10)
    //    "Could this chapter belong to a DIFFERENT user?"
    //    If yes, score is low.
    // ======================================================
    let personalRelevanceScore = 0;

    // Check if user's actual keywords appear in the story text
    const userKeywordsInText = (dailyArc?.keywords || []).filter((k) => content.includes(k));
    if (userKeywordsInText.length >= 3) {
      personalRelevanceScore += 4;
      detectedDimensions.push(`User Keywords (${userKeywordsInText.length})`);
    } else if (userKeywordsInText.length >= 1) {
      personalRelevanceScore += 2;
      detectedDimensions.push(`User Keywords (${userKeywordsInText.length})`);
    }

    // Check if user-mentioned people appear
    const userPeopleInText = (dailyArc?.userMentionedPeople || []).filter((p) => content.includes(p));
    if (userPeopleInText.length > 0) {
      personalRelevanceScore += 2;
      detectedDimensions.push(`User People (${userPeopleInText.join(', ')})`);
    }

    // Check if user-mentioned activities appear
    const userActivitiesInText = (dailyArc?.userMentionedActivities || []).filter((a) => content.includes(a));
    if (userActivitiesInText.length > 0) {
      personalRelevanceScore += 2;
      detectedDimensions.push(`User Activities (${userActivitiesInText.join(', ')})`);
    }

    // Check if user-mentioned struggles appear
    const userStrugglesInText = (dailyArc?.userMentionedStruggles || []).filter((s) => content.includes(s));
    if (userStrugglesInText.length > 0) {
      personalRelevanceScore += 2;
      detectedDimensions.push(`User Struggles (${userStrugglesInText.join(', ')})`);
    }

    personalRelevanceScore = Math.min(10, personalRelevanceScore);

    // "Could belong to someone else" gate
    const totalUserSignalsInText = userKeywordsInText.length + userPeopleInText.length +
      userActivitiesInText.length + userStrugglesInText.length;
    if (totalUserSignalsInText < 2 && (dailyArc?.keywords || []).length > 0) {
      personalRelevanceScore = Math.min(personalRelevanceScore, 4);
      reasons.push('CRITICAL: Chapter could belong to ANY user — too few of the user\'s actual signals appear in the text.');
    }

    // ======================================================
    // 2. EMOTIONAL ACCURACY (0 - 10)
    //    Do the story emotions match reported emotions?
    // ======================================================
    let emotionalAccuracyScore = 5; // base

    const reportedEmotions = (context.recentContext.emotions || []).map((e) => e.emotion.toLowerCase());
    const storyMentionsEmotions = reportedEmotions.filter((e) => content.includes(e));
    if (storyMentionsEmotions.length > 0) {
      emotionalAccuracyScore += Math.min(3, storyMentionsEmotions.length * 1.5);
      detectedDimensions.push('Emotional Alignment');
    }

    // Check the resulting state matches
    if (dailyArc?.resultingState && content.includes(dailyArc.resultingState.split(' ')[0])) {
      emotionalAccuracyScore += 2;
      detectedDimensions.push('Arc Resolution');
    }

    emotionalAccuracyScore = Math.min(10, emotionalAccuracyScore);

    // ======================================================
    // 3. USER DATA USAGE (0 - 10)
    //    Are sensory anchors, growth truths, situational truths present?
    // ======================================================
    let userDataUsageScore = 0;

    // Sensory anchors
    if (truths.sensory_anchors.some((a) => {
      const anchorKeywords = a.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      return anchorKeywords.some((k) => content.includes(k));
    })) {
      userDataUsageScore += 3;
      detectedDimensions.push('Sensory Anchor');
    }

    // Growth truths
    if (truths.growth_truths.length > 0 && truths.growth_truths.some((g) => {
      const growthWords = g.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      return growthWords.some((w) => content.includes(w));
    })) {
      userDataUsageScore += 3;
      detectedDimensions.push('Growth Truth');
    }

    // Situational truths
    if (truths.situational_truths.length > 0) {
      userDataUsageScore += 2;
      detectedDimensions.push('Situational Context');
    }

    // Relationship truths
    if (truths.relationship_truths.length > 0) {
      userDataUsageScore += 2;
      detectedDimensions.push('Relationship Context');
    }

    userDataUsageScore = Math.min(10, userDataUsageScore);

    // ======================================================
    // 4. FANTASY IMMERSION (0 - 10)
    //    Does the world feel real? Are motifs/locations present?
    // ======================================================
    let fantasyImmersionScore = 6; // base for having a world at all

    if (chapter.metadata.symbolsUsed && chapter.metadata.symbolsUsed.length > 0) {
      const symbolFound = chapter.metadata.symbolsUsed.some((s) => content.includes(s.toLowerCase()));
      if (symbolFound) {
        fantasyImmersionScore += 2;
        detectedDimensions.push('Motif Present');
      }
    }
    if (chapter.openThreads && chapter.openThreads.length > 0) {
      fantasyImmersionScore += 2;
      detectedDimensions.push('Open Thread');
    }
    fantasyImmersionScore = Math.min(10, fantasyImmersionScore);

    // ======================================================
    // 5. CURIOSITY / SUSPENSE (0 - 10)
    //    Does the chapter end with something that pulls you forward?
    // ======================================================
    let curiosityScore = 6;
    if (chapter.metadata.suspenseType) {
      curiosityScore += 2;
    }
    // Check word count — too short means not enough room for suspense
    if (wordCount >= 400) {
      curiosityScore += 2;
    }
    curiosityScore = Math.min(10, curiosityScore);

    // ======================================================
    // 6. READABILITY (0 - 10)
    //    Simple, natural language. No purple prose. No preaching.
    // ======================================================
    let readabilityScore = 10.0;

    // Penalize purple prose
    BANNED_PURPLE_PROSE.forEach((banned) => {
      if (content.includes(banned)) {
        readabilityScore -= 2.0;
        penalizedPhrases.push(`[purple] ${banned}`);
      }
    });

    // Penalize preaching / generic wisdom statements
    PREACHING_PATTERNS.forEach((pattern) => {
      if (content.includes(pattern.toLowerCase())) {
        readabilityScore -= 1.5;
        penalizedPhrases.push(`[preaching] ${pattern}`);
        reasons.push(`Contains generic wisdom/preaching: "${pattern}"`);
      }
    });

    readabilityScore = Math.max(0, readabilityScore);

    // ======================================================
    // OVERALL WEIGHTED SCORE
    // ======================================================
    const overallScore = Number(
      (
        personalRelevanceScore * 0.30 +
        emotionalAccuracyScore * 0.20 +
        userDataUsageScore * 0.20 +
        fantasyImmersionScore * 0.10 +
        curiosityScore * 0.05 +
        readabilityScore * 0.15
      ).toFixed(2)
    );

    // Sufficient: overall >= 7.5, word count adequate, no penalized phrases, personal relevance >= 6
    const isSufficient = overallScore >= 7.5 &&
      wordCount >= 380 &&
      penalizedPhrases.length === 0 &&
      personalRelevanceScore >= 6;

    if (personalRelevanceScore < 6) {
      reasons.push('Personal relevance below 6/10 — chapter should be rewritten with more user-specific signals.');
    }

    return {
      overallScore,
      isSufficient,
      breakdown: {
        personalRelevanceScore,
        emotionalAccuracyScore,
        userDataUsageScore,
        fantasyImmersionScore,
        curiosityScore,
        readabilityScore,
        wordCount
      },
      detectedPersonalDimensions: detectedDimensions,
      penalizedPhrases,
      reasons
    };
  }
};
