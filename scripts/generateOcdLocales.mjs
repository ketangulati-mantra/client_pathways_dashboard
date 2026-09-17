import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesDir = path.join(__dirname, '..', 'src', 'locales');

// 1. ocd_what_is_ocd
const ocdWhatIsOcd = {
  header_back: "Back",
  brand: "OCDMANTRA",
  hero: {
    label: "OCDMANTRA",
    title: "What is OCD?",
    subtitle: "Understand what OCD is, how it can show up, and why it can feel so convincing."
  },
  video: {
    eyebrow: "START HERE",
    title: "Watch this short introduction to OCD."
  },
  basics: {
    eyebrow: "THE BASICS",
    headline: "OCD is more than unwanted thoughts.",
    obsession_title: "OBSESSIONS",
    obsession_desc: "Unwanted thoughts, images, doubts, or urges that can feel difficult to dismiss.",
    compulsion_title: "COMPULSIONS",
    compulsion_desc: "Actions or mental responses you feel driven to repeat to reduce discomfort or feel certain."
  },
  themes: {
    eyebrow: "COMMON THEMES",
    headline: "OCD can take many forms.",
    subtext: "These are common themes, not separate diagnoses. One person can experience more than one.",
    disclaimer: "These are only some examples.",
    items: {
      contamination: {
        name: "Contamination",
        desc: "Fears about germs, illness, dirt, or contamination."
      },
      harm: {
        name: "Harm",
        desc: "Unwanted fears about causing or being responsible for harm."
      },
      checking: {
        name: "Checking",
        desc: "Repeatedly checking safety, mistakes, doors, appliances, or other concerns."
      },
      symmetry: {
        name: "Symmetry & \"Just Right\"",
        desc: "Feeling that things need to be balanced, exact, or just right."
      },
      taboo: {
        name: "Intrusive / Taboo Thoughts",
        desc: "Unwanted thoughts involving sexual, religious, aggressive, or other taboo themes."
      },
      responsibility: {
        name: "Responsibility & Doubt",
        desc: "Persistent doubt about mistakes, responsibility, or whether something is truly certain."
      }
    }
  },
  relatable: {
    eyebrow: "YOU MIGHT RECOGNIZE THIS",
    headline: "OCD can make uncertainty feel impossible to leave alone.",
    example_1: {
      thought: "“Did I lock the door?”",
      action: "You check. You feel relieved.",
      loop: "Then: “But did I really check?”"
    },
    example_2: {
      thought: "“What if I made a terrible mistake?”",
      action: "You replay what happened.",
      loop: "You look for reassurance."
    }
  },
  takeaway: {
    quote: "Everyone gets unwanted thoughts.\n\nOCD can make those thoughts feel like something you have to solve.",
    sub: "Understanding that pattern is an important first step."
  },
  next_step: {
    eyebrow: "NEXT IN YOUR JOURNEY",
    headline: "Now let's look at how the OCD cycle can keep repeating.",
    btn_explore: "Explore the OCD Cycle →"
  },
  completion: {
    eyebrow: "Finished exploring?",
    btn_complete: "Mark Activity as Done →",
    saving: "Saving...",
    completed_badge: "Activity Completed",
    error_save: "We couldn't save your activity completion right now. Your progress is saved locally."
  }
};

// 2. ocd_delay_tactic (The 60-Second Pause)
const ocdDelayTactic = {
  header_back: "Back",
  brand: "OCDMANTRA",
  step1: {
    title: "The 60-Second Pause",
    subtitle: "Sometimes an urge can feel like something you need to act on right away. Let’s practice creating a little space before you respond.",
    btn_begin: "Begin"
  },
  step2: {
    eyebrow: "SCENARIO 1",
    title: "Let's Try a Scenario",
    subtitle: "Imagine you’ve just left your house.",
    visual_line1: "You lock the front door and walk toward your car.",
    visual_thought: "“Did I lock it properly?”",
    visual_line2: "You notice the pull to turn around and check.",
    btn_continue: "Continue"
  },
  step3: {
    eyebrow: "THE URGE",
    banner: "“Check it one more time.”",
    subtitle: "You notice an urge to turn around and check.",
    question: "What would you normally feel pulled to do?",
    responses: {
      check: "Check again",
      ask: "Ask someone for reassurance",
      goback: "Go back and make sure",
      wait: "Pause and wait"
    },
    btn_next: "Next"
  },
  step4: {
    title: "You Don’t Have to Answer It Yet.",
    subtitle: "For the next 60 seconds, we’re going to practice making a little space between the urge and your response.",
    cadence_pause: "PAUSE",
    cadence_notice: "NOTICE",
    cadence_choose: "CHOOSE",
    detail: "The goal isn’t to make the thought disappear. It’s to notice the urge without immediately answering it.",
    btn_start: "Start 60-Second Pause"
  },
  step5: {
    badge: "THE URGE IS HERE",
    prompts: [
      "Notice the urge as it appears.",
      "You can feel the pull without answering it.",
      "Take a gentle breath and observe.",
      "The urge is just a sensation right now.",
      "You don’t have to solve uncertainty right away.",
      "Notice where you feel tension in your body.",
      "Thoughts come and go like ripples on water.",
      "Creating space between thought and action.",
      "You are observing the urge, not obeying it.",
      "Uncertainty can be uncomfortable, and that's okay.",
      "Let the thought be there without engaging.",
      "Notice the impulse to fix or check.",
      "Stay curious about the sensation.",
      "You are in control of your response.",
      "Nothing needs to be settled this very second.",
      "You’ve created space for over 45 seconds.",
      "Just notice the urge without rushing to act.",
      "Almost there — resting in the pause.",
      "Stay present with this final breath.",
      "You completed the pause."
    ]
  },
  step6: {
    title: "You Made Space.",
    subtitle: "The goal wasn't to make the urge disappear. It was to give yourself a moment before responding.",
    question: "What did you notice?",
    reflections: {
      thought_there: "The thought was still there",
      felt_urge: "I felt an urge to respond",
      uncomfortable: "The uncertainty felt uncomfortable",
      could_wait: "I could wait without answering it right away"
    },
    btn_continue: "Continue"
  },
  step7: {
    eyebrow: "OCD CYCLE",
    title: "Where the Pause Fits",
    subtitle: "OCD creates a strong pull to respond immediately to doubt.",
    node_doubt: "Doubt / Intrusive Thought",
    node_urge: "Urge to Respond",
    space_tag: "THE 60-SECOND PAUSE",
    space_title: "This is the space you just practiced.",
    node_compulsion: "Compulsive Response",
    node_relief: "Temporary Relief → Doubt Returns",
    detail: "A pause gives you a moment before automatically following that pull.",
    btn_try_another: "Try Another Scenario"
  },
  step8: {
    eyebrow: "SCENARIO 2",
    title: "Practice Transfer",
    subtitle: "Imagine you’ve just sent an important message.",
    visual_line1: "You press send and close the conversation.",
    visual_thought: "“Did I say something wrong? Maybe I should read it again.”",
    visual_line2: "The same pattern: Thought → Urge → Pause → Choice.",
    btn_practice: "Practice Pause (60s)"
  },
  step9: {
    title: "An Urge is Not an Instruction.",
    subtitle: "You don’t have to answer every urge immediately. A little space can create a different starting point.",
    cadence_pause: "PAUSE",
    cadence_notice: "NOTICE",
    cadence_choose: "CHOOSE",
    btn_continue: "Continue"
  }
};

// 3. ocd_478_breathing (4-7-8 Breathing)
const ocd478Breathing = {
  header_back: "Back",
  brand: "OCDMANTRA",
  hero: {
    title_num: "4–7–8",
    title_text: "BREATHING",
    subtitle: "A simple rhythm to guide your breathing.",
    rhythm_badge: "Inhale for 4 · hold for 7 · exhale for 8",
    label_how_long: "HOW LONG?",
    btn_begin: "Begin"
  },
  time_options: {
    opt_30s: "30 sec",
    opt_30s_hint: "2 cycles · ≈ 38 sec",
    opt_1m: "1 min",
    opt_1m_hint: "3 cycles · ≈ 1 min",
    opt_2m: "2 min",
    opt_2m_hint: "6 cycles · ≈ 2 min",
    opt_3m: "3 min",
    opt_3m_hint: "10 cycles · ≈ 3 min",
    opt_5m: "5 min",
    opt_5m_hint: "16 cycles · ≈ 5 min"
  },
  settling: {
    title: "Get settled",
    subcopy: "Take a moment."
  },
  phases: {
    inhale_title: "Inhale",
    inhale_sub: "Slowly breathe in",
    hold_title: "Hold",
    hold_sub: "Stay here",
    exhale_title: "Exhale",
    exhale_sub: "Slowly breathe out"
  },
  reflection: {
    title: "Well done.",
    subtitle: "Take a moment before you move on. Notice how you feel right now.",
    question: "What do you notice?",
    choices: {
      settled: "More settled",
      present: "More present",
      same: "Just the same"
    },
    btn_continue: "Continue"
  },
  takeaway: {
    title: "4–7–8",
    step_inhale: "INHALE 4",
    step_hold: "HOLD 7",
    step_exhale: "EXHALE 8",
    subtitle: "Return to this practice whenever you want a quiet moment to reset your attention.",
    btn_continue: "Continue"
  }
};

// 4. ocd_how_erp_works (How ERP Works)
const ocdHowErpWorks = {
  header_back: "Back",
  brand: "OCDMANTRA",
  screen1: {
    badge: "PSYCHOEDUCATION",
    title: "HOW ERP WORKS",
    subtitle: "ERP helps people with OCD practice facing what triggers them while changing what they do next.",
    quote: "“You don't practice being fearless. You practice responding differently.”",
    btn_explore: "Explore"
  },
  screen2: {
    badge: "SCENARIO 1",
    title: "You've Just Left the House.",
    thought: "“Did I lock the door?”",
    urge_tag: "You feel the urge to go back",
    subtitle: "A common moment of doubt arrives. Let's see what happens when the urge is followed.",
    btn_see_happens: "See What Happens"
  },
  screen3: {
    badge: "PATH A",
    title: "Follow the Urge",
    btn_check: "Check the Lock",
    checking_status: "Checking the handle... turning the key...",
    relief_thought: "“Okay, it's locked. Relief.”",
    doubt_thought: "“Wait... did I really lock it properly?”",
    subtitle: "The relief settled the feeling for a second, but doubt returned right after.",
    btn_continue: "Continue"
  },
  screen4: {
    badge: "REFLECTION",
    title: "What Did the Check Give You?",
    point1: "Relief right in the moment.",
    point2: "More reason to check again when doubt returns.",
    subtitle: "Checking can reduce distress in the moment, but that short-term relief reinforces the brain's urge to check again.",
    btn_rewind: "Rewind the Moment"
  },
  screen5: {
    badge: "REWIND",
    title: "Let's Try the Same Moment Differently.",
    thought: "“Did I lock the door?”",
    urge_tag: "The urge appears: “Go back and check”",
    subtitle: "This time, instead of automatically following the urge, we explore the ERP approach.",
    btn_step1: "Step 1: Exposure"
  },
  screen6: {
    badge: "STEP 1",
    title: "1. Exposure",
    subtitle1: "ERP starts by approaching a trigger rather than avoiding it or making it go away.",
    thought: "“The doubt is here: Did I lock the door?”",
    subtitle2: "In ERP, exposure means allowing the trigger or uncertainty to be present without immediately trying to push it out of mind.",
    btn_step2: "Step 2: Response Prevention"
  },
  screen7: {
    badge: "STEP 2",
    title: "2. Response Prevention",
    subtitle1: "Then comes the second part: resisting or delaying the compulsive response.",
    thought: "Urge: “Go back and check right now.”",
    btn_dont_check: "Don't Check Right Now",
    subtitle2: "Simulated practice: Choosing not to perform the ritual gives the brain a chance to learn something new."
  },
  screen8: {
    badge: "COMPARISON",
    title: "The Two Pathways",
    col_urge_title: "Follow the Urge",
    col_urge_step1: "Trigger",
    col_urge_step2: "Check",
    col_urge_step3: "Relief",
    col_urge_step4: "Doubt returns",
    col_erp_title: "ERP Pathway",
    col_erp_step1: "Trigger",
    col_erp_step2: "Urge",
    col_erp_step3: "Response Prevention",
    col_erp_step4: "New learning",
    btn_learning: "What Are You Learning?"
  },
  screen9: {
    badge: "CORE INSIGHT",
    title: "The Point Isn't to Feel Nothing.",
    subtitle: "ERP is not about making distress disappear instantly. It teaches:",
    insight1: "“I can experience uncertainty and tolerate it.”",
    insight2: "“I can have an urge without automatically acting on it.”",
    insight3: "“I don't need a ritual to respond to every doubt.”",
    btn_scenario2: "Try a Second Scenario"
  },
  screen10: {
    badge: "SCENARIO 2",
    title: "You Sent an Important Message.",
    thought: "Thought: “Did I say something wrong?”",
    urge_tag: "Urge: Read it again",
    question: "What would response prevention look like?",
    opt_read: "Read the message again to be sure",
    opt_ask: "Ask someone if it sounds okay",
    opt_leave: "Leave it as it is for now without re-reading",
    feedback_correct: "✓ That's an example of resisting the checking or reassurance response.",
    feedback_incorrect: "That would be a way of responding to the uncertainty. In ERP, response prevention means practicing not using the checking or reassurance behavior.",
    btn_final_model: "Final Model",
    btn_try_again: "Try Again"
  },
  screen11: {
    badge: "SUMMARY",
    title: "ERP Changes What You Do Next.",
    node_trigger: "Trigger",
    node_trigger_sub: "Doubt arrives",
    node_urge: "Urge",
    node_urge_sub: "Desire to ritualize",
    node_erp: "Exposure + Response Prevention",
    node_erp_sub: "Resist compulsion",
    node_learning: "New Learning",
    node_learning_sub: "Uncertainty can be tolerated",
    subtitle: "The goal isn't to eliminate every intrusive thought or feeling. It's to build a different response to them.",
    btn_complete: "Complete Activity"
  }
};

// 5. ocd_mood_check_in (OCD Mood Check-In)
const ocdMoodCheckIn = {
  header_back: "Back",
  header_history: "History",
  brand: "OCDMANTRA",
  screen1: {
    badge: "OCD MOOD CHECK-IN",
    title: "How are you feeling right now?",
    subtitle: "Take a quick snapshot. There’s no right answer.",
    levels: {
      l1_title: "1 — Very low",
      l1_sub: "Feeling heavy, overwhelmed, or depleted",
      l2_title: "2 — Low",
      l2_sub: "Unsettled, strained, or low energy",
      l3_title: "3 — Steady / Neutral",
      l3_sub: "Balanced, okay, or taking things as they come",
      l4_title: "4 — Good",
      l4_sub: "Clear, engaged, or mostly at ease",
      l5_title: "5 — Very good",
      l5_sub: "Grounded, energized, or peaceful"
    },
    btn_continue: "Continue"
  },
  screen2: {
    badge: "STEP 2 OF 4",
    title: "How much has OCD been on your mind today?",
    subtitle: "Think about the amount of attention, distress, or disruption OCD has taken up today.",
    impact_l1: "Not much — Quiet",
    impact_l2: "Mild — Manageable",
    impact_l3: "Moderate — Noticeable",
    impact_l4: "Significant — Disruptive",
    impact_l5: "A lot — High presence",
    scale_min: "1 = Not much",
    scale_max: "5 = A lot",
    btn_back: "Back",
    btn_continue: "Continue"
  },
  screen3: {
    badge: "STEP 3 OF 4",
    title: "What stood out today?",
    subtitle: "Choose anything that was part of your experience.",
    experiences: {
      INTRUSIVE_THOUGHTS: "Intrusive thoughts / doubts",
      CHECKING: "Urge to check or repeat",
      MENTAL_REVIEW: "Mental replaying / analyzing",
      REASSURANCE: "Seeking certainty / reassurance",
      AVOIDANCE: "Avoiding triggers or situations",
      HIGH_ANXIETY: "High distress or anxiety",
      PAUSED_URGE: "Paused or delayed a ritual",
      FOCUSED_WELL: "Engaged with daily tasks",
      NONE: "None of these today"
    },
    btn_back: "Back",
    btn_continue: "Continue"
  },
  screen4: {
    badge: "STEP 4 OF 4",
    title: "Anything you want to remember?",
    subtitle: "Optional. A few words are enough.",
    placeholder: "Write a note...",
    btn_back: "Back",
    btn_save: "Save check-in",
    saving: "Saving..."
  },
  screen5: {
    badge: "✓ SAVED",
    title: "Today's Moment.",
    subtitle: "Your check-in has been recorded to your private timeline.",
    impact_label: "OCD impact {{impact}} / 5",
    btn_view_moments: "View your moments",
    btn_done: "Done"
  },
  history: {
    tab_moments: "Moments",
    tab_trends: "Trends",
    today_title: "Today's Check-in",
    no_log_today: "No check-in recorded for today yet.",
    btn_check_in_now: "Record today's check-in",
    btn_view_past: "View past check-ins ({{count}})",
    btn_hide_past: "Hide past check-ins",
    past_title: "Past Check-ins",
    no_logs_title: "No Check-ins Yet",
    no_logs_desc: "Your private logs and emotional timeline will appear here.",
    today_tag: "TODAY",
    yesterday_tag: "YESTERDAY",
    modal_title: "Check-In Detail",
    modal_mood_label: "Mood Level",
    modal_impact_label: "OCD Impact",
    modal_experiences_label: "Experiences",
    modal_note_label: "Personal Note",
    btn_edit: "Edit Note",
    btn_delete: "Delete Entry",
    btn_close: "Close",
    trends_14d: "14 Days",
    trends_30d: "30 Days",
    trends_90d: "90 Days",
    trends_avg_mood: "Average Mood",
    trends_avg_impact: "Average OCD Impact",
    trends_total_entries: "Total Entries"
  }
};

const map = {
  ocd_what_is_ocd: ocdWhatIsOcd,
  ocd_delay_tactic: ocdDelayTactic,
  ocd_478_breathing: ocd478Breathing,
  ocd_how_erp_works: ocdHowErpWorks,
  ocd_mood_check_in: ocdMoodCheckIn
};

Object.entries(map).forEach(([ns, data]) => {
  const dir = path.join(localesDir, ns);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'en.json'), JSON.stringify(data, null, 2), 'utf8');
  console.log('Wrote en.json for', ns);
});
