/**
 * emotionWrappedEngine.js
 * 
 * Generates rich, personalized, non-clinical story slide data for "MY EMOTION WRAPPED".
 * Transforms raw Emotion Wheel state into an engaging 5-6 slide visual narrative.
 */

export function generateEmotionWrappedStory({
  emotionName = 'Nostalgic',
  familyName = 'Love',
  intensity = 3,
  selectedContexts = [],
  selectedNeeds = []
}) {
  const normFam = (familyName || 'Love').toLowerCase();
  const normEmo = (emotionName || 'This feeling').toUpperCase();
  const rawEmoName = emotionName || 'This feeling';

  // 1. INTENSITY COPY
  const intensityMap = {
    1: { phrase: 'A GENTLE FLICKER', meter: '● ○ ○ ○ ○', desc: 'A subtle whisper in the background.' },
    2: { phrase: 'SOFT & PRESENT', meter: '● ● ○ ○ ○', desc: 'Quietly asking to be noticed.' },
    3: { phrase: 'DISTINCT & FELT', meter: '● ● ● ○ ○', desc: 'A noticeable presence in mind & body.' },
    4: { phrase: 'STRONG & CLEAR', meter: '● ● ● ● ○', desc: 'Taking up meaningful emotional space.' },
    5: { phrase: 'FULL & INTENSE', meter: '● ● ● ● ●', desc: 'Demanding your complete presence.' }
  };
  const activeIntensity = intensityMap[intensity] || intensityMap[3];

  // 2. CONTEXT FORMATTER (Max 3 punchy items)
  const formattedContexts = (selectedContexts && selectedContexts.length > 0
    ? selectedContexts.slice(0, 3)
    : ['Something meaningful', 'A personal memory', 'Feeling connected']
  ).map((txt, i) => {
    // clean long option text into punchy short capitalized phrases
    let clean = txt
      .replace(/^Someone crossed a clear boundary$/i, 'A clear boundary')
      .replace(/^I felt disrespected or attacked$/i, 'Feeling disrespected')
      .replace(/^I wasn't heard or believed$/i, 'Being heard')
      .replace(/^Something felt deeply unfair$/i, 'A sense of unfairness')
      .replace(/^Something was out of my control$/i, 'Things out of my control')
      .replace(/^Someone meaningful in my life$/i, 'Someone meaningful')
      .replace(/^Feeling cared for and accepted$/i, 'Feeling accepted')
      .replace(/^A sweet shared memory or moment$/i, 'A shared memory')
      .replace(/^Uncertainty about what comes next$/i, 'The unknown ahead')
      .replace(/^Something I lost or missed$/i, 'Something I miss');
    
    return {
      num: `0${i + 1}`,
      text: clean.toUpperCase()
    };
  });

  // 3. NEED HERO
  let primaryNeed = 'SPACE & GENTLENESS';
  if (selectedNeeds && selectedNeeds.length > 0) {
    primaryNeed = selectedNeeds[0]
      .replace(/^A pause before I respond$/i, 'A PAUSE')
      .replace(/^A safe way to let this out$/i, 'SAFE EXPRESSION')
      .replace(/^To feel heard and understood$/i, 'TO BE HEARD')
      .replace(/^To set or clarify a boundary$/i, 'A CLEAR BOUNDARY')
      .replace(/^Express my appreciation to someone$/i, 'EXPRESSING WARMTH')
      .replace(/^Hold and treasure this warmth within$/i, 'TREASURING WARMTH')
      .replace(/^Gentle comfort and warmth$/i, 'GENTLE COMFORT')
      .replace(/^A moment to breathe and ground$/i, 'GROUNDING BREATH')
      .toUpperCase();
  }

  // 4. EMOTION FAMILY SPECIFIC STORY INSIGHTS
  let familySlideInsights = {
    contextHeader: 'WHAT WAS BEHIND IT?',
    needSubtext: 'Sometimes giving yourself what you need is the first step toward ease.',
    insightHeader: 'YOUR FEELING HAD A STORY.',
    insightMain: `You weren't just feeling ${rawEmoName}.\n\nYou were noticing what still matters deeply to you.`
  };

  if (normFam.includes('anger')) {
    familySlideInsights = {
      contextHeader: 'WHAT SEEMED TO MATTER?',
      needSubtext: 'A moment of stillness before deciding what to do next.',
      insightHeader: 'ANGER WASN’T THE WHOLE STORY.',
      insightMain: 'Something important felt crossed.\n\nYour reaction was protecting your boundary.'
    };
  } else if (normFam.includes('fear') || normFam.includes('anxious')) {
    familySlideInsights = {
      contextHeader: 'WHAT FELT UNCERTAIN?',
      needSubtext: 'Giving your nervous system time to arrive at safety.',
      insightHeader: 'SOMETIMES FEAR IS A COMPASS.',
      insightMain: 'Not knowing what comes next is heavy.\n\nYou don’t have to figure it all out today.'
    };
  } else if (normFam.includes('sad')) {
    familySlideInsights = {
      contextHeader: 'HONORING THE WEIGHT.',
      needSubtext: 'You do not have to carry everything all at once.',
      insightHeader: 'SADNESS IS PROOF OF CARE.',
      insightMain: 'You were honoring something that held real meaning.\n\nBe gentle with that heart.'
    };
  } else if (normFam.includes('joy')) {
    familySlideInsights = {
      contextHeader: 'WHAT SPARKED THE LIGHT?',
      needSubtext: 'Savoring goodness is how you replenish.',
      insightHeader: 'JOY IS WORTH NOTICING.',
      insightMain: 'Some moments don’t need to last forever\nto leave a lasting warmth.'
    };
  } else if (normFam.includes('love') || normFam.includes('tender')) {
    familySlideInsights = {
      contextHeader: 'WHAT WAS BEHIND IT?',
      needSubtext: 'Connection can be its own kind of calm.',
      insightHeader: 'YOUR FEELING HAD A STORY.',
      insightMain: 'You were tuning into a sense of belonging.\n\nCherish what brings you closer.'
    };
  }

  const slides = [
    // SLIDE 1: THE HOOK
    {
      id: 'hook',
      type: 'hook',
      tagline: 'MY EMOTION WRAPPED',
      heroTitle: normEmo,
      subTitle: familyName.toUpperCase(),
      accentText: '✦',
      footerText: 'TherapyMantra'
    },

    // SLIDE 2: THE FEELING & INTENSITY
    {
      id: 'feeling',
      type: 'feeling',
      tagline: 'TODAY’S DISCOVERY',
      heroTitle: normEmo,
      subTitle: activeIntensity.meter,
      accentText: `${intensity} / 5 · ${activeIntensity.phrase}`,
      quoteText: activeIntensity.desc,
      footerText: 'TherapyMantra'
    },

    // SLIDE 3: WHAT WAS BEHIND IT?
    {
      id: 'context',
      type: 'context',
      tagline: 'UNCOVERING THE ROOTS',
      heroTitle: familySlideInsights.contextHeader,
      bullets: formattedContexts,
      footerText: 'TherapyMantra'
    },

    // SLIDE 4: WHAT YOU MIGHT NEED
    {
      id: 'need',
      type: 'need',
      tagline: 'MAYBE WHAT YOU NEEDED...',
      heroTitle: primaryNeed,
      quoteText: familySlideInsights.needSubtext,
      footerText: 'TherapyMantra'
    },

    // SLIDE 5: PERSONAL INSIGHT
    {
      id: 'insight',
      type: 'insight',
      tagline: 'THE REAL PAYOFF',
      heroTitle: familySlideInsights.insightHeader,
      quoteText: familySlideInsights.insightMain,
      footerText: 'TherapyMantra'
    },

    // SLIDE 6: THE CLOSING / BRAND MOMENT
    {
      id: 'closing',
      type: 'closing',
      tagline: 'MY EMOTION WRAPPED',
      heroTitle: 'THERE’S MORE TO EVERY FEELING.',
      subTitle: 'Explore yours with TherapyMantra.',
      accentText: '✦',
      footerText: 'therapymantra.co',
      ctaText: 'Explore your feelings'
    }
  ];

  return slides;
}
