/**
 * shareCopyEngine.js
 * 
 * Deterministic, human-centered social copy generator for 9:16 Instagram Story reflections.
 * Generates emotionally relatable quote-card content without clinical or assessment language.
 */

export const SHARE_STYLES = [
  { id: 'relatable', label: 'Minimal', description: 'Clean & direct observation' },
  { id: 'deep', label: 'Deep', description: 'What lies underneath the feeling' },
  { id: 'encouraging', label: 'Encouraging', description: 'Gentle permission & grounding' },
  { id: 'thoughtful', label: 'Thoughtful', description: 'Self-kindness & perspective' }
];

export function generateShareableArtifacts({
  emotionName = 'Provoked',
  familyName = 'Anger',
  intensity = 3,
  selectedContexts = [],
  selectedNeeds = []
}) {
  const normFam = (familyName || '').toLowerCase();
  const normEmo = (emotionName || '').toLowerCase();
  const contextStr = (selectedContexts || []).join(' ').toLowerCase();
  const needStr = (selectedNeeds || []).join(' ').toLowerCase();

  // 1. ANGER FAMILY
  if (normFam.includes('anger') || normFam.includes('rage') || normFam.includes('frustrat')) {
    let mainTheme = 'something felt crossed';
    if (contextStr.includes('boundary') || contextStr.includes('crossed')) {
      mainTheme = 'a boundary was crossed';
    } else if (contextStr.includes('unheard') || contextStr.includes('disrespected') || needStr.includes('heard')) {
      mainTheme = 'feeling unheard hurts';
    } else if (contextStr.includes('unfair') || contextStr.includes('control')) {
      mainTheme = 'something felt deeply unfair';
    }

    return {
      relatable: {
        headline: 'TODAY I NOTICED',
        quote: `Sometimes ${normEmo}\nisn't about being angry.\n\nSometimes ${mainTheme}.`,
        footer: '— Mantra'
      },
      deep: {
        headline: 'A FEELING IS A SIGNAL',
        quote: `I don't have to react\nto every feeling immediately.\n\nGiving myself a moment\nis enough.`,
        footer: '— Mantra'
      },
      encouraging: {
        headline: 'TODAY I NEEDED',
        quote: `Space.\n\nNot because I don't care,\nbut because I needed a moment\nbefore I responded.`,
        footer: '— Mantra'
      },
      thoughtful: {
        headline: 'SELF-KINDNESS',
        quote: `You don't have to defend\nyour right to feel this.\n\nJust honor what it is telling you.`,
        footer: '— Mantra'
      }
    };
  }

  // 2. FEAR FAMILY
  if (normFam.includes('fear') || normFam.includes('anxious') || normFam.includes('worry')) {
    return {
      relatable: {
        headline: 'TODAY I REALIZED',
        quote: `Not knowing what happens next\ncan feel heavier than we expect.\n\nOne small breath at a time.`,
        footer: '— Mantra'
      },
      deep: {
        headline: 'A GENTLE REMINDER',
        quote: `Anxiety is trying to protect me,\neven when I am already safe.\n\nI can thank it and soften.`,
        footer: '— Mantra'
      },
      encouraging: {
        headline: 'RIGHT NOW',
        quote: `I don't have to figure out\nthe whole future today.\n\nJust the next step.`,
        footer: '— Mantra'
      },
      thoughtful: {
        headline: 'GROUNDING',
        quote: `Fear makes things feel urgent.\n\nPeace is knowing\nI have time to arrive.`,
        footer: '— Mantra'
      }
    };
  }

  // 3. SADNESS FAMILY
  if (normFam.includes('sad') || normFam.includes('grief') || normFam.includes('hurt') || normFam.includes('lonel')) {
    return {
      relatable: {
        headline: 'TODAY I NOTICED',
        quote: `Sometimes what we need\nisn't a quick fix.\n\nIt's simply permission\nto feel what hurts.`,
        footer: '— Mantra'
      },
      deep: {
        headline: 'HONORING THE WEIGHT',
        quote: `Sadness is proof\nthat something mattered to you.\n\nBe gentle with that heart.`,
        footer: '— Mantra'
      },
      encouraging: {
        headline: 'A THOUGHT TO HOLD',
        quote: `You don't have to carry\nevery heavy thing all at once.\n\nIt is okay to rest.`,
        footer: '— Mantra'
      },
      thoughtful: {
        headline: 'SELF-COMPASSION',
        quote: `Healing isn't linear.\n\nTaking today slowly\nis still moving forward.`,
        footer: '— Mantra'
      }
    };
  }

  // 4. JOY FAMILY
  if (normFam.includes('joy') || normFam.includes('happy') || normFam.includes('content') || normFam.includes('grat')) {
    return {
      relatable: {
        headline: 'TODAY I NOTICED',
        quote: `Some moments don't need\nto last forever\nto be worth noticing.`,
        footer: '— Mantra'
      },
      deep: {
        headline: 'SIMPLE GRATITUDE',
        quote: `Joy doesn't demand perfection.\n\nIt just asks us to be present\nfor this one good thing.`,
        footer: '— Mantra'
      },
      encouraging: {
        headline: 'SAVORING',
        quote: `Allowing yourself to feel good\nis not a luxury.\n\nIt is how you replenish.`,
        footer: '— Mantra'
      },
      thoughtful: {
        headline: 'WARMTH',
        quote: `Holding onto this warmth\nfor whenever the weather turns.`,
        footer: '— Mantra'
      }
    };
  }

  // 5. LOVE FAMILY
  if (normFam.includes('love') || normFam.includes('connect') || normFam.includes('warm') || normFam.includes('tender')) {
    return {
      relatable: {
        headline: 'TODAY I NOTICED',
        quote: `Feeling connected\ncan be its own kind of calm.\n\nGrateful for the ones who listen.`,
        footer: '— Mantra'
      },
      deep: {
        headline: 'HELD & SEEN',
        quote: `Real connection begins\nwhen we stop pretending\nwe have it all together.`,
        footer: '— Mantra'
      },
      encouraging: {
        headline: 'TENDERNESS',
        quote: `Love given to yourself\nmakes love given to others\neffortless.`,
        footer: '— Mantra'
      },
      thoughtful: {
        headline: 'HEARTWORK',
        quote: `To care deeply is brave.\n\nNever regret having\na soft heart in a hurried world.`,
        footer: '— Mantra'
      }
    };
  }

  // 6. SURPRISE / DEFAULT FAMILY
  return {
    relatable: {
      headline: 'TODAY I NOTICED',
      quote: `A feeling is just a signal.\n\nI don't have to react\nto everything I feel right away.`,
      footer: '— Mantra'
    },
    deep: {
      headline: 'FINDING CLARITY',
      quote: `Sometimes clarity arrives\nonly after we give ourselves\nroom to stop forcing it.`,
      footer: '— Mantra'
    },
    encouraging: {
      headline: 'A MOMENT TO PAUSE',
      quote: `One small breath.\nOne moment of self-kindness\nis enough for right now.`,
      footer: '— Mantra'
    },
    thoughtful: {
      headline: 'PERSPECTIVE',
      quote: `You don't need to have all the answers.\n\nJust be honest\nabout where you are.`,
      footer: '— Mantra'
    }
  };
}
