/**
 * Contextual Emotion-Aware Intensity Configuration & Semantic Mapping
 * Provides natural, uplifting, and context-appropriate scale endpoints, labels, and feedback.
 */

export function getContextualIntensity({ emotionId, emotionName, zoneId }) {
  const eId = (emotionId || '').toLowerCase();
  const name = emotionName || 'this feeling';

  // 1. POSITIVE / UPLIFTING EMOTIONS
  if (
    zoneId === 'high_pleasant' ||
    zoneId === 'low_pleasant' ||
    ['inspired', 'calm', 'relaxed', 'happy', 'joyful', 'content', 'peaceful', 'grateful', 'hopeful', 'energized', 'motivated', 'grounded', 'proud', 'confident', 'playful', 'safe', 'relieved'].includes(eId)
  ) {
    // Specific Positive Emotion Customizations
    if (['calm', 'grounded', 'safe'].includes(eId)) {
      return {
        category: 'positive_calm',
        leftLabel: 'A little calmer',
        rightLabel: 'Completely at ease',
        levels: {
          1: { label: 'A little calmer', desc: 'A brief pause from the noise.' },
          2: { label: 'Starting to settle', desc: 'Muscles and thoughts are beginning to loosen.' },
          3: { label: 'Calm', desc: 'Quiet, unhurried ease in your body and mind.' },
          4: { label: 'Deeply calm', desc: 'Grounded, still, and centered right where you are.' },
          5: { label: 'Completely at ease', desc: 'You feel settled, safe, and deeply calm right now.' }
        }
      };
    }

    if (['relaxed', 'peaceful', 'relieved'].includes(eId)) {
      return {
        category: 'positive_peaceful',
        leftLabel: 'Gentle',
        rightLabel: 'Fully at ease',
        levels: {
          1: { label: 'Slightly relaxed', desc: 'Loosening up slightly and taking a breath.' },
          2: { label: 'Loosening up', desc: 'Tension is slowly leaving your shoulders and jaw.' },
          3: { label: 'Relaxed', desc: 'Comfortable, natural rhythm in your breath and body.' },
          4: { label: 'Deeply relaxed', desc: 'Peaceful stillness without any hurry or pressure.' },
          5: { label: 'Fully at ease', desc: 'Completely loose, peaceful, and resting in the moment.' }
        }
      };
    }

    if (['inspired', 'curious'].includes(eId)) {
      return {
        category: 'positive_inspired',
        leftLabel: 'A little',
        rightLabel: 'Deeply inspired',
        levels: {
          1: { label: 'Slightly inspired', desc: 'A small spark of creative interest or curiosity.' },
          2: { label: 'A little inspired', desc: 'Beginning to feel fresh ideas and interest.' },
          3: { label: 'Inspired', desc: 'Clear creative energy and motivation to explore.' },
          4: { label: 'Strongly inspired', desc: 'Excited momentum pulling your attention forward.' },
          5: { label: 'Deeply inspired', desc: 'This feeling is strongly present and giving you momentum.' }
        }
      };
    }

    if (['energized', 'motivated', 'confident', 'proud'].includes(eId)) {
      return {
        category: 'positive_energized',
        leftLabel: 'A little',
        rightLabel: 'Fully charged',
        levels: {
          1: { label: 'A little energized', desc: 'Waking up slowly with a gentle lift in energy.' },
          2: { label: 'Waking up', desc: 'Energy is building in your body and focus.' },
          3: { label: 'Energized', desc: 'Alert, motivated, and ready to engage.' },
          4: { label: 'Full of energy', desc: 'Strong vitality, clear direction, and active focus.' },
          5: { label: 'Completely energized', desc: 'Vibrant, clear, and fully charged with momentum.' }
        }
      };
    }

    if (['happy', 'joyful', 'grateful', 'playful', 'content'].includes(eId)) {
      return {
        category: 'positive_joyful',
        leftLabel: 'A little',
        rightLabel: 'Full of joy',
        levels: {
          1: { label: 'A little happy', desc: 'A light, gentle lift in your spirit.' },
          2: { label: 'Feeling good', desc: 'Noticeable lightness, warmth, and ease.' },
          3: { label: 'Happy', desc: 'Genuine joy and satisfaction in this moment.' },
          4: { label: 'Very happy', desc: 'Bright, radiant, and feeling deeply uplifted.' },
          5: { label: 'Full of joy', desc: 'Overflowing delight and warm, peaceful connection.' }
        }
      };
    }

    // General Positive Fallback
    return {
      category: 'positive_general',
      leftLabel: 'A little',
      rightLabel: 'Very strongly',
      levels: {
        1: { label: `Slightly ${name.toLowerCase()}`, desc: `A small, gentle touch of feeling ${name.toLowerCase()}.` },
        2: { label: `A little ${name.toLowerCase()}`, desc: `Present and giving you a positive lift.` },
        3: { label: name, desc: `Noticeably coloring your mood in a good way.` },
        4: { label: `Strongly ${name.toLowerCase()}`, desc: `Vibrant and carrying positive momentum.` },
        5: { label: `Fully present`, desc: `This feeling is strongly present and filling your space.` }
      }
    };
  }

  // 2. DIFFICULT / HIGH-INTENSITY EMOTIONS
  if (
    zoneId === 'high_unpleasant' ||
    ['anxious', 'stressed', 'overwhelmed', 'tense', 'frustrated', 'angry', 'panicked', 'restless'].includes(eId)
  ) {
    if (['overwhelmed', 'stressed'].includes(eId)) {
      return {
        category: 'difficult_overwhelmed',
        leftLabel: 'Slightly pressured',
        rightLabel: 'Difficult to manage',
        levels: {
          1: { label: 'Slightly pressured', desc: 'A faint weight of upcoming demands in the background.' },
          2: { label: 'Building up', desc: 'Several things are starting to stack together.' },
          3: { label: 'Noticeable', desc: 'Tension and load are actively pressing on you.' },
          4: { label: 'Strong', desc: 'Feeling crowded and stretched thin across demands.' },
          5: { label: 'Difficult to manage', desc: 'Carrying too much weight at once right now.' }
        }
      };
    }

    if (['anxious', 'panicked', 'restless'].includes(eId)) {
      return {
        category: 'difficult_anxious',
        leftLabel: 'Barely noticeable',
        rightLabel: 'Very intense',
        levels: {
          1: { label: 'Barely noticeable', desc: 'A faint background flutter or uneasiness.' },
          2: { label: 'Mild', desc: 'Present, but you can still focus on other things.' },
          3: { label: 'Noticeable', desc: 'Racing thoughts or uneasy flutter coloring your mood.' },
          4: { label: 'Strong', desc: 'Demanding active mental energy and attention.' },
          5: { label: 'Very intense', desc: 'This feeling is taking up a lot of space right now.' }
        }
      };
    }

    if (['frustrated', 'angry'].includes(eId)) {
      return {
        category: 'difficult_frustrated',
        leftLabel: 'Slight friction',
        rightLabel: 'Very intense',
        levels: {
          1: { label: 'Slightly irritated', desc: 'A minor friction or small annoyance.' },
          2: { label: 'Mild frustration', desc: 'Bothered, but still manageable to set aside.' },
          3: { label: 'Frustrated', desc: 'Noticeable friction and blocked energy.' },
          4: { label: 'Strong frustration', desc: 'Heated boundary violation or acute irritation.' },
          5: { label: 'Very intense', desc: 'Strong surge of frustration taking over your focus.' }
        }
      };
    }

    if (['tense'].includes(eId)) {
      return {
        category: 'difficult_tense',
        leftLabel: 'Slight tightness',
        rightLabel: 'Very tight',
        levels: {
          1: { label: 'Slight tightness', desc: 'A minor tension held in your shoulders or neck.' },
          2: { label: 'Mild tightness', desc: 'Tightness present in jaw, neck, or shoulders.' },
          3: { label: 'Tense', desc: 'Noticeable physical strain and muscle tightness.' },
          4: { label: 'Very tight', desc: 'Heavy stiffness and bracing in your body.' },
          5: { label: 'Extremely tense', desc: 'Locked muscles and intense physical strain.' }
        }
      };
    }

    // General Difficult Fallback
    return {
      category: 'difficult_general',
      leftLabel: 'Barely noticeable',
      rightLabel: 'Very intense',
      levels: {
        1: { label: 'Barely noticeable', desc: 'A faint flicker in the background.' },
        2: { label: 'Mild', desc: 'Present, but manageable to set aside.' },
        3: { label: 'Noticeable', desc: 'Actively coloring your mood and focus.' },
        4: { label: 'Strong', desc: 'Demanding significant focus and energy.' },
        5: { label: 'Very intense', desc: 'This feeling is taking up a lot of space right now.' }
      }
    };
  }

  // 3. LOW-ENERGY / TENDER / NEUTRAL EMOTIONS
  if (['sad', 'lonely', 'drained', 'tired', 'down', 'discouraged', 'numb', 'meh'].includes(eId)) {
    if (['tired', 'drained'].includes(eId)) {
      return {
        category: 'neutral_tired',
        leftLabel: 'A little weary',
        rightLabel: 'Completely spent',
        levels: {
          1: { label: 'A little weary', desc: 'A slight dip in your physical reserves.' },
          2: { label: 'Tired', desc: 'Bodily fatigue asking for a quiet pause.' },
          3: { label: 'Drained', desc: 'Low reserves and noticeably reduced focus.' },
          4: { label: 'Very exhausted', desc: 'Depleted energy needing genuine recovery.' },
          5: { label: 'Completely spent', desc: 'Battery on empty; needing deep rest and care.' }
        }
      };
    }

    if (['sad', 'down', 'discouraged'].includes(eId)) {
      return {
        category: 'neutral_sad',
        leftLabel: 'A little tender',
        rightLabel: 'Deeply tender',
        levels: {
          1: { label: 'Slightly tender', desc: 'A soft hint of melancholy or disappointment.' },
          2: { label: 'A little sad', desc: 'Gentle heaviness present in your chest.' },
          3: { label: 'Sad', desc: 'Noticeable emotional ache or sorrow.' },
          4: { label: 'Heavily down', desc: 'Weighing heavily on your thoughts and energy.' },
          5: { label: 'Deeply tender', desc: 'Carrying deep sorrow or tender vulnerability.' }
        }
      };
    }

    if (['lonely', 'numb', 'meh'].includes(eId)) {
      return {
        category: 'neutral_lonely',
        leftLabel: 'A little distant',
        rightLabel: 'Deeply isolated',
        levels: {
          1: { label: 'Slightly disconnected', desc: 'A fleeting feeling of detachment.' },
          2: { label: 'A little lonely', desc: 'Longing for genuine presence or understanding.' },
          3: { label: 'Noticeably isolated', desc: 'Feeling distant from others or flat.' },
          4: { label: 'Strongly disconnected', desc: 'Heavier sense of isolation or numbness.' },
          5: { label: 'Deeply isolated', desc: 'Feeling very far away or deeply alone right now.' }
        }
      };
    }
  }

  // Standard Universal Fallback
  return {
    category: 'standard',
    leftLabel: 'A little',
    rightLabel: 'Very strong',
    levels: {
      1: { label: 'Barely noticeable', desc: 'A faint background flicker.' },
      2: { label: 'Mild', desc: 'Present, but easily set aside.' },
      3: { label: 'Moderate', desc: 'Noticeably coloring your mood.' },
      4: { label: 'Strong', desc: 'Demanding active focus and energy.' },
      5: { label: 'Very intense', desc: 'Taking up significant space right now.' }
    }
  };
}
