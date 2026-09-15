import { StoryContext, ThematicSignal } from './storyContextService.js';
import { StoryState } from './storyService.js';
import { NarrativeFacts } from './storyContinuityService.js';

export type MotifStage = 'introduced' | 'recurring' | 'transforming' | 'resolved';

export interface NarrativeMotif {
  id: string;
  motif: string;
  meaning: string;
  stage: MotifStage;
  strength: number;
}

export interface DailyEmotionalArc {
  startingTension: string;
  realWorldContext: string;
  turningPoint: string;
  resultingState: string;
  keywords: string[];
  userPhrases?: string[];
  userMentionedPeople?: string[];
  userMentionedActivities?: string[];
  userMentionedStruggles?: string[];
  userMentionedRelief?: string[];
}

export interface PersonalTruths {
  emotional_truths: string[];
  situational_truths: string[];
  relationship_truths: string[];
  growth_truths: string[];
  tensions: string[];
  sensory_anchors: string[];
  dailyArc: DailyEmotionalArc;
  sources: { source_type: 'journal_entry' | 'daily_check_in'; source_id: string | number }[];
}

export interface StoryPersonalization {
  personalTruths: PersonalTruths;
  emotionalLandscape: {
    currentTone: string;
    recentShift: string | null;
    volatility: 'low' | 'medium' | 'high';
  };
  recurringThemes: Array<{
    theme: string;
    strength: number;
    persistence: 'emerging' | 'recurring' | 'dominant';
  }>;
  growthArc: {
    signals: string[];
    direction: 'emerging' | 'developing' | 'strengthening' | 'unclear';
  };
  narrativeMotifs: NarrativeMotif[];
  adaptiveWorldElements: {
    emergingLocations: string[];
    atmosphericShift: string;
    worldAffinity: string;
  };
  emergentCharacters: Array<{
    name: string;
    role: string;
    status: 'active' | 'departed' | 'mentioned';
  }>;
  personalizationConfidence: 'none' | 'low' | 'medium' | 'high';
}

// Plain-Language Motif Family Matrix based on real-world situations
const MOTIF_FAMILIES = {
  communication: [
    { id: 'motif_letter', base: 'a folded letter waiting on the table', meaning: 'words waiting to be said' },
    { id: 'motif_listening_bell', base: 'a small bronze bell by the door', meaning: 'listening without interrupting' },
    { id: 'motif_stone_bridge', base: 'a narrow stone footbridge across the stream', meaning: 'reaching out across the distance' }
  ],
  rest_recharge: [
    { id: 'motif_hearth', base: 'a warm hearth with low embers', meaning: 'a safe place to set down your pack' },
    { id: 'motif_moss_alcove', base: 'a dry cedar bench under the trees', meaning: 'permission to stop and breathe' },
    { id: 'motif_tide_pool', base: 'a still pool of clear water', meaning: 'quiet when everything else is moving' }
  ],
  work_pressure: [
    { id: 'motif_heavy_lantern', base: 'a leather pack filled with unread books', meaning: 'carrying more tasks than you need to' },
    { id: 'motif_waterclock', base: 'a slow water clock on the wall', meaning: 'taking your time instead of rushing' },
    { id: 'motif_sandstone_arch', base: 'a wooden latch that stays closed', meaning: 'protecting your time and energy' }
  ],
  self_compassion: [
    { id: 'motif_observatory_lens', base: 'a clean glass lens that makes things clear', meaning: 'treating yourself with patience' },
    { id: 'motif_carved_key', base: 'a small wooden key in your pocket', meaning: 'trusting what you already know' },
    { id: 'motif_river_gem', base: 'a smooth river stone held in your palm', meaning: 'small progress made one day at a time' }
  ],
  ease_gratitude: [
    { id: 'motif_tea_cup', base: 'a warm clay cup of tea', meaning: 'savoring a simple moment of peace' },
    { id: 'motif_morning_sunbeam', base: 'a warm patch of morning sun on the porch', meaning: 'quiet joy in an ordinary day' }
  ]
};

export const storyPersonalizationService = {
  /**
   * Extracts a single coherent daily arc from all available check-ins and journal entries.
   * Pulls the user's ACTUAL words, situations, people, activities, and concerns
   * to build the arc. Never invents facts the user didn't provide.
   */
  extractDailyArc(context: StoryContext): DailyEmotionalArc {
    const rawText = (context.recentContext.reflectionsSummary || '');
    const text = rawText.toLowerCase();
    const emotions = (context.recentContext.emotions || []).map((e) => e.emotion.toLowerCase());
    const situations = context.recentContext.situations || [];

    // Extract user's actual keywords present in their reflections
    const keywords: string[] = [];
    const KEYWORD_POOL = [
      'study', 'exam', 'deadline', 'work', 'meeting', 'friend', 'friends',
      'talk', 'family', 'alone', 'quiet', 'tea', 'walk', 'rain', 'sleep',
      'tired', 'overwhelmed', 'scared', 'control', 'break', 'rest',
      'partner', 'mom', 'dad', 'sister', 'brother', 'boss', 'class',
      'project', 'presentation', 'interview', 'money', 'home', 'morning',
      'evening', 'night', 'coffee', 'phone', 'gym', 'run', 'cook',
      'read', 'music', 'breathe', 'cry', 'laugh', 'angry', 'frustrated',
      'happy', 'grateful', 'anxious', 'stress', 'pressure', 'balance',
      'boundaries', 'decision', 'change', 'letting go', 'moving on',
      'stuck', 'progress', 'proud', 'lost', 'confused', 'hopeful'
    ];
    KEYWORD_POOL.forEach((k) => { if (text.includes(k)) keywords.push(k); });

    // Extract short user phrases (2-4 word fragments from their actual text)
    const userPhrases: string[] = [];
    const sentences = rawText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10 && s.length < 120);
    sentences.forEach((s) => {
      // Take the most emotionally loaded fragment from each sentence
      const cleaned = s.replace(/^(I |i |My |my |Today |today |This |this )/i, '').trim();
      if (cleaned.length > 8 && cleaned.length < 80) {
        userPhrases.push(cleaned);
      }
    });

    // Build SPECIFIC tension from user's actual signals
    const userMentionedPeople: string[] = [];
    ['friend', 'friends', 'partner', 'mom', 'dad', 'family', 'sister', 'brother', 'boss', 'colleague'].forEach((p) => {
      if (text.includes(p)) userMentionedPeople.push(p);
    });

    const userMentionedActivities: string[] = [];
    ['studying', 'study', 'working', 'work', 'meeting', 'class', 'cooking', 'walking', 'running', 'reading', 'gym', 'presentation', 'interview'].forEach((a) => {
      if (text.includes(a)) userMentionedActivities.push(a);
    });

    const userMentionedStruggles: string[] = [];
    ['overwhelmed', 'scared', 'anxious', 'stressed', 'tired', 'exhausted', 'pressure', 'control', 'stuck', 'lost', 'confused', 'frustrated', 'angry', 'lonely', 'behind'].forEach((s) => {
      if (text.includes(s)) userMentionedStruggles.push(s);
    });

    const userMentionedRelief: string[] = [];
    ['lighter', 'better', 'relieved', 'calm', 'peaceful', 'grateful', 'happy', 'hopeful', 'proud', 'break', 'rest', 'quiet', 'tea', 'walk', 'breathe'].forEach((r) => {
      if (text.includes(r)) userMentionedRelief.push(r);
    });

    // Build the arc from REAL signals, not canned prose
    // Starting tension: What the user actually said was hard
    let startingTension = '';
    if (userMentionedStruggles.length > 0 && userMentionedActivities.length > 0) {
      startingTension = `The ${userMentionedActivities[0]} had been weighing on you. You felt ${userMentionedStruggles.join(' and ')}, and the day hadn't given you much room to catch your breath.`;
    } else if (userMentionedStruggles.length > 0) {
      startingTension = `You had been feeling ${userMentionedStruggles.join(' and ')} lately, and today it sat heavier than usual.`;
    } else if (userMentionedActivities.length > 0) {
      startingTension = `The ${userMentionedActivities[0]} took up most of your day, leaving you with little space for anything else.`;
    } else if (userPhrases.length > 0) {
      startingTension = `Something had been sitting with you today. ${userPhrases[0].charAt(0).toUpperCase() + userPhrases[0].slice(1)}.`;
    } else {
      startingTension = 'The day had asked a lot of you, even if it was hard to name exactly why.';
    }

    // Real world context: What specifically happened
    let realWorldContext = '';
    const contextParts: string[] = [];
    if (userMentionedActivities.length > 0) contextParts.push(userMentionedActivities.join(' and '));
    if (userMentionedStruggles.length > 0) contextParts.push(`feeling ${userMentionedStruggles[0]}`);
    if (userMentionedPeople.length > 0) contextParts.push(`time with ${userMentionedPeople.join(' and ')}`);
    if (situations.length > 0) contextParts.push(situations.join(', '));
    realWorldContext = contextParts.length > 0 ? contextParts.join(', ') : 'getting through a full day';

    // Turning point: What actually helped (from user data)
    let turningPoint = '';
    if (userMentionedPeople.length > 0 && userMentionedRelief.length > 0) {
      turningPoint = `Being with ${userMentionedPeople[0]} made things feel ${userMentionedRelief[0]}.`;
    } else if (userMentionedRelief.length > 0) {
      turningPoint = `Taking a moment to ${userMentionedRelief[0]} shifted something inside you.`;
    } else if (userPhrases.length > 1) {
      turningPoint = `${userPhrases[userPhrases.length - 1].charAt(0).toUpperCase() + userPhrases[userPhrases.length - 1].slice(1)}.`;
    } else {
      turningPoint = 'Stopping to notice how you actually felt was the first honest thing you did for yourself today.';
    }

    // Resulting state: How the user ended up (from emotions)
    let resultingState = '';
    const positiveEmotions = emotions.filter(e => ['calm', 'peaceful', 'relieved', 'content', 'happy', 'grateful', 'grounded', 'hopeful'].includes(e));
    const heavyEmotions = emotions.filter(e => ['overwhelmed', 'anxious', 'stressed', 'frustrated', 'angry', 'exhausted', 'sad', 'lonely', 'tired'].includes(e));
    if (positiveEmotions.length > 0) {
      resultingState = positiveEmotions.join(' and ');
    } else if (heavyEmotions.length > 0) {
      resultingState = `still carrying some ${heavyEmotions[0]}, but aware of it now`;
    } else {
      resultingState = 'quiet and present';
    }

    return {
      startingTension,
      realWorldContext,
      turningPoint,
      resultingState,
      keywords,
      userPhrases,
      userMentionedPeople,
      userMentionedActivities,
      userMentionedStruggles,
      userMentionedRelief
    };
  },

  /**
   * Extracts grounded PersonalTruths strictly from user reflections, check-in emotions, and growth notes.
   * NEVER infers psychological diagnoses or clinical traits.
   */
  extractPersonalTruths(context: StoryContext): PersonalTruths {
    const emotional_truths: string[] = [];
    const situational_truths: string[] = [];
    const relationship_truths: string[] = [];
    const growth_truths: string[] = [];
    const tensions: string[] = [];
    const sensory_anchors: string[] = [];

    const emotions = (context.recentContext.emotions || []).map((e) => e.emotion.toLowerCase());
    const themes = (context.storyRelevantSignals.dominantThemes || []).map((t) => t.toLowerCase());
    const reflectionsText = (context.recentContext.reflectionsSummary || '').toLowerCase();
    const dailyArc = this.extractDailyArc(context);

    // 1. Sensory Anchors (Everyday, simple details)
    const SENSORY_KEYWORDS = [
      { word: 'tea', anchor: 'a warm cup of tea held in both hands' },
      { word: 'coffee', anchor: 'the smell of fresh coffee in the quiet kitchen' },
      { word: 'walk', anchor: 'a quiet walk outside in the evening air' },
      { word: 'rain', anchor: 'rain tapping softly against the window glass' },
      { word: 'sun', anchor: 'warm morning sunlight on the wooden floor' },
      { word: 'night', anchor: 'the dark, quiet sky outside your window' },
      { word: 'music', anchor: 'a familiar song playing softly in the background' },
      { word: 'desk', anchor: 'a wooden desk with papers neatly set aside' },
      { word: 'porch', anchor: 'a wooden bench on the porch catching the breeze' },
      { word: 'breath', anchor: 'taking one slow, full breath and letting your shoulders drop' }
    ];

    SENSORY_KEYWORDS.forEach((s) => {
      if (reflectionsText.includes(s.word) && !sensory_anchors.includes(s.anchor)) {
        sensory_anchors.push(s.anchor);
      }
    });

    if (sensory_anchors.length === 0) {
      sensory_anchors.push('the clean smell of cool evening air after rain');
    }

    // 2. Situational & Work/Study Truths
    if (
      themes.includes('work_pressure') ||
      reflectionsText.includes('study') ||
      reflectionsText.includes('exam') ||
      reflectionsText.includes('deadline') ||
      reflectionsText.includes('project') ||
      reflectionsText.includes('busy')
    ) {
      situational_truths.push('User carries the weight of demanding obligations and unfinished tasks.');
      tensions.push('The tension between high inner standards and the physical need for respite.');
    }

    if (
      themes.includes('rest_recharge') ||
      reflectionsText.includes('break') ||
      reflectionsText.includes('sleep') ||
      reflectionsText.includes('tired') ||
      reflectionsText.includes('exhausted')
    ) {
      situational_truths.push('User experiences significant restoration when given permission to pause.');
    }

    // 3. Relationship & Social Context Truths
    if (
      themes.includes('communication') ||
      reflectionsText.includes('friend') ||
      reflectionsText.includes('talk') ||
      reflectionsText.includes('family') ||
      reflectionsText.includes('partner') ||
      reflectionsText.includes('conversation') ||
      reflectionsText.includes('bridge') ||
      reflectionsText.includes('words')
    ) {
      relationship_truths.push('Shared connection and presence with others provides grounding perspective.');
    }

    if (
      reflectionsText.includes('alone') ||
      reflectionsText.includes('lonely') ||
      reflectionsText.includes('misunderstood') ||
      reflectionsText.includes('distance') ||
      reflectionsText.includes('unspoken')
    ) {
      relationship_truths.push('User seeks deeper resonance and authentic understanding in interpersonal spaces.');
      tensions.push('The longing to reach out across distances while guarding vulnerable boundaries.');
    }

    // 4. Emotional Truths
    if (emotions.some((e) => ['stressed', 'overwhelmed', 'anxious', 'frustrated'].includes(e))) {
      emotional_truths.push('User is actively navigating heavy cognitive load and seeking calm clarity.');
    } else if (emotions.some((e) => ['calm', 'grounded', 'peaceful', 'content'].includes(e))) {
      emotional_truths.push('User is resting in a centered, settled space of personal equilibrium.');
    } else if (emotions.some((e) => ['curious', 'hopeful', 'inspired', 'excited'].includes(e))) {
      emotional_truths.push('User is experiencing an opening of curiosity and forward-looking energy.');
    } else {
      emotional_truths.push('User is observing their unfolding life with quiet attentiveness.');
    }

    // 5. Growth Truths
    (context.growthSignals || []).forEach((g) => {
      growth_truths.push(g.description);
    });

    if (reflectionsText.includes('letting go') || reflectionsText.includes('releasing') || reflectionsText.includes('new chapter')) {
      growth_truths.push('Releasing outgrown expectations to weave a fresh direction.');
    }

    if (growth_truths.length === 0) {
      if (context.emotionalDirection.status === 'improving') {
        growth_truths.push('Consciously creating space for ease and stepping away from strain.');
      } else {
        growth_truths.push('Choosing to acknowledge current limits with patience.');
      }
    }

    return {
      emotional_truths,
      situational_truths,
      relationship_truths,
      growth_truths,
      tensions,
      sensory_anchors,
      dailyArc,
      sources: context.sourceInputs
    };
  },

  /**
   * Transforms raw StoryContext and existing StoryState into an evidence-based, dynamic Personalization layer.
   * Does NOT permanently store clinical or personality facts.
   */
  derivePersonalization(
    context: StoryContext,
    currentState: StoryState
  ): StoryPersonalization {
    const confidence = context.dataConfidence.level;
    const isSparse = confidence === 'none' || confidence === 'low';
    const personalTruths = this.extractPersonalTruths(context);
    const reflectionsText = (context.recentContext.reflectionsSummary || '').toLowerCase();

    // 1. Determine Emotional Shift / Trajectory Delta
    let recentShift: string | null = null;
    let atmosphericShift = 'gentle_morning_calm';

    if (context.emotionalDirection.status === 'improving') {
      recentShift = 'heavy_to_grounded';
      atmosphericShift = 'shifting mist parting for warm, steady starlight';
    } else if (context.emotionalDirection.status === 'difficult') {
      recentShift = 'overwhelmed_to_seeking_shelter';
      atmosphericShift = 'gathering coastal winds asking for a sheltered haven';
    } else if (context.emotionalDirection.status === 'fluctuating') {
      recentShift = 'uncertain_to_curious';
      atmosphericShift = 'changing tides revealing hidden tidal stone pathways';
    }

    // 2. Assess Volatility
    const emotions = context.recentContext.emotions;
    let volatility: 'low' | 'medium' | 'high' = 'low';
    if (emotions.length >= 4) {
      const distinctZones = new Set(emotions.map((e) => e.emotion));
      if (distinctZones.size >= 3) volatility = 'high';
      else if (distinctZones.size >= 2) volatility = 'medium';
    }

    // 3. Identify Recurring Themes with Strength
    const recurringThemes = (context.recentContext.themes || []).map((t) => {
      let persistence: 'emerging' | 'recurring' | 'dominant' = 'emerging';
      if (t.frequency >= 3) persistence = 'dominant';
      else if (t.frequency >= 2) persistence = 'recurring';

      return {
        theme: t.theme,
        strength: Math.min(5, t.frequency + 1),
        persistence
      };
    });

    // 4. Derive Growth Arc Direction
    const growthSignalsList = personalTruths.growth_truths;
    let growthDirection: 'emerging' | 'developing' | 'strengthening' | 'unclear' = 'unclear';
    if (growthSignalsList.length >= 2) growthDirection = 'strengthening';
    else if (growthSignalsList.length === 1) growthDirection = 'developing';
    else if (!isSparse) growthDirection = 'emerging';

    // 5. Derive & Evolve Narrative Motifs (Max 1-3 active with 4-stage evolution)
    const existingMotifsMap = new Map<string, NarrativeMotif>();
    const existingSymbols = currentState.narrative_facts?.symbols || [];

    existingSymbols.forEach((s) => {
      existingMotifsMap.set(s.symbol.toLowerCase(), {
        id: `motif_${s.symbol.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        motif: s.symbol,
        meaning: s.meaning,
        stage: 'recurring',
        strength: 3
      });
    });

    const activeMotifs: NarrativeMotif[] = [];

    // Prioritize active dominant themes or extracted truths
    const primaryTheme =
      (context.storyRelevantSignals.dominantThemes[0] as keyof typeof MOTIF_FAMILIES) ||
      (personalTruths.relationship_truths.length > 0 ? 'communication' : null) ||
      (personalTruths.situational_truths.length > 0 ? 'work_pressure' : null) ||
      (personalTruths.growth_truths.length > 0 ? 'self_compassion' : null) ||
      'self_compassion';

    const family = MOTIF_FAMILIES[primaryTheme] || MOTIF_FAMILIES.self_compassion;
    const userHash = context.userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const chosenTemplate = family[userHash % family.length];

    const existing = existingMotifsMap.get(chosenTemplate.base.toLowerCase());
    if (existing) {
      let nextStage: MotifStage = 'recurring';
      if (currentState.current_chapter_number >= 3) nextStage = 'transforming';
      if (currentState.current_chapter_number >= 6) nextStage = 'resolved';

      activeMotifs.push({
        ...existing,
        stage: nextStage,
        strength: Math.min(5, existing.strength + 1)
      });
    } else {
      activeMotifs.push({
        id: chosenTemplate.id,
        motif: chosenTemplate.base,
        meaning: chosenTemplate.meaning,
        stage: currentState.current_chapter_number === 0 ? 'introduced' : 'recurring',
        strength: 1
      });
    }

    // Retain persistent motifs up to 3
    existingMotifsMap.forEach((m) => {
      if (!activeMotifs.some((am) => am.id === m.id) && activeMotifs.length < 3) {
        activeMotifs.push(m);
      }
    });

    // 6. Emerging Locations & World Adaptation
    const emergingLocations: string[] = [];
    if (context.storyRelevantSignals.dominantThemes.includes('communication') || personalTruths.relationship_truths.length > 0) {
      emergingLocations.push('The High Belltower of Correspondence');
    }
    if (context.storyRelevantSignals.dominantThemes.includes('rest_recharge')) {
      emergingLocations.push('The Sunken Haven by the Tidal Flats');
    }
    if (context.storyRelevantSignals.dominantThemes.includes('self_compassion')) {
      emergingLocations.push('The Stone Observatory of Quiet Cartography');
    }

    // 7. Emergent Characters (Gradual emergence: max 1-2 active)
    const emergentCharacters = (currentState.narrative_facts?.characters || []).slice(0, 2);

    // 8. World Affinity based on Dominant User Signal
    let worldAffinity = 'coastal_haven';
    if (reflectionsText.includes('bridge') || reflectionsText.includes('unspoken') || (personalTruths.relationship_truths.length > 0 && (reflectionsText.includes('words') || reflectionsText.includes('conversation') || reflectionsText.includes('talk')))) {
      worldAffinity = 'mountain_bridges';
    } else if (reflectionsText.includes('letting go') || reflectionsText.includes('office') || reflectionsText.includes('new chapter') || reflectionsText.includes('releasing')) {
      worldAffinity = 'weaving_hall';
    } else if (reflectionsText.includes('study') || reflectionsText.includes('exam') || reflectionsText.includes('maps') || reflectionsText.includes('satchel')) {
      worldAffinity = 'cartographic_archive';
    } else if (reflectionsText.includes('meeting') || reflectionsText.includes('deliverable') || reflectionsText.includes('machine') || reflectionsText.includes('laptop') || reflectionsText.includes('delay') || reflectionsText.includes('busy')) {
      worldAffinity = 'clocktower_slackwater';
    } else if (reflectionsText.includes('rain') || reflectionsText.includes('lonely') || reflectionsText.includes('alone') || reflectionsText.includes('solitary')) {
      worldAffinity = 'coastal_haven';
    } else if (context.storyRelevantSignals.dominantThemes.includes('rest_recharge') || reflectionsText.includes('sleep') || reflectionsText.includes('tired')) {
      worldAffinity = 'sunken_greenhouse';
    } else if (context.storyRelevantSignals.dominantThemes.includes('ease_gratitude') || reflectionsText.includes('tea') || reflectionsText.includes('porch') || reflectionsText.includes('sunlight') || reflectionsText.includes('coffee')) {
      worldAffinity = 'courtyard_lanterns';
    } else if (personalTruths.growth_truths.some((g) => g.includes('patience') || g.includes('compassion') || g.includes('kindness'))) {
      worldAffinity = 'highland_observatory';
    }

    return {
      personalTruths,
      emotionalLandscape: {
        currentTone: context.storyRelevantSignals.primaryAtmosphericTone || 'contemplative',
        recentShift,
        volatility
      },
      recurringThemes,
      growthArc: {
        signals: growthSignalsList,
        direction: growthDirection
      },
      narrativeMotifs: activeMotifs.slice(0, 3),
      adaptiveWorldElements: {
        emergingLocations,
        atmosphericShift,
        worldAffinity
      },
      emergentCharacters,
      personalizationConfidence: confidence
    };
  },

  /**
   * Formats the personalization layer into compact, invisible narrative instructions for Gemini.
   */
  formatPersonalizationPrompt(personalization: StoryPersonalization): string {
    if (personalization.personalizationConfidence === 'none') {
      return `
=== PERSONALIZATION GUIDANCE ===
Confidence: NONE (Early Genesis)
- Keep the world open, gentle, and quiet.
- Focus on establishing atmospheric wonder without assuming recurring patterns.
`;
    }

    const themesList = personalization.recurringThemes
      .map((t) => `- ${t.theme} (Persistence: ${t.persistence})`)
      .join('\n');

    const motifsList = personalization.narrativeMotifs
      .map((m) => `- ${m.motif} (Stage: ${m.stage.toUpperCase()} | Allegorical Meaning: ${m.meaning})`)
      .join('\n');

    const locationsList = personalization.adaptiveWorldElements.emergingLocations
      .map((l) => `- ${l}`)
      .join('\n');

    return `
=== ADAPTIVE PERSONALIZATION INSTRUCTIONS (DO NOT REVEAL DIRECTLY) ===
Personalization Confidence: ${personalization.personalizationConfidence.toUpperCase()}
Emotional Movement: "${personalization.emotionalLandscape.recentShift || 'steady contemplation'}"
Atmospheric Shift: "${personalization.adaptiveWorldElements.atmosphericShift}"

Emerging Emotional Themes (To be mirrored allegorically in the world):
${themesList || '- Quiet self-discovery and mindfulness'}

Active Narrative Motifs to Advance:
${motifsList || '- The guiding path of sea glass'}

Emerging World Elements:
${locationsList || '- The quiet coastline and unfolding paths'}

CRITICAL PERSONALIZATION RULES:
1. Mirror the emotional movement ("${personalization.emotionalLandscape.recentShift || 'steady'}") through environmental changes and physical interactions.
2. Advance at least one active motif (e.g. allow an "introduced" motif to become "recurring" or a "recurring" motif to start "transforming").
3. NEVER use clinical terms, psychology labels, or reveal that you are adapting to journal data.
`;
  }
};
