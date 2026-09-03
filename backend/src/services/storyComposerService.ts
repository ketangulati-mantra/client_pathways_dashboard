import { StoryContext } from './storyContextService.js';
import { StoryState, StoryChapter, StorySourceInput } from './storyService.js';
import { StoryThread, storyContinuityService, NarrativeFacts } from './storyContinuityService.js';
import { PacingState, EndingStyle, storyPacingAndSuspense } from './storyPacingAndSuspense.js';
import { storyCycleService, CycleProgress, NextCyclePreview } from './storyCycleService.js';
import { storyPersonalizationService, StoryPersonalization, PersonalTruths, DailyEmotionalArc } from './storyPersonalizationService.js';

export type SuspenseMechanism =
  | 'unanswered_discovery'
  | 'partial_revelation'
  | 'new_possibility'
  | 'approaching_choice'
  | 'environmental_change'
  | 'transformation_beginning';

export interface NarrativeMemory {
  recentOpenings: string[];
  recentArchetypes: string[];
  recentSymbols: string[];
  recentSuspenseTypes: string[];
  recentEndingStyles: string[];
  recentPacings: string[];
  recentEnvCategories: string[];
  recentTitles: string[];
}

export interface ComposedStoryChapter {
  title: string;
  content: string;
  narrativeSummary: string;
  metadata: {
    worldId: string;
    worldName: string;
    archetype: string;
    symbolsUsed: string[];
    suspenseType: SuspenseMechanism;
    atmosphericTone: string;
    themesUsed: string[];
    pacing: PacingState;
    endingStyle: EndingStyle;
    openingKey?: string;
    cycleStage: string;
    wordCount: number;
  };
  openThreads: StoryThread[];
  narrativeFacts: NarrativeFacts;
  cycleId: string;
  cycleName: string;
  worldTheme: string;
  cycleProgress: CycleProgress;
  nextCyclePreview: NextCyclePreview | null;
  sourceInputs: StorySourceInput[];
}

// Deterministic PRNG using Mulberry32
function createDeterministicRng(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function selectNonRepeating<T>(
  pool: T[],
  recentItems: string[],
  rng: () => number,
  getKey: (item: T) => string = (item) => String(item)
): T {
  if (!pool || pool.length === 0) throw new Error('Cannot select from empty pool');
  if (pool.length === 1) return pool[0];

  const lastItem = recentItems[recentItems.length - 1];
  const eligible = pool.filter((item) => getKey(item) !== lastItem);
  const candidates = eligible.length > 0 ? eligible : pool;

  const scored = candidates.map((item) => {
    const key = getKey(item);
    const recencyIndex = recentItems.lastIndexOf(key);
    const recencyDistance = recencyIndex === -1 ? 99 : recentItems.length - recencyIndex;
    return { item, recencyDistance };
  });

  scored.sort((a, b) => b.recencyDistance - a.recencyDistance);
  const topDistance = scored[0].recencyDistance;
  const topTier = scored.filter((s) => s.recencyDistance >= topDistance - 1).map((s) => s.item);

  const pickedIndex = Math.floor(rng() * topTier.length);
  return topTier[pickedIndex];
}

// Simple, grounded world settings
interface WorldDefinition {
  id: string;
  name: string;
  theme: string;
  locations: string[];
  openings: Array<{ id: string; text: string }>;
  companion: { name: string; role: string; dialogue: string[] };
  sceneDescriptions: {
    tense: string;
    neutral: string;
    relaxed: string;
  };
  actions: string[];
  consequences: string[];
  suspenseHooks: Record<SuspenseMechanism, string>;
}

const STORY_WORLDS: Record<string, WorldDefinition> = {
  cartographic_archive: {
    id: 'cartographic_archive',
    name: 'The Great Map Archive',
    theme: 'maps_and_measured_steps',
    locations: ['The Upper Study Room', 'The Long Table of Notes', 'The Cedar Balcony', 'The Draftsman’s Hall'],
    openings: [
      { id: 'ca_1', text: 'You walked into the upper study room, where tall wooden shelves were packed with notebooks and unfinished maps.' },
      { id: 'ca_2', text: 'The afternoon light fell across the large oak table, shining over stacks of papers and open notebooks.' },
      { id: 'ca_3', text: 'You pulled out a wooden chair by the window, surrounded by rows of charts that other travelers had left behind.' },
      { id: 'ca_4', text: 'The room was quiet except for the rustle of paper as you sat down to look at what was left to do.' }
    ],
    companion: {
      name: 'Oren',
      role: 'someone who had spent years organizing the maps and knew when to take a break',
      dialogue: [
        '"You don’t have to finish every single page tonight."',
        '"Put that down for a minute. The road isn’t going anywhere."',
        '"Look how much ground you’ve already covered since you got here."'
      ]
    },
    sceneDescriptions: {
      tense: 'The pile of notes seemed to grow every time you looked at it, making the room feel smaller than it really was.',
      neutral: 'The smell of dry paper and cedar wood filled the air, giving you a steady place to sit and think.',
      relaxed: 'Outside the window, the pine hills stretched out under a clear sky, open and unhurried.'
    },
    actions: [
      'You picked up the heaviest notebook, closed the front cover, and set it neatly on the side of the table.',
      'You pushed the drafts back just enough to make clear space on the wood for your hands to rest.',
      'You folded the largest survey map and put it back on the shelf, deciding that today’s work was enough.'
    ],
    consequences: [
      'As soon as you stepped away from the desk, your shoulders dropped and breathing felt noticeably easier.',
      'The room seemed to open up, and the tasks on the table no longer felt like a wall in front of you.',
      'A cool breeze blew in through the open door, clearing away the stale air of a long afternoon.'
    ],
    suspenseHooks: {
      unanswered_discovery: 'Before heading down the stairs, you noticed a small brass key resting inside an empty cubby. You put it in your pocket, wondering which drawer in this building it opens.',
      new_possibility: 'At the far end of the hallway, a door you had never seen open before stood slightly ajar, showing a quiet path leading outside.',
      approaching_choice: 'At the landing, two stairs led down: one back toward the busy worktables, the other out to the open terrace under the evening sky.',
      transformation_beginning: 'The paper on your desk caught the evening light, and for the first time all day, the notes looked manageable instead of overwhelming.',
      partial_revelation: 'In the corner of the map you had been working on, someone had written a short note in pencil: "Rest here first." The rest of the message was faded, waiting for tomorrow.',
      environmental_change: 'The lamps down the hall turned on with a warm, steady glow, lighting the path back to your room.'
    }
  },

  mountain_bridges: {
    id: 'mountain_bridges',
    name: 'The Valley of High Bridges',
    theme: 'canyons_and_honest_words',
    locations: ['The Ridge Footbridge', 'The Stone Waystation', 'The Overlook Bench', 'The Sheltered Gap'],
    openings: [
      { id: 'mb_1', text: 'You walked along the stone path between two mountain ridges, where a sturdy footbridge crossed the misty gap.' },
      { id: 'mb_2', text: 'The mountain air was clean and cold, blowing down from the granite peaks above the trail.' },
      { id: 'mb_3', text: 'You reached a sheltered wooden waystation built directly into the side of the cliff.' },
      { id: 'mb_4', text: 'The sound of the wind in the pines filled the valley as you paused by the stone railing.' }
    ],
    companion: {
      name: 'Kael',
      role: 'a bridge-tender who understood that saying what you mean takes time',
      dialogue: [
        '"It takes courage to say the first word, but it gets easier after that."',
        '"You don’t have to carry the whole conversation by yourself."',
        '"Sit here for a bit. The bridge will still be here when you’re ready."'
      ]
    },
    sceneDescriptions: {
      tense: 'The distance between the two ridges felt wide, and cold mountain gusts made every step feel cautious.',
      neutral: 'The solid granite stones beneath your boots held the warmth of the afternoon sun.',
      relaxed: 'The clouds below the bridge parted, showing green valleys and quiet rivers flowing peacefully.'
    },
    actions: [
      'You took the letter from your pocket, set it flat on the wooden bench, and looked across the bridge.',
      'You stopped midway across the span, holding the wooden railing with both hands and letting the wind pass.',
      'You turned toward your companion, deciding to share what was on your mind without trying to make it sound perfect.'
    ],
    consequences: [
      'Speaking the truth out loud made the knot in your stomach loosen immediately.',
      'The bridge felt steady and solid underfoot, and the opposite ridge no longer seemed out of reach.',
      'A warm breeze swept up from the valley floor, taking the cold edge off the evening air.'
    ],
    suspenseHooks: {
      unanswered_discovery: 'On the waystation ledger, you noticed a small wooden token carved with your initials. Nobody was around to say who left it there.',
      new_possibility: 'Beyond the main footbridge, a narrow stone trail wound up toward a viewpoint you hadn’t noticed before.',
      approaching_choice: 'At the end of the bridge, the trail split into two directions: one climbing toward the high ridge, the other heading down toward the village lights.',
      transformation_beginning: 'The bell on the bridge tower rang once, clear and low, echoing across the valley with a sound that felt reassuring.',
      partial_revelation: 'A wooden signpost by the trail had one line legible in the fading light: "The hardest part of the crossing is the first step."',
      environmental_change: 'The evening clouds below turned gold as the sun dipped behind the mountain, lighting the path ahead.'
    }
  },

  sunken_greenhouse: {
    id: 'sunken_greenhouse',
    name: 'The Sunken Conservatory',
    theme: 'plants_and_quiet_rest',
    locations: ['The Lower Fern Garden', 'The Glass Domed Rotunda', 'The Stone Pool', 'The Potting Shed'],
    openings: [
      { id: 'sg_1', text: 'You walked down the stone stairs into the glass conservatory, where the air was warm and smelled of damp earth.' },
      { id: 'sg_2', text: 'Rain tapped steadily against the glass roof above, making a gentle, continuous sound throughout the room.' },
      { id: 'sg_3', text: 'Green leaves and climbing vines covered the iron frames, creating pockets of quiet shade along the walkway.' },
      { id: 'sg_4', text: 'You found a dry cedar bench beside a clear water pool and sat down out of the rain.' }
    ],
    companion: {
      name: 'Rowan',
      role: 'someone who took care of the plants and knew that rushing never helps things grow',
      dialogue: [
        '"Things take time to recover. You can’t force a plant to bloom in an hour."',
        '"Take your shoes off if you want. Nobody is asking anything of you here."',
        '"Resting isn’t giving up. It’s how you get your strength back."'
      ]
    },
    sceneDescriptions: {
      tense: 'Your mind kept racing through everything you thought you should be fixing, even while sitting still.',
      neutral: 'The humid warmth of the greenhouse settled over your shoulders like a heavy, comforting blanket.',
      relaxed: 'Sunlight broke through the rain clouds, lighting up hundreds of bright water droplets on the ferns.'
    },
    actions: [
      'You set your heavy bag down on the dirt floor, leaned back against the wooden bench, and closed your eyes.',
      'You dipped your fingers into the cool water of the stone basin, letting your scattered thoughts slow down.',
      'You took a deep, full breath of the humid air and let yourself do absolutely nothing for ten straight minutes.'
    ],
    consequences: [
      'The constant tension in your neck and forehead melted away in the warmth of the room.',
      'Sitting still stopped feeling uncomfortable, turning into something restful and deeply needed.',
      'The steady sound of the rain outside became a comfort rather than another noise to worry about.'
    ],
    suspenseHooks: {
      unanswered_discovery: 'Tucked between the roots of an old fig tree, a small clay jar held dried seeds labeled with tomorrow’s date.',
      new_possibility: 'At the back of the conservatory, a low wooden gate stood unlatched, leading to an outdoor garden behind the glass walls.',
      approaching_choice: 'You noticed two paths through the plants: one leading back to the entrance, the other deeper into the quiet green shade.',
      transformation_beginning: 'A small pale flower beside your bench began to open its petals in the warm air, giving off a clean, sweet scent.',
      partial_revelation: 'Carved into the cedar bench was a simple sentence: "You are allowed to stop here."',
      environmental_change: 'The afternoon storm passed, leaving the glass roof completely clear as warm evening sun poured in.'
    }
  },

  clocktower_slackwater: {
    id: 'clocktower_slackwater',
    name: 'The Harbour Clocktower',
    theme: 'time_and_slowing_down',
    locations: ['The Lower Gear Room', 'The Keeper’s Desk', 'The Harbour Balcony', 'The Pendulum Gallery'],
    openings: [
      { id: 'cs_1', text: 'You stepped inside the stone clocktower by the harbour, where large brass gears turned with slow, heavy rhythm.' },
      { id: 'cs_2', text: 'Outside the tower window, the harbour water was completely flat and calm in the late afternoon stillness.' },
      { id: 'cs_3', text: 'The low, steady hum of the tower machinery filled the room, sounding like an old, patient heartbeat.' },
      { id: 'cs_4', text: 'You walked over to the keeper’s desk by the window, where the logbook lay open in the amber light.' }
    ],
    companion: {
      name: 'Vane',
      role: 'the timekeeper who knew that the most important hours are the ones you spend resting',
      dialogue: [
        '"The world doesn’t end just because you stepped away from your desk."',
        '"You’ve been running against the clock all day. Sit down."',
        '"Time moves at its own pace. You don’t have to push it."'
      ]
    },
    sceneDescriptions: {
      tense: 'The ticking of the smaller dials around the wall made you feel like you were running late for something unseen.',
      neutral: 'The slow, unwavering swing of the main pendulum created a steady rhythm that anchored the room.',
      relaxed: 'The open water in the harbour reflected the first evening stars, calm and undisturbed.'
    },
    actions: [
      'You turned away from the ticking dials, pulled out the heavy leather armchair, and sat down facing the water.',
      'You closed the work ledger on the desk, put your pen down beside it, and chose not to open it again today.',
      'You placed both hands on the cool stone windowsill and watched the boats rock gently at their moorings.'
    ],
    consequences: [
      'The frantic rush in your chest slowed down to match the deep cadence of the tower pendulum.',
      'The long list of things you thought you had to do tonight suddenly stopped feeling urgent.',
      'A quiet, clear feeling settled over you: you had survived the rush, and now you could rest.'
    ],
    suspenseHooks: {
      unanswered_discovery: 'On the windowsill, you found an old pocket watch that had stopped at the exact minute you decided to sit down.',
      new_possibility: 'A narrow wooden stairway led down to a private pier where a small rowboat was moored in the still water.',
      approaching_choice: 'Looking down at the harbour, you saw two paths: one leading back into the busy market streets, the other along the quiet seawall.',
      transformation_beginning: 'The main clock chime sounded across the bay, deep and clear, marking the start of an evening that belonged entirely to you.',
      partial_revelation: 'Written in the logbook was an entry from a traveler years ago: "The tide always turns when you stop pushing it."',
      environmental_change: 'The amber light from the lighthouse across the bay turned on, shining a steady line of gold across the dark water.'
    }
  },

  highland_observatory: {
    id: 'highland_observatory',
    name: 'The Mountain Observatory',
    theme: 'starlight_and_self_kindness',
    locations: ['The Telescope Dome', 'The Star Chart Room', 'The Pine Stove Hearth', 'The High Balcony'],
    openings: [
      { id: 'ho_1', text: 'You stepped into the high dome of the mountain observatory, where brass telescopes pointed up toward the evening sky.' },
      { id: 'ho_2', text: 'The crisp mountain wind blew through the open dome, bringing the fresh, clean smell of high alpine pines.' },
      { id: 'ho_3', text: 'Starlight shone through the curved glass lenses, making small circles of white light on the dark stone floor.' },
      { id: 'ho_4', text: 'You stood by the iron stove in the chart room, warming your hands by the crackling pine wood.' }
    ],
    companion: {
      name: 'Alden',
      role: 'an astronomer who looked at mistakes on maps as normal parts of learning',
      dialogue: [
        '"You’re being too hard on yourself. Nobody gets the course right on the first try."',
        '"Look up for a second. The sky isn’t grading you."',
        '"You did the best you could with what you knew today. That’s enough."'
      ]
    },
    sceneDescriptions: {
      tense: 'You caught yourself reviewing every mistake you made today, as if you had failed an important test.',
      neutral: 'The solid brass instruments and steady stove fire made the mountain room feel warm and secure.',
      relaxed: 'The vast night sky stretched out overhead, quiet and open, asking for nothing.'
    },
    actions: [
      'You put down the red correction pencil, looked up from the chart, and leaned back in the wooden chair.',
      'You walked out onto the high observation deck and let the cool mountain air clear the heavy thoughts from your head.',
      'You smiled at your own reflection in the telescope lens, choosing to let go of today’s self-criticism.'
    ],
    consequences: [
      'The harsh inner voice that had followed you around all day finally quieted down.',
      'Your chest felt lighter, as if you had just set down a heavy stone you didn’t need to carry.',
      'A warm, steady feeling of patience with yourself replaced the tension in your jaw and shoulders.'
    ],
    suspenseHooks: {
      unanswered_discovery: 'Inside the lens case on the table, you found a glass slide marked with a constellation that didn’t appear on any of the standard charts.',
      new_possibility: 'A small door in the side of the dome led out to a high path along the mountain ridge, lit by the moon.',
      approaching_choice: 'Two observation logs lay side by side on the table: one filled with critical notes, the other completely blank and ready for fresh writing.',
      transformation_beginning: 'A bright shooting star cut across the sky above the dome, leaving a trail of white light that lingered for several seconds.',
      partial_revelation: 'In the margins of the star atlas, an astronomer had written: "Stars don’t hurry to burn; they simply shine."',
      environmental_change: 'The fog in the valleys below rolled away, revealing the lights of distant towns shining like quiet embers in the dark.'
    }
  },

  courtyard_lanterns: {
    id: 'courtyard_lanterns',
    name: 'The Courtyard of Small Lanterns',
    theme: 'tea_and_simple_moments',
    locations: ['The Morning Porch', 'The Raked Stone Garden', 'The Bamboo Walk', 'The Tea Pavilion'],
    openings: [
      { id: 'cl_1', text: 'You stepped out onto the smooth wooden porch of the courtyard, where paper lanterns swayed gently in the morning air.' },
      { id: 'cl_2', text: 'Steam rose from a warm clay cup of tea resting on the wooden table beside your chair.' },
      { id: 'cl_3', text: 'Morning sunlight warmed the wooden floorboards, lighting up the smooth river stones placed around the garden.' },
      { id: 'cl_4', text: 'A light breeze rustled the bamboo behind the courtyard, making a quiet, rhythmic sound.' }
    ],
    companion: {
      name: 'Koji',
      role: 'someone who believed that one quiet cup of tea could set the tone for an entire day',
      dialogue: [
        '"Drink this while it’s hot. The rest of the world can wait ten minutes."',
        '"Notice the warmth in your hands before you start thinking about later."',
        '"A good day starts with one simple, unhurried moment."'
      ]
    },
    sceneDescriptions: {
      tense: 'Your thoughts kept jumping ahead to everything on your to-do list, pulling you away from the morning.',
      neutral: 'The warm cup in your hands and the quiet garden created an immediate, comforting place to sit.',
      relaxed: 'Golden sunlight spread across the whole courtyard, warm and peaceful.'
    },
    actions: [
      'You put your notebook face down on the table, picked up the cup with both hands, and took a slow sip.',
      'You closed your eyes and simply felt the warmth of the morning sun on your face and arms.',
      'You watched the steam rise into the air, letting your mind settle on the present minute.'
    ],
    consequences: [
      'The urgent pull of the day’s tasks faded into the background, leaving you calm and clear-headed.',
      'A simple feeling of gratitude for being right here, right now, filled your chest.',
      'Your breathing became slow and natural, and the morning felt open rather than crowded.'
    ],
    suspenseHooks: {
      unanswered_discovery: 'Beneath the tea tray, you found a small river stone painted with a single green leaf. It felt surprisingly smooth in your palm.',
      new_possibility: 'A wooden gate at the side of the courtyard stood half-open, showing a path through the bamboo grove.',
      approaching_choice: 'At the end of the porch, two paths led out: one toward the main gate, the other into the quiet shade of the garden.',
      transformation_beginning: 'The brass wind chime under the eaves rang with a single clear note that seemed to carry the peacefulness of the morning.',
      partial_revelation: 'Written on the side of the tea cup was a short line in simple script: "One step at a time is enough."',
      environmental_change: 'The morning mist lifted from the trees, leaving the sky bright and clear for the day ahead.'
    }
  },

  coastal_haven: {
    id: 'coastal_haven',
    name: 'The Lighthouse Shore',
    theme: 'tides_and_steady_ground',
    locations: ['The Pebble Beach', 'The Granite Seawall', 'The Lookout Bench', 'The Cedar Boathouse'],
    openings: [
      { id: 'ch_1', text: 'You walked along the pebble beach where the retreating tide left wet stones and pieces of green sea glass.' },
      { id: 'ch_2', text: 'The low, steady sound of the waves breaking against the seawall filled the cool morning air.' },
      { id: 'ch_3', text: 'A solitary seabird glided over the bay as the sun came up over the headland.' },
      { id: 'ch_4', text: 'You paused beside an old wooden rowboat pulled up on the beach, smelling the salt and cedar wood.' }
    ],
    companion: {
      name: 'Cormac',
      role: 'a boatman who knew that every rough tide eventually settles down',
      dialogue: [
        '"You don’t have to fight the tide. You just have to let it carry you in."',
        '"Stand here for a minute. The ground under your feet isn’t moving."',
        '"Every storm runs out of rain sooner or later."'
      ]
    },
    sceneDescriptions: {
      tense: 'The cold ocean spray and rolling grey waves felt restless and unpredictable.',
      neutral: 'The solid granite seawall stood firm and unchanging under your hand.',
      relaxed: 'Sunlight sparkled across thousands of small ripples on the water, turning the bay bright silver.'
    },
    actions: [
      'You picked up a smooth piece of sea glass, rolled it between your fingers, and put it in your pocket.',
      'You leaned your back against the solid seawall and took a deep breath of the bracing salt air.',
      'You stopped walking, stood still by the water’s edge, and watched the waves roll in and out.'
    ],
    consequences: [
      'The steady rhythm of the water helped quiet the restless thoughts in your head.',
      'You felt firmly grounded on the beach, knowing that whatever came next, you had a safe place to stand.',
      'The heavy feeling from earlier in the day washed away with the sound of the retreating tide.'
    ],
    suspenseHooks: {
      unanswered_discovery: 'Tucked into a crack in the seawall, you noticed a small corked bottle holding a rolled slip of paper.',
      new_possibility: 'At the end of the beach, the low tide had uncovered a gravel path leading around the cliff to an unseen cove.',
      approaching_choice: 'At the boat dock, two boats were tied up: one rigged for the open sea, the other built for quiet rowing in the sheltered bay.',
      transformation_beginning: 'The lighthouse beacon high on the hill clicked on, sending a warm sweep of amber light across the water.',
      partial_revelation: 'Carved into the timber of the boat was a simple reminder: "The sea always makes room for the boat that moves with it."',
      environmental_change: 'The wind died down completely, leaving the harbour water glassy and calm under the evening sky.'
    }
  },

  weaving_hall: {
    id: 'weaving_hall',
    name: 'The Star Weaving Hall',
    theme: 'looms_and_chosen_threads',
    locations: ['The Timber Loom Room', 'The Linen Terrace', 'The Thread Vault', 'The Work Bench'],
    openings: [
      { id: 'wh_1', text: 'You stepped into the high wooden hall where large birch looms stood in rows under the tall windows.' },
      { id: 'wh_2', text: 'Spools of blue, gold, and white linen thread lined the open shelves along the wall.' },
      { id: 'wh_3', text: 'Morning sunlight streamed through the tall glass panes, lighting up the woven cloth hanging from the frames.' },
      { id: 'wh_4', text: 'The rhythmic clack of the wooden loom shuttle filled the room with a steady, working pulse.' }
    ],
    companion: {
      name: 'Thalor',
      role: 'a weaver who taught that choosing what NOT to weave is just as important as the thread you keep',
      dialogue: [
        '"You don’t have to use every thread you’re handed. Pick the ones that actually belong to you."',
        '"Knots don’t come loose when you pull hard. You have to give them slack."',
        '"Leave some empty space in the pattern. It gives the rest of the cloth room to breathe."'
      ]
    },
    sceneDescriptions: {
      tense: 'Tangled skeins of thread lay across the workbench, pulling in too many directions at once.',
      neutral: 'The wooden shuttle felt smooth and balanced in your hand, worn from years of careful use.',
      relaxed: 'The double doors were open to the terrace, where clean linen hung drying in the warm breeze.'
    },
    actions: [
      'You picked up a pair of scissors, gently cut away three tangled threads, and set them aside.',
      'You chose just two colors of thread—a deep blue and a warm gold—and left the rest on the shelf.',
      'You slid the wooden shuttle smoothly across the frame, watching the tight weave lock into place.'
    ],
    consequences: [
      'Saying no to the extra threads immediately made the work simpler and more enjoyable.',
      'A clear sense of relief settled in: you didn’t have to do everything for everyone today.',
      'The design on the loom took on a clean, balanced look that was easy to follow.'
    ],
    suspenseHooks: {
      unanswered_discovery: 'On the shelf behind your loom, someone had left a small spool of silver thread that glowed faintly in the dim light.',
      new_possibility: 'The terrace doors opened out onto a wide stone balcony with a view across the whole valley.',
      approaching_choice: 'Two baskets of wool sat by your feet: one full of tangled old projects, the other empty and ready for something fresh.',
      transformation_beginning: 'The cloth on your loom reached its final border, finishing the section with clean, straight edges.',
      partial_revelation: 'Woven into the edge of the tapestry was a short phrase: "You choose what enters your life."',
      environmental_change: 'The golden late-afternoon sun hit the finished cloth, making the colors look rich and vibrant.'
    }
  }
};

export const storyComposerService = {
  extractNarrativeMemory(recentChapters: StoryChapter[]): NarrativeMemory {
    const memory: NarrativeMemory = {
      recentOpenings: [],
      recentArchetypes: [],
      recentSymbols: [],
      recentSuspenseTypes: [],
      recentEndingStyles: [],
      recentPacings: [],
      recentEnvCategories: [],
      recentTitles: []
    };

    recentChapters.forEach((ch) => {
      const meta = ch.metadata || {};
      if (meta.openingKey) memory.recentOpenings.push(meta.openingKey);
      if (meta.archetype) memory.recentArchetypes.push(meta.archetype);
      if (Array.isArray(meta.symbolsUsed)) memory.recentSymbols.push(...meta.symbolsUsed);
      if (meta.suspenseType) memory.recentSuspenseTypes.push(meta.suspenseType);
      if (meta.endingStyle) memory.recentEndingStyles.push(meta.endingStyle);
      if (meta.pacing) memory.recentPacings.push(meta.pacing);
      if (ch.title) memory.recentTitles.push(ch.title);
    });

    return memory;
  },

  /**
   * Deterministically composes a simple, natural, deeply personal chapter (450–850 words)
   * grounded in the user's actual life reflections, emotions, and daily arc.
   */
  async composeNextChapter(
    context: StoryContext,
    currentState: StoryState,
    recentChapters: StoryChapter[],
    options: { variant?: number } = {}
  ): Promise<ComposedStoryChapter> {
    const targetChapterNumber = currentState.current_chapter_number + 1;
    const variant = options.variant || 0;

    // 1. Memory lookback
    const memory = this.extractNarrativeMemory(recentChapters);

    // 2. Personalization & Daily Arc Extraction
    const personalization = storyPersonalizationService.derivePersonalization(context, currentState);
    const truths = personalization.personalTruths;
    const dailyArc = truths.dailyArc;

    // 3. World Synthesis
    let worldKey = personalization.adaptiveWorldElements.worldAffinity || 'cartographic_archive';
    if (!STORY_WORLDS[worldKey]) worldKey = 'cartographic_archive';

    const cycleProgress = storyCycleService.calculateCycleProgress(targetChapterNumber);
    if (currentState.current_chapter_number > 0 && currentState.current_cycle_id && STORY_WORLDS[currentState.current_cycle_id]) {
      worldKey = currentState.current_cycle_id;
    }

    const world = STORY_WORLDS[worldKey] || STORY_WORLDS.cartographic_archive;

    // 4. Deterministic Seed PRNG
    const seedString = `${context.userId}_ch${targetChapterNumber}_${worldKey}_v${variant}_${context.dataConfidence.totalDataPoints}_${truths.sensory_anchors.length}`;
    const rng = createDeterministicRng(hashString(seedString));

    // 5. Active Motif
    const activeMotif = personalization.narrativeMotifs[0] || {
      id: 'motif_tea',
      motif: 'a warm clay cup of tea',
      meaning: 'savoring a simple moment of peace',
      stage: 'introduced',
      strength: 1
    };

    // 6. Location & Companion
    const location = world.locations[(targetChapterNumber - 1) % world.locations.length] || world.locations[0];
    const companion = world.companion;

    // 7. Beat 1: Scene & Opening Situation (~80 words)
    const openingObj = selectNonRepeating(world.openings, memory.recentOpenings, rng, (o) => o.id);
    const sensoryAnchor = truths.sensory_anchors[0] || 'the cool evening air after rain';
    const p1 = `${openingObj.text} You stepped into ${location} and stopped for a moment, taking in ${sensoryAnchor}. The place had a simple, steady quiet about it that made you naturally slow your pace. After the kind of day you’d had, having a few minutes to yourself was exactly what you needed.`;

    // 8. Beat 2: The Real Emotional Tension (~90 words)
    const tenseScene = context.emotionalDirection.status === 'difficult' ? world.sceneDescriptions.tense : world.sceneDescriptions.neutral;
    const p2 = `${dailyArc.startingTension} In your hands, you were still holding ${activeMotif.motif}. ${tenseScene} It was easy to notice how much energy you had spent trying to manage everything, keep everyone happy, and push through without stopping to rest.`;

    // 8b. Beat 2b: Exploration & Physical Grounding (~100 words)
    const p2b = `You walked slowly through the space, looking at the familiar details of ${location}. There were no urgent notifications here, no clocks pushing you to hurry, and no one waiting for you to solve a problem. You placed your pack down on the solid wood bench and ran your hand along the smooth grain of the table. Simply being in a room where nothing was required of you felt like an unexpected gift.`;

    // 9. Beat 3: The Interaction / Action (~100 words)
    const action = selectNonRepeating(world.actions, [], rng);
    const companionDialogue = selectNonRepeating(companion.dialogue, [], rng);
    const p3 = `${companion.name}, ${companion.role}, walked over with a calm, friendly nod. They didn't ask you to explain why you looked tired or tell you to hurry up. Instead, they looked at what you were carrying and said: ${companionDialogue} Hearing those words in plain, simple English made something tight inside you release. ${action}`;

    // 10. Beat 4: The Relief & Internal Shift (~110 words)
    const consequence = selectNonRepeating(world.consequences, [], rng);
    const relaxedScene = world.sceneDescriptions.relaxed;
    let motifEvolution = '';
    if (activeMotif.stage === 'transforming' || activeMotif.stage === 'resolved') {
      motifEvolution = `The ${activeMotif.motif} felt lighter in your hands now, a clear reminder that you don't have to carry yesterday’s worries into tomorrow.`;
    } else {
      motifEvolution = `Looking down at ${activeMotif.motif}, you felt a genuine sense of relief.`;
    }
    const p4 = `${consequence} ${relaxedScene} ${motifEvolution} ${dailyArc.turningPoint} You realized with quiet certainty that taking care of yourself isn’t something you have to earn—it’s just something you have to choose.`;

    // 10b. Beat 4b: Grounded Realization & Growth (~90 words)
    const growthTruth = truths.growth_truths[0] || 'You are learning to give yourself the same patience you give to others.';
    const p4b = `Sitting in the quiet, you thought about how easy it is to forget your own limits when the days get busy. But today proved that stepping back doesn't mean falling behind. ${growthTruth} With every slow breath, you felt more settled in your own skin, knowing that showing up for yourself is always the right choice.`;

    // 11. Beat 5: Thread Progression (~80 words)
    const activeThreads: StoryThread[] = (currentState.open_threads || []).map((t) => ({ ...t }));
    let threadText = '';
    let newOrUpdatedThreads: StoryThread[] = [];

    if (activeThreads.length > 0 && targetChapterNumber > 1) {
      const primaryThread = activeThreads[0];
      if (primaryThread.status === 'introduced') {
        primaryThread.status = 'developing';
        threadText = `The question about ${primaryThread.text.toLowerCase().replace(/\.$/, '')} was still in the back of your mind, but it didn’t feel urgent anymore.`;
      } else if (primaryThread.status === 'developing') {
        primaryThread.status = 'escalating';
        threadText = `You noticed how the path you took today connected with ${primaryThread.text.toLowerCase().replace(/\.$/, '')}, bringing things a little closer into focus.`;
      } else {
        primaryThread.status = 'resolved';
        threadText = `With a calm breath, the matter of ${primaryThread.text.toLowerCase().replace(/\.$/, '')} finally felt settled and complete.`;
      }
      newOrUpdatedThreads = activeThreads;
    } else {
      const newThreadText = `An unmapped doorway marked with a small silver crescent in ${location}`;
      newOrUpdatedThreads = [
        {
          id: `thread_${context.userId}_ch${targetChapterNumber}`,
          text: newThreadText,
          status: 'introduced',
          introduced_in_chapter: targetChapterNumber,
          importance: 'high'
        }
      ];
      threadText = `Before leaving the room, you noticed ${newThreadText.toLowerCase()}, waiting quietly for another day.`;
    }
    const p5 = `${threadText} It felt good knowing you didn't have to figure everything out right this second. Tomorrow would have its own time.`;

    // 12. Beat 6: Specific Organic Suspense Hook (~90 words)
    const SUSPENSE_CATEGORIES: SuspenseMechanism[] = [
      'unanswered_discovery',
      'partial_revelation',
      'new_possibility',
      'approaching_choice',
      'environmental_change',
      'transformation_beginning'
    ];
    const chosenSuspenseType = selectNonRepeating(SUSPENSE_CATEGORIES, memory.recentSuspenseTypes, rng);
    const hookText = world.suspenseHooks[chosenSuspenseType] || world.suspenseHooks.new_possibility;
    const p6 = `${hookText} You took one final breath of the evening air, feeling rested and ready for bed. Whatever tomorrow brings, you know you can meet it one step at a time.`;

    // 13. Assemble Full Content (~550–800 words)
    const fullContent = `${p1}\n\n${p2}\n\n${p2b}\n\n${p3}\n\n${p4}\n\n${p4b}\n\n${p5}\n\n${p6}`;
    const wordCount = fullContent.trim().split(/\s+/).filter(Boolean).length;

    // 14. Dynamic Poetic Titles
    const shortMotif = activeMotif.motif.replace(/^(a|an|the)\s+/i, '').split(' ').slice(0, 2).join(' ');
    const cleanWorldName = world.name.replace(/^The\s+/i, '');
    const TITLE_PATTERNS = [
      `The Choice in ${location}`,
      `A Quiet Hour in ${cleanWorldName}`,
      `The Guidance of ${companion.name}`,
      `The Road to ${location}`,
      `Setting Down the ${shortMotif}`,
      `When Evening Settles on ${location}`,
      `The Presence of ${companion.name}`,
      `Taking a Breath in ${location}`,
      `Beyond the Door at ${cleanWorldName}`,
      `The Lesson of the ${shortMotif}`,
      `A Moment of Peace in ${location}`,
      `The Path Past ${location}`
    ];
    const chosenTitleBase = selectNonRepeating(TITLE_PATTERNS, memory.recentTitles, rng);
    const title = `Chapter ${targetChapterNumber}: ${chosenTitleBase}`;

    const narrativeSummary = `You spent time in ${location}, talked with ${companion.name}, and took a conscious step to set down the day's stress and rest.`;
    const nextCyclePreview = storyCycleService.deriveNextCyclePreview(worldKey, cycleProgress.chapter_in_cycle);

    // 15. Narrative Facts
    const updatedFacts = storyContinuityService.mergeNarrativeFacts(
      currentState.narrative_facts || { characters: [], locations: [], symbols: [] },
      {
        characters: [{ name: companion.name, role: companion.role, status: 'active' }],
        locations: [{ name: location, significance: 'a place to rest and regroup' }],
        symbols: [{ symbol: activeMotif.motif, meaning: activeMotif.meaning }]
      }
    );

    const targetPacing = storyPacingAndSuspense.determineTargetPacing(
      targetChapterNumber,
      currentState.recent_pacing || [],
      context.emotionalDirection.status
    );

    const targetEndingStyle = storyPacingAndSuspense.determineTargetEndingStyle(
      currentState.recent_ending_styles || []
    );

    return {
      title,
      content: fullContent,
      narrativeSummary,
      metadata: {
        worldId: world.id,
        worldName: world.name,
        archetype: 'Discovery',
        symbolsUsed: [activeMotif.motif],
        suspenseType: chosenSuspenseType,
        atmosphericTone: personalization.emotionalLandscape.currentTone,
        themesUsed: context.storyRelevantSignals.dominantThemes,
        pacing: targetPacing,
        endingStyle: targetEndingStyle,
        openingKey: openingObj.id,
        cycleStage: cycleProgress.stage,
        wordCount
      },
      openThreads: newOrUpdatedThreads,
      narrativeFacts: updatedFacts,
      cycleId: world.id,
      cycleName: world.name,
      worldTheme: world.theme,
      cycleProgress,
      nextCyclePreview,
      sourceInputs: context.sourceInputs
    };
  }
};
