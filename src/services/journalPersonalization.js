/**
 * Journal Personalization Engine
 * Weaves Daily Check-in structured data & reflection history into rich, conversational reflection prompts.
 * Daily Check-in -> Personalized Reflection -> Journal Entry -> Patterns
 */

export const GUIDED_PROMPT_CATEGORIES = [
  {
    id: 'self_reflection',
    emoji: '🌿',
    title: 'Self Reflection',
    description: 'Understand yourself a little better.',
    accentColor: '#0F766E',
    bgColor: '#EDF7F6',
    borderColor: '#D5ECE9',
    prompts: [
      'When do you feel most like your genuine self?',
      'What personal value guided your choices recently?',
      "What's something your mind or body is asking for more of right now?",
      'What is a personal boundary you are glad you held recently?',
      'What have you been understanding a little better about yourself lately?',
      'How have your personal priorities shifted over the past few weeks?',
      "What is a recurring pattern or reaction you've been observing in yourself?",
      'What kind of environment brings you the greatest sense of inner peace?'
    ]
  },
  {
    id: 'thoughts_feelings',
    emoji: '💭',
    title: 'Thoughts & Feelings',
    description: "Make space for what's on your mind.",
    accentColor: '#0284C7',
    bgColor: '#F0F7FA',
    borderColor: '#DCEBF2',
    prompts: [
      'What feeling has been showing up most often for you lately?',
      'Is there something you have been carrying quietly without sharing?',
      'What has been taking up the most mental space for you today?',
      'What feeling is asking to be acknowledged rather than pushed aside?',
      'What do you wish you could express freely without fear of judgment?',
      'What kind of reassurance or breathing room does your mind need right now?',
      'Is there an unspoken worry that has felt heavier than it needs to be?',
      'When you pause and check in, what word best captures your headspace?'
    ]
  },
  {
    id: 'gratitude_positivity',
    emoji: '🌤️',
    title: 'Gratitude & Positivity',
    description: 'Notice the good moments around you.',
    accentColor: '#B45309',
    bgColor: '#FAF3E8',
    borderColor: '#EFE2CE',
    prompts: [
      'What brought even a brief moment of warmth or lightness into your day?',
      'What is a simple, everyday comfort that you feel thankful for right now?',
      'Who is someone whose presence made things feel a little easier recently?',
      'What is an unexpected kindness you received, witnessed, or offered?',
      "What is a meaningful detail from today you don't want to overlook?",
      'What part of your surroundings brings you a feeling of ease or safety?',
      'What is a quality in yourself that you are quietly grateful for today?',
      'What was something ordinary today that turned out to be surprisingly pleasant?'
    ]
  },
  {
    id: 'growth_change',
    emoji: '🌱',
    title: 'Growth & Change',
    description: "Reflect on where you're going.",
    accentColor: '#059669',
    bgColor: '#F0FDF4',
    borderColor: '#D1FAE5',
    prompts: [
      'What is one thing you handled recently with more patience than you once would have?',
      'What is a challenging situation teaching you about your inner resilience?',
      'What transition or change are you currently adapting to in your life?',
      'What is an expectation or belief you are ready to gently let go of?',
      'What small, positive habit would make your days feel more grounded?',
      'What would meaningful personal growth look like for you in this season?',
      "What is a capability or strength you've developed that you can acknowledge today?",
      'What is one gentle step forward you can take toward something important to you?'
    ]
  },
  {
    id: 'relationships',
    emoji: '🫶',
    title: 'Relationships',
    description: 'Explore your connections with others.',
    accentColor: '#7C3AED',
    bgColor: '#F5F1FA',
    borderColor: '#E8E0F2',
    prompts: [
      'Who has been an important, grounding presence in your life lately?',
      'When did you last feel deeply heard or understood by someone?',
      'How do you feel most authentically supported by the people close to you?',
      'Is there something you would like to communicate more honestly with someone?',
      'What is a relationship boundary that protects your emotional energy?',
      'Where or with whom do you feel a genuine sense of belonging and ease?',
      'What is a gesture of care or appreciation you would like to share with someone?',
      'How has your approach to friendships or connections evolved over time?'
    ]
  }
];

/**
 * Extracts and normalizes structured check-in context.
 */
export function extractCheckInContext(checkInRecord, streakSummary) {
  if (!checkInRecord || !checkInRecord.created_at) return null;

  // Check if the check-in occurred today
  const checkInDate = new Date(checkInRecord.created_at);
  if (isNaN(checkInDate.getTime())) return null;

  const isToday = checkInDate.toDateString() === new Date().toDateString();
  const completedToday = streakSummary?.completedToday !== undefined ? streakSummary.completedToday : isToday;

  if (!isToday || completedToday === false) return null;

  const rawMetadata = checkInRecord.metadata || {};
  const structured = rawMetadata.structured_context || {};
  const contexts = Array.isArray(checkInRecord.contexts) ? checkInRecord.contexts : [];

  const primaryEmotion = checkInRecord.primary_emotion || '';
  const emotionCategory = structured.emotion_category || categorizeEmotion(primaryEmotion, checkInRecord.emotion_zone);
  const intensity = checkInRecord.intensity || 3;

  const contributingFactors = structured.contributing_factors || contexts.filter((c) => isContributingFactor(c));
  const deeperContext = structured.deeper_context || [];
  const activities = structured.activities || contexts.filter((c) => isActivity(c));
  const socialContext = structured.social_context || contexts.filter((c) => isSocial(c));
  const locations = structured.locations || contexts.filter((c) => isLocation(c));
  const reflectionNote = checkInRecord.reflection || '';

  return {
    hasCheckIn: true,
    emotion: primaryEmotion,
    emotionCategory,
    intensity,
    contributingFactors,
    deeperContext,
    activities,
    socialContext,
    locations,
    reflectionNote,
    createdAt: checkInRecord.created_at
  };
}

function categorizeEmotion(emotion, zone) {
  const e = (emotion || '').toLowerCase();
  if (['joyful', 'excited', 'motivated', 'inspired', 'proud', 'playful', 'confident', 'curious', 'happy', 'good'].includes(e) || zone === 'high_pleasant') {
    return 'positive';
  }
  if (['calm', 'peaceful', 'grateful', 'grounded', 'content', 'relaxed', 'relieved', 'safe'].includes(e) || zone === 'low_pleasant') {
    return 'calm';
  }
  if (['angry', 'frustrated', 'irritated', 'annoyed', 'furious'].includes(e)) {
    return 'angry';
  }
  if (['anxious', 'overwhelmed', 'stressed', 'panicked', 'tense', 'restless', 'worried'].includes(e) || zone === 'high_unpleasant') {
    return 'anxious';
  }
  if (['tired', 'drained', 'exhausted', 'numb', 'meh'].includes(e)) {
    return 'tired';
  }
  if (['sad', 'lonely', 'hopeless', 'discouraged', 'guilty', 'low'].includes(e) || zone === 'low_unpleasant') {
    return 'sad';
  }
  return 'calm';
}

function isActivity(tag) {
  return ['Working', 'Studying', 'Resting', 'Exercising', 'Spending time with others', 'Commuting', 'Doing chores', 'On my phone'].includes(tag);
}

function isSocial(tag) {
  return ['By myself', 'Family', 'Friends', 'Partner', 'Co-workers', 'Pets', 'Someone else'].includes(tag);
}

function isLocation(tag) {
  return ['Home', 'Workplace', 'School / College', 'Outdoors', 'Gym', 'Commuting', 'Somewhere else'].includes(tag);
}

function isContributingFactor(tag) {
  return !isActivity(tag) && !isSocial(tag) && !isLocation(tag);
}

/**
 * 1. Generates the editorial centerpiece prompt for the Journal landing cover.
 */
export function getPersonalizedCoverPrompt(context) {
  if (!context || !context.emotion) {
    return "What's on your mind today?";
  }

  const { emotion, emotionCategory, activities, locations, socialContext, contributingFactors } = context;
  const emotionLower = emotion.toLowerCase();

  const primaryActivity = activities[0]?.toLowerCase();
  const primaryLocation = locations[0];
  const primarySocial = socialContext[0]?.toLowerCase();
  const primaryFactor = contributingFactors[0]?.toLowerCase();

  // 1. Calm / Grounded / Peaceful
  if (emotionCategory === 'calm' || ['grounded', 'calm', 'peaceful', 'relaxed'].includes(emotionLower)) {
    if (primaryActivity === 'resting' && primaryLocation === 'Home') {
      return `You took some time to slow down at home. What about that moment helped you feel more ${emotionLower}?`;
    }
    if (primaryLocation === 'Outdoors' || primaryFactor === 'nature' || primaryFactor === 'being outdoors') {
      return `You felt peaceful outdoors earlier. What about that space brought ease to your day?`;
    }
    if (primarySocial && primarySocial.includes('friend')) {
      return `You felt ${emotionLower} spending time with friends. What helped you feel so present?`;
    }
    return `You mentioned feeling ${emotionLower} earlier today. What do you think helped you feel that way?`;
  }

  // 2. Anxious / Worried / Overwhelmed / Stressed
  if (emotionCategory === 'anxious' || ['anxious', 'overwhelmed', 'stressed', 'worried'].includes(emotionLower)) {
    if (primaryFactor?.includes('work') || primaryActivity === 'working' || primaryActivity === 'studying') {
      return `Work and a lot to manage brought up some anxiety earlier. What's been taking up the most space in your mind?`;
    }
    if (primaryFactor?.includes('too much') || primaryFactor?.includes('pressure')) {
      return `Feeling pressure earlier was heavy. What is one thing you can set down for the rest of today?`;
    }
    return `You mentioned feeling ${emotionLower} earlier. What's been taking up the most space in your mind?`;
  }

  // 3. Positive / Happy / Good / Joyful
  if (emotionCategory === 'positive' || ['happy', 'good', 'joyful', 'excited', 'proud'].includes(emotionLower)) {
    if (primaryFactor?.includes('achieve') || primaryFactor?.includes('productive')) {
      return `You were feeling productive and accomplished earlier. What brought that positive momentum into your day?`;
    }
    if (primarySocial && (primarySocial.includes('friend') || primarySocial.includes('family') || primarySocial.includes('partner'))) {
      return `Connecting with others brought joy to your day earlier. What made that connection meaningful?`;
    }
    return `You were feeling good earlier today. What brought that feeling into your day?`;
  }

  // 4. Sad / Low / Lonely
  if (emotionCategory === 'sad' || ['sad', 'low', 'lonely', 'discouraged'].includes(emotionLower)) {
    if (primarySocial === 'by myself' || primaryFactor?.includes('alone')) {
      return `Feeling alone can make things heavier. What gentleness or comfort do you need right now?`;
    }
    return `You were feeling low earlier today. What felt hardest about your day?`;
  }

  // 5. Angry / Frustrated / Irritated
  if (emotionCategory === 'angry' || ['frustrated', 'angry', 'irritated'].includes(emotionLower)) {
    return `You mentioned feeling ${emotionLower} earlier. What felt most difficult or out of your control?`;
  }

  // 6. Drained / Tired / Low Energy
  if (emotionCategory === 'tired' || ['drained', 'tired', 'exhausted'].includes(emotionLower)) {
    return `You were feeling drained earlier today. What do you think took the most energy from you?`;
  }

  return `Thinking back to feeling ${emotionLower} earlier, what thoughts or experiences stand out most today?`;
}

/**
 * 2. Generates the 3-step structured prompts for "Reflect on Today".
 */
export function getPersonalizedReflectTodaySteps(context) {
  if (!context || !context.emotion) {
    return [
      {
        step: 1,
        title: 'Look Back',
        prompt: 'What was the most significant moment of your day today?',
        placeholder: 'Describe what happened and how it felt...'
      },
      {
        step: 2,
        title: 'Explore',
        prompt: 'What thoughts or emotions were present during that time?',
        placeholder: 'Notice how your mind and body responded...'
      },
      {
        step: 3,
        title: 'Understand',
        prompt: 'What is one insight or feeling from today you want to hold onto?',
        placeholder: 'A small takeaway, a shift in perspective, or an intention...'
      }
    ];
  }

  const { emotion, emotionCategory, activities, locations, socialContext } = context;
  const emotionName = emotion;
  const emotionLower = emotion.toLowerCase();

  const location = locations[0];
  const social = socialContext[0];

  // 1. Calm / Grounded
  if (emotionCategory === 'calm') {
    return [
      {
        step: 1,
        title: 'Notice Ease',
        prompt: `You mentioned feeling ${emotionLower} earlier today. What helped you feel that way?`,
        supporting: 'Think about what was happening when you felt most present.',
        placeholder: `Write about the stillness, environment, or choices that supported feeling ${emotionLower}...`
      },
      {
        step: 2,
        title: 'Deepen',
        prompt: location ? `How did being in ${location} or stepping back shape your headspace?` : 'How did that calm shift how you responded to the rest of your day?',
        supporting: 'Notice any physical relaxation or mental clarity.',
        placeholder: 'Notice where in your body you felt that ease, and how it carried you...'
      },
      {
        step: 3,
        title: 'Integrate',
        prompt: 'What from this grounded space would you like to carry into tomorrow?',
        supporting: 'A small practice, a boundary, or a steady reminder.',
        placeholder: 'Even one breath, a quiet boundary, or a gentle reminder to pause...'
      }
    ];
  }

  // 2. Anxious / Overwhelmed / Stressed
  if (emotionCategory === 'anxious') {
    return [
      {
        step: 1,
        title: 'Unpack the Weight',
        prompt: `You mentioned feeling ${emotionLower} earlier. What's been taking up the most space in your mind?`,
        supporting: 'Name whatever felt heavy without needing to solve it immediately.',
        placeholder: 'Write whatever thoughts, demands, or uncertainties have been swirling...'
      },
      {
        step: 2,
        title: 'Separate & Clarify',
        prompt: 'What parts of this are within your control, and what parts belong to the unknown?',
        supporting: 'Give yourself permission to set down what you cannot influence tonight.',
        placeholder: 'Distinguish between what you can act on vs what is outside your hands...'
      },
      {
        step: 3,
        title: 'Find Grounding',
        prompt: 'What would help you feel safe and a little more centered right now?',
        supporting: 'A quiet pause, step away from screens, or a comforting thought.',
        placeholder: 'A physical sensation, a warm drink, taking a deep breath...'
      }
    ];
  }

  // 3. Positive / Happy / Good
  if (emotionCategory === 'positive') {
    return [
      {
        step: 1,
        title: 'Celebrate the Spark',
        prompt: `You were feeling ${emotionLower} earlier today. What brought that feeling into your day?`,
        supporting: 'A moment, a person, a success, or an unexpected delight.',
        placeholder: 'Describe what sparked this warm, uplifting energy today...'
      },
      {
        step: 2,
        title: 'Savor the Detail',
        prompt: social ? `How did being with ${social} amplify that good energy?` : 'What about that experience resonated most deeply with you?',
        supporting: 'Notice what made it feel truly fulfilling.',
        placeholder: 'Notice how you felt in your body and mind during that moment...'
      },
      {
        step: 3,
        title: 'Anchor Gratitude',
        prompt: 'How can you honor or recreate this feeling in the days ahead?',
        supporting: 'An intention or simple appreciation for what went well.',
        placeholder: 'An insight, a gratitude, or a steady intention...'
      }
    ];
  }

  // 4. Sad / Low / Lonely
  if (emotionCategory === 'sad') {
    return [
      {
        step: 1,
        title: 'Honor the Feeling',
        prompt: `You were feeling low earlier today. What felt hardest about your day?`,
        supporting: 'Allow yourself to name what is tender without judgment.',
        placeholder: 'Give voice to what hurt, disappointed, or drained you today...'
      },
      {
        step: 2,
        title: 'Gentle Presence',
        prompt: 'How has your body or mind been asking you to slow down?',
        supporting: 'Notice any fatigue, heaviness, or quiet needs.',
        placeholder: 'Notice what you have been carrying and where it asks for rest...'
      },
      {
        step: 3,
        title: 'Self-Compassion',
        prompt: 'What gentleness or comfort can you give yourself right now?',
        supporting: 'Kind words, warmth, stepping away from expectations.',
        placeholder: 'Write a few compassionate words you need to hear tonight...'
      }
    ];
  }

  // 5. Angry / Frustrated
  if (emotionCategory === 'angry') {
    return [
      {
        step: 1,
        title: 'Name the Friction',
        prompt: `You mentioned feeling ${emotionLower} earlier. What felt most difficult or out of your control?`,
        supporting: 'Notice where a boundary, expectation, or situation was strained.',
        placeholder: 'Write honestly about what crossed a boundary or felt unfair...'
      },
      {
        step: 2,
        title: 'Look Beneath',
        prompt: 'What unmet need, disappointment, or boundary was underneath the frustration?',
        supporting: 'Anger often protects something valuable to us.',
        placeholder: 'Look at what you were trying to protect or what mattered to you...'
      },
      {
        step: 3,
        title: 'Release & Reset',
        prompt: 'What is one boundary or constructive step that would help you regain clarity?',
        supporting: 'Reclaiming your calm and deciding where your energy goes.',
        placeholder: 'How you want to respond, or deciding to let it rest for the night...'
      }
    ];
  }

  // 6. Drained / Tired / Low Energy
  if (emotionCategory === 'tired') {
    return [
      {
        step: 1,
        title: 'Acknowledge Depletion',
        prompt: `You were feeling drained earlier today. What do you think took the most energy from you?`,
        supporting: 'Honoring when your emotional or physical battery is low.',
        placeholder: 'Write about the demands, interactions, or tasks that took your reserves...'
      },
      {
        step: 2,
        title: 'Permission to Rest',
        prompt: 'What can you consciously pause or let go of for this evening?',
        supporting: 'Not everything has to be finished right now.',
        placeholder: 'Tasks, messages, or mental pressure you can pause until tomorrow...'
      },
      {
        step: 3,
        title: 'Restorative Care',
        prompt: 'What is one soothing thing that would help you replenish tonight?',
        supporting: 'Sleep, quiet time, unplugging, or warm comfort.',
        placeholder: 'The simplest, gentlest thing you can do for yourself tonight...'
      }
    ];
  }

  // Fallback
  return [
    {
      step: 1,
      title: 'Look Back',
      prompt: `Thinking back to feeling ${emotionName} earlier, what stood out most about your day?`,
      supporting: 'Notice what shaped your mood and experiences.',
      placeholder: 'Write freely about your day...'
    },
    {
      step: 2,
      title: 'Explore',
      prompt: 'What thoughts or moments contributed to that state of mind?',
      supporting: 'Explore what was happening beneath the surface.',
      placeholder: 'Explore the details and how you felt...'
    },
    {
      step: 3,
      title: 'Understand',
      prompt: 'What is one thing you would like to carry forward from today?',
      supporting: 'An insight, intention, or boundary.',
      placeholder: 'A takeaway or small resolution for tomorrow...'
    }
  ];
}

/**
 * 3. Guided Reflection Prompts Personalization & Multi-Angle Rotation Engine
 *
 * Priority 1: Today's Daily Check-in (Emotion, Intensity, Activity, Social, Location, Factors)
 * Priority 2: Recent reflections (recurring themes, unresolved thoughts)
 * Priority 3: Selected category context
 * Priority 4: Category base prompts
 *
 * Core Principle: Never literally parrot "You mentioned feeling [emotion]..."
 * Instead, rotate through natural, emotionally intelligent angles:
 * 1. Emotional/Internal State
 * 2. Situational/Contextual
 * 3. Cognitive/Thought patterns
 * 4. Needs/Boundaries
/**
 * Category-aware personalized prompt generator mapping.
 * Each category has a dedicated strategy that translates check-in context
 * into prompts strictly aligned with that category's specific theme.
 */
const CATEGORY_PERSONALIZED_PROMPT_STRATEGIES = {
  self_reflection: (context, emotion, isWorking, isStudying, isAlone, isWithOthers) => {
    const prompts = [];
    if (['panicked', 'panic', 'anxious', 'overwhelmed', 'stressed', 'worried'].includes(emotion)) {
      if (isStudying) {
        prompts.push(
          "What is your mind or body telling you about your limits while studying today?",
          "When academic pressure feels intense, what helps you step back and return to yourself?"
        );
      } else if (isWorking) {
        prompts.push(
          "What have you been noticing about your capacity under work demands today?",
          "What is one quiet boundary you need to give yourself in your professional life?"
        );
      } else {
        prompts.push(
          "What is your mind or body telling you about your current capacity today?",
          "What is one gentle boundary you need to give yourself right now?",
          "When things feel overwhelming, what helps you feel anchored in yourself?"
        );
      }
    } else if (['frustrated', 'angry', 'irritated', 'annoyed'].includes(emotion)) {
      prompts.push(
        "What boundary or unspoken limit was tested for you today?",
        "What is this frustration showing you about what truly matters to your sense of self?"
      );
    } else if (['grounded', 'calm', 'peaceful', 'relieved', 'safe'].includes(emotion)) {
      prompts.push(
        "When today did you feel most in tune with your own rhythm?",
        "What choice or mindset helped you maintain your inner stillness today?"
      );
    } else if (['tired', 'drained', 'exhausted'].includes(emotion)) {
      prompts.push(
        "How has your energy been asking you to slow down today?",
        "What personal expectation can you give yourself permission to set aside tonight?"
      );
    } else if (['happy', 'joyful', 'good', 'excited', 'proud'].includes(emotion)) {
      prompts.push(
        "What part of today felt most aligned with who you truly want to be?",
        "What strength or personal quality helped you show up well today?"
      );
    }

    if (isAlone) {
      prompts.push("What did having time to yourself reveal about your current needs?");
    }
    return prompts;
  },

  thoughts_feelings: (context, emotion, isWorking, isStudying, isAlone, isWithOthers) => {
    const prompts = [];
    if (['panicked', 'panic', 'alarmed', 'terrified', 'fearful'].includes(emotion)) {
      if (isStudying) {
        prompts.push(
          "What feels most overwhelming about what you are managing with your studies right now?",
          "Is there a specific thought or expectation about your studies that keeps looping?"
        );
      } else if (isWorking) {
        prompts.push(
          "What part of your workday felt most overwhelming or difficult to process?",
          "What thoughts from work are still lingering in your mind this evening?"
        );
      } else {
        prompts.push(
          "What feels most difficult or overwhelming to put into words right now?",
          "What might help create a little more mental breathing room at this moment?"
        );
      }
    } else if (['anxious', 'overwhelmed', 'stressed', 'worried', 'nervous', 'tense', 'restless'].includes(emotion)) {
      prompts.push(
        "What has been taking up the most mental space for you today?",
        "Is there an unspoken worry or thought you've been carrying quietly?",
        "What would bring your nervous system a small pocket of quiet tonight?"
      );
    } else if (['frustrated', 'angry', 'irritated', 'annoyed', 'resentful', 'furious'].includes(emotion)) {
      prompts.push(
        "What felt most difficult or out of your control about what happened today?",
        "What feeling is asking to be acknowledged without having to fix it immediately?"
      );
    } else if (['relieved', 'safe'].includes(emotion)) {
      prompts.push(
        "What feels lighter or more settled for you now that the pressure has eased?",
        "What shifted that allowed you to experience this sense of relief?"
      );
    } else if (['grounded', 'calm', 'peaceful', 'serene', 'content', 'relaxed'].includes(emotion)) {
      prompts.push(
        "What helped you feel grounded and present today?",
        "What was different about today that allowed your headspace to feel calm?"
      );
    } else if (['sad', 'lonely', 'low', 'discouraged', 'hurt', 'heartbroken', 'down'].includes(emotion)) {
      prompts.push(
        "What has felt heaviest or most tender about your day today?",
        "What kind of kindness or gentleness do you need for your thoughts right now?"
      );
    } else if (['tired', 'drained', 'exhausted', 'depleted'].includes(emotion)) {
      prompts.push(
        "What took the most mental or emotional energy from you today?",
        "What thought can you set down for the rest of the evening?"
      );
    } else if (['happy', 'joyful', 'good', 'excited', 'proud', 'grateful'].includes(emotion)) {
      prompts.push(
        "What brought that warm, uplifting feeling into your day today?",
        "What is a joyful thought from today you want to savor before moving on?"
      );
    }
    return prompts;
  },

  gratitude_positivity: (context, emotion, isWorking, isStudying, isAlone, isWithOthers) => {
    const prompts = [];
    if (['panicked', 'panic', 'anxious', 'overwhelmed', 'stressed', 'tired', 'sad', 'low', 'frustrated'].includes(emotion)) {
      if (isStudying || isWorking) {
        prompts.push(
          "Even amidst intense pressure today, what was one small moment of relief or comfort?",
          "What is one steady thing in your daily routine you feel thankful for right now?"
        );
      } else {
        prompts.push(
          "Even amidst a difficult moment, what was one tiny pocket of ease today?",
          "What is one physical thing around you right now that feels safe or grounding?"
        );
      }
    } else if (['happy', 'joyful', 'good', 'excited', 'proud', 'grateful', 'inspired'].includes(emotion)) {
      prompts.push(
        "What brought that sense of warmth or gratitude into your day today?",
        "Who or what made you feel genuinely glad to be present today?"
      );
    } else {
      prompts.push(
        "What is a simple comfort or quiet blessing you feel thankful for this evening?",
        "What is an unexpected kindness you noticed or experienced today?"
      );
    }
    return prompts;
  },

  growth_change: (context, emotion, isWorking, isStudying, isAlone, isWithOthers) => {
    const prompts = [];
    if (['panicked', 'panic', 'anxious', 'overwhelmed', 'stressed', 'frustrated'].includes(emotion)) {
      if (isStudying || isWorking) {
        prompts.push(
          "What is this challenging workload teaching you about how you handle pressure?",
          "What is one small, manageable adjustment you can make tomorrow to protect your focus?"
        );
      } else {
        prompts.push(
          "What is one thing you handled today with more self-awareness than in the past?",
          "What is one pattern you are gently learning to navigate differently during stressful moments?"
        );
      }
    } else if (['grounded', 'calm', 'relieved', 'happy', 'good'].includes(emotion)) {
      prompts.push(
        "What positive shift or progress did you notice in how you approached things today?",
        "What healthy habit or mindset helped you move forward today?"
      );
    } else {
      prompts.push(
        "What is something you are navigating or learning to adapt to in this season?",
        "What would meaningful progress look like for you as you move into tomorrow?"
      );
    }
    return prompts;
  },

  relationships: (context, emotion, isWorking, isStudying, isAlone, isWithOthers) => {
    const prompts = [];
    if (isWithOthers) {
      if (['happy', 'grateful', 'calm', 'good'].includes(emotion)) {
        prompts.push(
          "What made connecting with others feel supportive or meaningful today?",
          "Who is someone whose presence made a positive difference for you today?"
        );
      } else {
        prompts.push(
          "How did your interactions with the people in your life feel while navigating today?",
          "Is there a friend or family member you feel safe sharing your honest feelings with?"
        );
      }
    } else if (isAlone) {
      prompts.push(
        "How did having time by yourself feel for your connection to others?",
        "Who is someone you value and might want to reach out to when you are ready?"
      );
    } else if (isWorking) {
      prompts.push(
        "How did your interactions with colleagues or team members feel today?",
        "What work relationship boundary or dynamic is on your mind today?"
      );
    } else {
      prompts.push(
        "Is there someone whose presence or words stayed with you today?",
        "What is one relationship where you feel completely safe to be yourself?"
      );
    }
    return prompts;
  }
};

/**
 * 3. Guided Reflection Prompts Personalization & Multi-Angle Rotation Engine
 *
 * Strict Category Isolation & Honest Tailoring:
 * - Prompts generated for a category strictly adhere to that category's domain.
 * - Only genuine contextual candidates are marked as `tailoredPrompts`.
 * - If user data is absent, returns only the selected category's curated base prompts.
 */
export function getPersonalizedGuidedPrompts({
  category,
  context,
  recentEntries = [],
  sessionSeenPrompts = []
}) {
  const basePrompts = category?.prompts ? [...category.prompts] : [];
  const categoryId = category?.id || 'thoughts_feelings';

  const emotion = context?.emotion ? context.emotion.toLowerCase() : null;
  const activities = (context?.activities || []).map((a) => a.toLowerCase());
  const social = (context?.socialContext || []).map((s) => s.toLowerCase());
  const locations = (context?.locations || []).map((l) => l.toLowerCase());
  const factors = (context?.contributingFactors || []).map((f) => f.toLowerCase());

  const isWorking = activities.includes('working') || locations.includes('workplace') || factors.some((f) => f.includes('work'));
  const isStudying = activities.includes('studying') || locations.includes('school / college') || factors.some((f) => f.includes('school') || f.includes('study'));
  const isWithOthers = social.some((s) => s.includes('friend') || s.includes('family') || s.includes('partner') || s.includes('co-worker') || s.includes('colleague'));
  const isAlone = social.some((s) => s.includes('myself') || s.includes('alone')) || activities.includes('resting');

  const recentTitles = new Set(
    recentEntries.map((e) => (e.title || '').trim().toLowerCase())
  );
  const seenInSession = new Set(
    sessionSeenPrompts.map((p) => p.trim().toLowerCase())
  );

  let selectedTailoredPrompt = null;

  // Generate category-specific contextual prompts ONLY if check-in context exists
  if (context && (emotion || activities.length > 0 || social.length > 0)) {
    const strategy = CATEGORY_PERSONALIZED_PROMPT_STRATEGIES[categoryId];
    if (typeof strategy === 'function') {
      const candidates = strategy(context, emotion, isWorking, isStudying, isAlone, isWithOthers);
      // Pick the best unrepeated candidate for this session
      const availableCandidates = candidates.filter(
        (p) => !recentTitles.has(p.toLowerCase()) && !seenInSession.has(p.toLowerCase())
      );
      selectedTailoredPrompt = availableCandidates[0] || candidates[0] || null;
    }
  }

  const tailoredPrompts = selectedTailoredPrompt ? [selectedTailoredPrompt] : [];
  const tailoredSet = new Set(tailoredPrompts.map((p) => p.trim().toLowerCase()));

  // Base prompts for this category, excluding anything that duplicates the tailored prompt
  const availableBasePrompts = basePrompts.filter(
    (p) => !tailoredSet.has(p.trim().toLowerCase())
  );

  // Unrepeated base prompts (filter session-seen and recent reflection titles)
  const unrepeatedBase = availableBasePrompts.filter(
    (p) => !recentTitles.has(p.toLowerCase()) && !seenInSession.has(p.toLowerCase())
  );

  const finalBasePrompts = unrepeatedBase.length > 0 ? unrepeatedBase : availableBasePrompts;

  // Ranked pool: Exactly ONE tailored prompt (if available) + distinct category base prompts
  const finalPool = [...tailoredPrompts, ...finalBasePrompts];

  // Unfinished draft continuity: ONLY if an actual uncompleted draft exists
  let unfinishedDraft = null;
  if (recentEntries.length > 0) {
    const draft = recentEntries.find(
      (entry) =>
        Boolean(entry.is_draft || entry.metadata?.is_draft) &&
        entry.content &&
        entry.content.trim().length > 0
    );
    if (draft) {
      const cleanExcerpt = draft.content.trim().replace(/^#+\s+/gm, '').substring(0, 60);
      unfinishedDraft = {
        id: draft.id,
        title: draft.title || 'Untitled reflection',
        excerpt: cleanExcerpt ? `${cleanExcerpt}...` : '',
        dateStr: draft.created_at ? new Date(draft.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently'
      };
    }
  }

  return {
    prompts: finalPool,
    tailoredPrompts,
    primaryPrompt: finalPool[0] || basePrompts[0] || "What's on your mind today?",
    unfinishedDraft
  };
}
