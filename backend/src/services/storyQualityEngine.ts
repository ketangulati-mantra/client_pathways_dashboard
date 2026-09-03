import { ComposedStoryChapter, NarrativeMemory } from './storyComposerService.js';
import { StoryPersonalization } from './storyPersonalizationService.js';
import { StoryContext } from './storyContextService.js';

export interface QualityReport {
  overallScore: number;
  isSufficient: boolean;
  breakdown: {
    personalizationScore: number;
    wordCountScore: number;
    continuityScore: number;
    readabilityScore: number;
    antiGenericityScore: number;
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
  'unspoken',
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
  'stillness',
  'correspondence',
  'destiny',
  'ancient secrets'
];

export const storyQualityEngine = {
  /**
   * Evaluates the story for simple, natural language, deep personalization,
   * clear human dialogue, and emotional truth.
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

    // 1. Personalization Depth Evaluation (0 - 10)
    let personalScore = 0;
    const truths = personalization.personalTruths;

    // Check Sensory Anchor presence
    if (truths.sensory_anchors.some((a) => {
      const anchorKeywords = a.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      return anchorKeywords.some((k) => content.includes(k));
    })) {
      personalScore += 3.0;
      detectedDimensions.push('Sensory Anchor');
    }

    // Check Daily Arc Grounding
    if (truths.dailyArc && truths.dailyArc.keywords.some((k) => content.includes(k))) {
      personalScore += 3.0;
      detectedDimensions.push('Daily Arc Context');
    }

    // Check Emotional Alignment
    if (truths.emotional_truths.length > 0) {
      personalScore += 2.0;
      detectedDimensions.push('Emotional Alignment');
    }

    // Check Growth Signal
    if (truths.growth_truths.length > 0) {
      personalScore += 2.0;
      detectedDimensions.push('Growth Arc');
    }

    personalScore = Math.min(10, personalScore);

    // 2. Word Count Score (0 - 10, target 450 - 850 words for mobile reading)
    let wordCountScore = 10;
    if (wordCount < 350) {
      wordCountScore = Math.max(2, (wordCount / 350) * 6);
      reasons.push(`Word count (${wordCount}) is too short.`);
    } else if (wordCount < 450) {
      wordCountScore = 8.5;
    } else if (wordCount <= 900) {
      wordCountScore = 10.0;
    } else {
      wordCountScore = Math.max(7, 10 - (wordCount - 900) / 100);
    }

    // 3. Continuity & Motif Score (0 - 10)
    let continuityScore = 8.0;
    if (chapter.metadata.symbolsUsed && chapter.metadata.symbolsUsed.length > 0) {
      const symbolFound = chapter.metadata.symbolsUsed.some((s) => content.includes(s.toLowerCase()));
      if (symbolFound) continuityScore += 1.0;
    }
    if (chapter.openThreads && chapter.openThreads.length > 0) {
      continuityScore += 1.0;
    }
    continuityScore = Math.min(10, continuityScore);

    // 4. Readability & Natural Language Score (0 - 10)
    let readabilityScore = 10.0;
    BANNED_PURPLE_PROSE.forEach((banned) => {
      if (content.includes(banned)) {
        readabilityScore -= 2.0;
        penalizedPhrases.push(banned);
      }
    });
    readabilityScore = Math.max(0, readabilityScore);

    // 5. Anti-Genericity Evaluation (0 - 10)
    let antiGenericityScore = 10.0;
    if (detectedDimensions.length < 2) {
      antiGenericityScore -= 3.0;
      reasons.push('Chapter lacks specific emotional and daily anchors from user data.');
    }
    antiGenericityScore = Math.max(0, antiGenericityScore);

    // 6. Overall Weighted Score
    const overallScore = Number(
      (
        personalScore * 0.35 +
        readabilityScore * 0.25 +
        wordCountScore * 0.15 +
        continuityScore * 0.15 +
        antiGenericityScore * 0.1
      ).toFixed(2)
    );

    const isSufficient = overallScore >= 7.5 && wordCount >= 380 && penalizedPhrases.length === 0;

    return {
      overallScore,
      isSufficient,
      breakdown: {
        personalizationScore: personalScore,
        wordCountScore,
        continuityScore,
        readabilityScore,
        antiGenericityScore,
        wordCount
      },
      detectedPersonalDimensions: detectedDimensions,
      penalizedPhrases,
      reasons
    };
  }
};
