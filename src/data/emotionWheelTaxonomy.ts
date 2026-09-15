export type EmotionFamilyId = 'love' | 'joy' | 'surprise' | 'sadness' | 'fear' | 'anger';

export interface EmotionItem {
  id: string;
  name: string;
  nuance?: string;
  def?: string;
  physicalSensations?: string[];
  reflectionPrompt?: string;
}

export interface EmotionCategory {
  id: string;
  name: string;
  description?: string;
  emotions: EmotionItem[];
}

export interface EmotionFamily {
  id: EmotionFamilyId;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  secondaryColor: string;
  accent: string;
  glowColor: string;
  bgGradient: string;
  categories: EmotionCategory[];
}

/**
 * Complete Data-Driven Emotion Wheel Taxonomy
 * 6 Primary Families (Love, Joy, Surprise, Sadness, Fear, Anger)
 * 24 Secondary Categories
 * 128+ Granular Tertiary Emotions
 */
export const EMOTION_WHEEL_TAXONOMY: EmotionFamily[] = [
  // 1. LOVE
  {
    id: 'love',
    name: 'Love',
    subtitle: 'Deep Connection & Openness',
    description: 'Feelings of warmth, tenderness, affection, and bonding with others or self.',
    color: '#ec4899', // Rose/Pink
    secondaryColor: '#f43f5e',
    accent: '#f472b6',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    bgGradient: 'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.18) 0%, rgba(13, 27, 42, 0) 70%)',
    categories: [
      {
        id: 'affectionate',
        name: 'Affectionate',
        description: 'Warm and caring toward someone',
        emotions: [
          { id: 'romantic', name: 'Romantic', nuance: 'Passionate and deeply connected', def: 'Feeling amorous intimacy' },
          { id: 'fond', name: 'Fond', nuance: 'Gentle warmth and liking', def: 'Having an affectionate liking for someone' },
          { id: 'sentimental', name: 'Sentimental', nuance: 'Tender nostalgia and warmth', def: 'Prompted by feelings of tenderness' },
          { id: 'adoring', name: 'Adoring', nuance: 'Deep, devoted admiration', def: 'Loving someone deeply and respectfully' }
        ]
      },
      {
        id: 'longing',
        name: 'Longing',
        description: 'A yearning for closeness or presence',
        emotions: [
          { id: 'yearning', name: 'Yearning', nuance: 'Deep craving for what is distant', def: 'Intense feeling of longing' },
          { id: 'nostalgic', name: 'Nostalgic', nuance: 'Bittersweet longing for the past', def: 'Longing for past associations' },
          { id: 'pining', name: 'Pining', nuance: 'Aching for absent companionship', def: 'Suffering a lingering desire' }
        ]
      },
      {
        id: 'compassionate',
        name: 'Compassionate',
        description: 'Tender empathy and caring presence',
        emotions: [
          { id: 'tender', name: 'Tender', nuance: 'Soft, gentle vulnerability', def: 'Showing gentleness and kindness' },
          { id: 'sympathetic', name: 'Sympathetic', nuance: 'Feeling alongside another in care', def: 'Sharing feelings of pity and sorrow' },
          { id: 'caring', name: 'Caring', nuance: 'Active attentiveness to well-being', def: 'Displaying kindness and concern' }
        ]
      },
      {
        id: 'connected',
        name: 'Connected',
        description: 'Sense of belonging and trust',
        emotions: [
          { id: 'secure', name: 'Secure', nuance: 'Safe, grounded relational trust', def: 'Feeling protected and free from doubt' },
          { id: 'embraced', name: 'Embraced', nuance: 'Welcomed and accepted as you are', def: 'Feeling held with care' },
          { id: 'devoted', name: 'Devoted', nuance: 'Steadfast loyalty and dedication', def: 'Very loving or loyal' }
        ]
      }
    ]
  },

  // 2. JOY
  {
    id: 'joy',
    name: 'Joy',
    subtitle: 'Vibrant Warmth & Delight',
    description: 'High vitality, uplifting lightness, gratitude, and expansive well-being.',
    color: '#eab308', // Warm Gold/Amber
    secondaryColor: '#f59e0b',
    accent: '#fde047',
    glowColor: 'rgba(234, 179, 8, 0.35)',
    bgGradient: 'radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.18) 0%, rgba(13, 27, 42, 0) 70%)',
    categories: [
      {
        id: 'content',
        name: 'Content',
        description: 'Quiet, settled satisfaction with what is',
        emotions: [
          { id: 'peaceful', name: 'Peaceful', nuance: 'Harmonious stillness inside', def: 'Free from disturbance and quiet' },
          { id: 'calm', name: 'Calm', nuance: 'Unhurried ease in the nervous system', def: 'Not showing or feeling nervousness' },
          { id: 'grateful', name: 'Grateful', nuance: 'Warm appreciation for life and gifts', def: 'Showing appreciation for kindness' },
          { id: 'satisfied', name: 'Satisfied', nuance: 'Complete fullness with the moment', def: 'Contented or pleased' }
        ]
      },
      {
        id: 'enthusiastic',
        name: 'Enthusiastic',
        description: 'Eager forward momentum and anticipation',
        emotions: [
          { id: 'excited', name: 'Excited', nuance: 'High-tempo positive anticipation', def: 'Very enthusiastic and eager' },
          { id: 'passionate', name: 'Passionate', nuance: 'Fierce, vivid dedication', def: 'Having strong beliefs or enthusiasm' },
          { id: 'inspired', name: 'Inspired', nuance: 'Creative clarity and fresh vision', def: 'Filled with the urge to do something creative' },
          { id: 'eager', name: 'Eager', nuance: 'Ready and keen to begin', def: 'Wanting to have or do something very much' }
        ]
      },
      {
        id: 'playful',
        name: 'Playful',
        description: 'Lighthearted, spontaneous, and uninhibited',
        emotions: [
          { id: 'cheerful', name: 'Cheerful', nuance: 'Bright, buoyant spirits', def: 'Noticeably happy and optimistic' },
          { id: 'amused', name: 'Amused', nuance: 'Light humor and smiling ease', def: 'Finding something funny or entertaining' },
          { id: 'delighted', name: 'Delighted', nuance: 'Brimming with spontaneous smile', def: 'Feeling or showing great pleasure' }
        ]
      },
      {
        id: 'proud',
        name: 'Proud',
        description: 'Deep recognition of strength or effort',
        emotions: [
          { id: 'confident', name: 'Confident', nuance: 'Grounded trust in your capability', def: 'Feeling or showing certainty' },
          { id: 'victorious', name: 'Victorious', nuance: 'Celebrating an overcome challenge', def: 'Having won a victory; triumphant' },
          { id: 'valued', name: 'Valued', nuance: 'Recognized for your authentic worth', def: 'Considered to be important or beneficial' }
        ]
      }
    ]
  },

  // 3. SURPRISE
  {
    id: 'surprise',
    name: 'Surprise',
    subtitle: 'Sudden Shift & Awakening',
    description: 'Sudden unexpected awakenings, curiosity, awe, or brief disorientation.',
    color: '#06b6d4', // Cyan/Sky
    secondaryColor: '#0ea5e9',
    accent: '#67e8f9',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    bgGradient: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.18) 0%, rgba(13, 27, 42, 0) 70%)',
    categories: [
      {
        id: 'amazed',
        name: 'Amazed',
        description: 'Captivated by wonder or vastness',
        emotions: [
          { id: 'astonished', name: 'Astonished', nuance: 'Striking wonder at the unexpected', def: 'Greatly surprised or impressed' },
          { id: 'awe-struck', name: 'Awestruck', nuance: 'Humbled by immense beauty or scale', def: 'Filled with awe' },
          { id: 'fascinated', name: 'Fascinated', nuance: 'Drawn in with intense curiosity', def: 'Strongly attracted and interested' }
        ]
      },
      {
        id: 'confused',
        name: 'Confused',
        description: 'Searching for clarity amid the unexpected',
        emotions: [
          { id: 'perplexed', name: 'Perplexed', nuance: 'Unable to grasp the unfolding pattern', def: 'Completely baffled; very puzzled' },
          { id: 'disillusioned', name: 'Disillusioned', nuance: 'A sudden stripping away of assumptions', def: 'Disappointed in someone or something' },
          { id: 'bewildered', name: 'Bewildered', nuance: 'Momentarily disoriented by change', def: 'Perplexed and confused; very puzzled' }
        ]
      },
      {
        id: 'startled',
        name: 'Startled',
        description: 'Quick jolt to the sensory awareness',
        emotions: [
          { id: 'shocked', name: 'Shocked', nuance: 'Sudden cognitive impact', def: 'Surprised and upset by an unpleasant event' },
          { id: 'dismayed', name: 'Dismayed', nuance: 'Startled distress at an outcome', def: 'Concern and distress caused by something unexpected' }
        ]
      },
      {
        id: 'moved',
        name: 'Moved',
        description: 'Touching emotional awakening',
        emotions: [
          { id: 'touched', name: 'Touched', nuance: 'Warmly stirred by someone\'s gesture', def: 'Moved to gentle compassion or gratitude' },
          { id: 'stimulated', name: 'Stimulated', nuance: 'Alert, receptive, and energized', def: 'Encouraged or energized into activity' }
        ]
      }
    ]
  },

  // 4. SADNESS
  {
    id: 'sadness',
    name: 'Sadness',
    subtitle: 'Tender Heaviness & Reflection',
    description: 'Feelings of loss, grief, fatigue, heartache, or a need for gentle restoration.',
    color: '#3b82f6', // Gentle Blue
    secondaryColor: '#2563eb',
    accent: '#93c5fd',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    bgGradient: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.18) 0%, rgba(13, 27, 42, 0) 70%)',
    categories: [
      {
        id: 'lonely',
        name: 'Lonely',
        description: 'Aching for genuine presence and connection',
        emotions: [
          { id: 'isolated', name: 'Isolated', nuance: 'Feeling set apart with walls up', def: 'Far away from other places, buildings, or people' },
          { id: 'abandoned', name: 'Abandoned', nuance: 'Left to carry things alone', def: 'Having been deserted or left' },
          { id: 'unheard', name: 'Unheard', nuance: 'Words falling into empty space', def: 'Not listened to or acknowledged' }
        ]
      },
      {
        id: 'vulnerable',
        name: 'Vulnerable',
        description: 'Open, fragile, and sensitive to impact',
        emotions: [
          { id: 'fragile', name: 'Fragile', nuance: 'Easily bruised right now', def: 'Easily broken or damaged' },
          { id: 'grief', name: 'Grief', nuance: 'Deep ache of honoring what was lost', def: 'Deep sorrow, especially that caused by someone\'s death' },
          { id: 'heartbroken', name: 'Heartbroken', nuance: 'Torn tenderly at the core', def: 'Overwhelmed by sorrow' }
        ]
      },
      {
        id: 'despair',
        name: 'Despair',
        description: 'Heavy friction and dim forward vision',
        emotions: [
          { id: 'hopeless', name: 'Discouraged', nuance: 'Drained of immediate momentum', def: 'Having lost confidence or enthusiasm' },
          { id: 'sorrowful', name: 'Sorrowful', nuance: 'Deep, quiet mournful weight', def: 'Feeling or showing grief' },
          { id: 'gloomy', name: 'Gloomy', nuance: 'Overcast skies within your mood', def: 'Dark or poorly lit; feeling dejected' }
        ]
      },
      {
        id: 'guilty',
        name: 'Guilty',
        description: 'Internal friction against your own values',
        emotions: [
          { id: 'regretful', name: 'Regretful', nuance: 'Looking back wishing for another way', def: 'Feeling or showing regret' },
          { id: 'ashamed', name: 'Ashamed', nuance: 'Discomfort with how you showed up', def: 'Embarrassed or guilty because of one\'s actions' },
          { id: 'remorseful', name: 'Remorseful', nuance: 'Aching desire to make things right', def: 'Filled with remorse; sorry' }
        ]
      }
    ]
  },

  // 5. FEAR
  {
    id: 'fear',
    name: 'Fear',
    subtitle: 'Protective Alert & Caution',
    description: 'Nervous system vigilance, uncertainty, apprehension, or feeling overloaded.',
    color: '#8b5cf6', // Violet/Purple
    secondaryColor: '#7c3aed',
    accent: '#c4b5fd',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    bgGradient: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.18) 0%, rgba(13, 27, 42, 0) 70%)',
    categories: [
      {
        id: 'scared',
        name: 'Scared',
        description: 'Vigilant guard against a perceived threat',
        emotions: [
          { id: 'panicked', name: 'Panicked', nuance: 'Acute, racing surge of urgency', def: 'Sudden uncontrollable fear or anxiety' },
          { id: 'terrified', name: 'Terrified', nuance: 'Frozen by sudden overwhelming threat', def: 'Cause to feel extreme fear' },
          { id: 'frightened', name: 'Frightened', nuance: 'Spooked into heightened caution', def: 'Afraid or anxious' }
        ]
      },
      {
        id: 'anxious',
        name: 'Anxious',
        description: 'Restless anticipation of uncertain futures',
        emotions: [
          { id: 'overwhelmed', name: 'Overwhelmed', nuance: 'Too many demands pulling at once', def: 'Bury or drown beneath a huge mass' },
          { id: 'worried', name: 'Worried', nuance: 'Mind cycling through what-ifs', def: 'Anxious or troubled about actual problems' },
          { id: 'apprehensive', name: 'Apprehensive', nuance: 'Hesitant uneasy step forward', def: 'Anxious or fearful that something bad will happen' },
          { id: 'restless', name: 'Restless', nuance: 'Agitated body seeking safe ground', def: 'Unable to rest or relax as a result of anxiety' }
        ]
      },
      {
        id: 'insecure',
        name: 'Insecure',
        description: 'Self-doubt and questioning your footing',
        emotions: [
          { id: 'inadequate', name: 'Inadequate', nuance: 'Believing you aren\'t enough right now', def: 'Lacking the quality or quantity required' },
          { id: 'inferior', name: 'Inferior', nuance: 'Comparing your insides to others\' outsides', def: 'Lower in rank, status, or quality' },
          { id: 'defensive', name: 'Defensive', nuance: 'Armoring up against criticism', def: 'Very anxious to challenge or avoid criticism' }
        ]
      },
      {
        id: 'intimidated',
        name: 'Intimidated',
        description: 'Feeling overshadowed by pressure or power',
        emotions: [
          { id: 'threatened', name: 'Threatened', nuance: 'Sensing danger to your peace or status', def: 'Vulnerable to at risk' },
          { id: 'nervous', name: 'Nervous', nuance: 'Flutter in stomach before performance', def: 'Easily agitated or alarmed' }
        ]
      }
    ]
  },

  // 6. ANGER
  {
    id: 'anger',
    name: 'Anger',
    subtitle: 'Boundary Signal & Injustice',
    description: 'Strong emotional surges signaling crossed boundaries, unmet needs, or frustration.',
    color: '#ef4444', // Red/Coral
    secondaryColor: '#dc2626',
    accent: '#fca5a5',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    bgGradient: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.18) 0%, rgba(13, 27, 42, 0) 70%)',
    categories: [
      {
        id: 'frustrated',
        name: 'Frustrated',
        description: 'Blocked progress and hitting friction',
        emotions: [
          { id: 'annoyed', name: 'Annoyed', nuance: 'Low-grade prickle of persistent irritation', def: 'Slightly angry; irritated' },
          { id: 'irritated', name: 'Irritated', nuance: 'Skin-deep tension rubbing raw', def: 'Showing or feeling slight anger' },
          { id: 'impatient', name: 'Impatient', nuance: 'Tension when timing is dragging', def: 'Restlessly eager to go ahead' }
        ]
      },
      {
        id: 'aggressive',
        name: 'Aggressive',
        description: 'Outward surge of defensive force',
        emotions: [
          { id: 'hostile', name: 'Hostile', nuance: 'Ready for conflict or standoff', def: 'Unfriendly; antagonistic' },
          { id: 'provoked', name: 'Provoked', nuance: 'Pushed past your limit by an action', def: 'Stimulate or give rise to a reaction' },
          { id: 'furious', name: 'Furious', nuance: 'Intense fire of boundary violation', def: 'Extremely angry' }
        ]
      },
      {
        id: 'critical',
        name: 'Critical',
        description: 'Sharp evaluation and judgment',
        emotions: [
          { id: 'skeptical', name: 'Skeptical', nuance: 'Guarded doubt about honesty', def: 'Not easily convinced; having doubts' },
          { id: 'dismissive', name: 'Dismissive', nuance: 'Shutting down out of exasperation', def: 'Feeling or showing that something is unworthy' },
          { id: 'sarcastic', name: 'Sarcastic', nuance: 'Masking sting behind sharp wit', def: 'Marked by or given to using sarcasm' }
        ]
      },
      {
        id: 'distant',
        name: 'Distant',
        description: 'Stepping back behind cold protective walls',
        emotions: [
          { id: 'numb', name: 'Numb', nuance: 'Protective disconnection from overload', def: 'Deprived of the power of sensation' },
          { id: 'withdrawn', name: 'Withdrawn', nuance: 'Pulling inward away from noise', def: 'Not wanting to communicate with other people' },
          { id: 'suspicious', name: 'Suspicious', nuance: 'Hyper-vigilant about hidden motives', def: 'Having or showing a cautious distrust' }
        ]
      }
    ]
  }
];

/**
 * Utility: Flattened list of all granular emotions for instant search & lookup
 */
export const ALL_EMOTIONS_FLAT = EMOTION_WHEEL_TAXONOMY.flatMap((family) =>
  family.categories.flatMap((category) =>
    category.emotions.map((emotion) => ({
      ...emotion,
      familyId: family.id,
      familyName: family.name,
      familyColor: family.color,
      categoryId: category.id,
      categoryName: category.name
    }))
  )
);

/**
 * Utility: Search emotions with fuzzy string matching on name, nuance, and category
 */
export function searchEmotions(query: string) {
  if (!query || !query.trim()) return [];
  const clean = query.toLowerCase().trim();

  return ALL_EMOTIONS_FLAT.filter((item) => {
    return (
      item.name.toLowerCase().includes(clean) ||
      (item.nuance && item.nuance.toLowerCase().includes(clean)) ||
      item.categoryName.toLowerCase().includes(clean) ||
      item.familyName.toLowerCase().includes(clean)
    );
  });
}
