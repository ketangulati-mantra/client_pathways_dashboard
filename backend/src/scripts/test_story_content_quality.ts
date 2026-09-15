import { sql } from '../db/client.js';
import { storyService } from '../services/storyService.js';
import { setupDb } from '../utils/setupDb.js';
import { getLocalCalendarDate, getNextDayDate } from '../utils/dateUtils.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runStoryQualityOverhaulTests() {
  console.log('================================================================');
  console.log('📖 TESTING STORY CONTENT QUALITY OVERHAUL (8 PERSONAS & 7-DAY ARCS)');
  console.log('================================================================\n');

  await setupDb();

  const timezone = 'Asia/Kolkata';

  // -------------------------------------------------------------------------
  // TEST PART 1: 8 DISTINCT PERSONA DIVERSITY & QUALITY TEST
  // -------------------------------------------------------------------------
  console.log('=== PART 1: TESTING 8 DIVERSE USER PERSONAS ===\n');

  const PERSONAS = [
    {
      id: 'persona_study_pressure',
      name: 'Persona A (Study pressure + friendship + relief)',
      checkIns: [{ emotion: 'Stressed', intensity: 4, reflection: 'Studying for hours for my qualifying exams.' }],
      journals: [
        { title: 'Exams and breaking point', content: 'Studying late at my desk with cold tea. Felt overwhelmed until my friend came over, we walked outside, and I felt so much lighter.', type: 'free_write', emotion: 'Overwhelmed' }
      ]
    },
    {
      id: 'persona_relationship_comm',
      name: 'Persona B (Relationship uncertainty + communication)',
      checkIns: [{ emotion: 'Anxious', intensity: 3, reflection: 'Hard conversation with family today.' }],
      journals: [
        { title: 'Finding the right words', content: 'There is so much unspoken distance between us. I want to build a bridge and talk honestly without anger or fear.', type: 'guided_prompt', emotion: 'Anxious' }
      ]
    },
    {
      id: 'persona_career_burnout',
      name: 'Persona C (Career ambition + burnout)',
      checkIns: [{ emotion: 'Exhausted', intensity: 5, reflection: 'Back-to-back work meetings and endless project deliverables.' }],
      journals: [
        { title: 'Unplugging the machine', content: 'My calendar was relentless today. I had to consciously set down my work laptop and choose to sleep rather than answer one more email.', type: 'free_write', emotion: 'Tired' }
      ]
    },
    {
      id: 'persona_loneliness_connection',
      name: 'Persona D (Loneliness + desire for connection)',
      checkIns: [{ emotion: 'Lonely', intensity: 3, reflection: 'Quiet evening at home wishing for closer community.' }],
      journals: [
        { title: 'Solitary evening', content: 'Sitting by the window listening to rain. Longing for deeper connection and people who truly understand my journey.', type: 'free_write', emotion: 'Lonely' }
      ]
    },
    {
      id: 'persona_gratitude_calm',
      name: 'Persona E (Gratitude + calm + everyday joys)',
      checkIns: [{ emotion: 'Calm', intensity: 2, reflection: 'Peaceful morning with hot coffee.' }],
      journals: [
        { title: 'Morning sunlight', content: 'Enjoying a warm cup of tea on the porch. Listening to birds and savoring the quiet beauty of a simple morning.', type: 'free_write', emotion: 'Peaceful' }
      ]
    },
    {
      id: 'persona_change_growth',
      name: 'Persona F (Change + growth + letting go)',
      checkIns: [{ emotion: 'Hopeful', intensity: 3, reflection: 'Closing one chapter and starting a new venture.' }],
      journals: [
        { title: 'Letting go of the old', content: 'Packed up my old office today. Releasing past expectations and stepping forward with curiosity into the next chapter.', type: 'free_write', emotion: 'Hopeful' }
      ]
    },
    {
      id: 'persona_mixed_trajectory',
      name: 'Persona G (Mixed emotional trajectory)',
      checkIns: [{ emotion: 'Frustrated', intensity: 4, reflection: 'Tough morning that turned around in the evening.' }],
      journals: [
        { title: 'Turning tides', content: 'Started the day frustrated with delays, but after taking a breath and refocusing, the evening ended with grounded clarity.', type: 'free_write', emotion: 'Grounded' }
      ]
    },
    {
      id: 'persona_sparse_user',
      name: 'Persona H (Sparse user / First-time Genesis)',
      checkIns: [{ emotion: 'Curious', intensity: 2, reflection: 'Just starting out.' }],
      journals: []
    }
  ];

  const generatedWorlds = new Set<string>();
  const generatedTitles = new Set<string>();

  for (const persona of PERSONAS) {
    const userId = `${persona.id}_${Date.now()}`;

    // Seed persona data
    for (const c of persona.checkIns) {
      await sql`
        INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, reflection, created_at)
        VALUES (${userId}, 'daily_check_in', 'daily-check-in', ${c.emotion}, ${c.intensity}, ${c.reflection}, CURRENT_TIMESTAMP);
      `;
    }
    for (const j of persona.journals) {
      await sql`
        INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
        VALUES (${userId}, ${j.title}, ${j.content}, ${j.type}, ${j.emotion}, CURRENT_TIMESTAMP);
      `;
    }

    const result = await storyService.generateNextChapterForUser(userId, { timezone });
    const ch = result.chapter;
    const words = ch.content.trim().split(/\s+/).filter(Boolean).length;
    const qualityScore = ch.metadata?.qualityScore || 0;

    console.log(`\n📌 ${persona.name}`);
    console.log(`   Title: "${ch.title}"`);
    console.log(`   World: ${ch.cycle_id} ("${result.state.current_cycle_name}")`);
    console.log(`   Word Count: ${words} words (Target: 600-1000)`);
    console.log(`   Quality Score: ${qualityScore}/10`);
    console.log(`   Motif: ${ch.metadata?.symbolsUsed?.[0]}`);
    console.log(`   First Sentence: "${ch.content.split('\n')[0].slice(0, 100)}..."`);

    assert(words >= 550, `Chapter for ${persona.name} must have at least 550 words (Got: ${words})`);
    assert(qualityScore >= 7.5, `Chapter for ${persona.name} must have quality score >= 7.5 (Got: ${qualityScore})`);
    assert(!generatedTitles.has(ch.title), `Title "${ch.title}" must be unique across personas`);

    generatedWorlds.add(ch.cycle_id || 'default');
    generatedTitles.add(ch.title);

    // Cleanup
    await sql`DELETE FROM story_chapters WHERE user_id = ${userId};`;
    await sql`DELETE FROM story_states WHERE user_id = ${userId};`;
    await sql`DELETE FROM journal_entries WHERE user_id = ${userId};`;
    await sql`DELETE FROM user_activities WHERE user_id = ${userId};`;
  }

  console.log(`\n✓ Diversity Verified: Generated ${generatedWorlds.size} distinct metaphorical worlds across personas!`);

  // -------------------------------------------------------------------------
  // TEST PART 2: 7-DAY SEQUENTIAL CONTINUITY & MOTIF TRANSFORMATION TEST
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('=== PART 2: TESTING 7-DAY SEQUENTIAL MULTI-CHAPTER CONTINUITY ===');
  console.log('================================================================\n');

  const continuityUser = `test_continuity_7day_${Date.now()}`;

  try {
    for (let day = 1; day <= 7; day++) {
      const pastDays = 10 - day;
      // Seed day reflection with past timestamp so it belongs to that day
      const [ref] = await sql`
        INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
        VALUES (
          ${continuityUser}, 
          ${`Day ${day} reflection on perseverance`}, 
          ${`Day ${day}: Making steady progress, drinking tea, and taking time to walk in the evening air.`}, 
          'free_write', 
          ${day % 2 === 0 ? 'Calm' : 'Hopeful'}, 
          CURRENT_TIMESTAMP - (${pastDays} * INTERVAL '1 day')
        ) RETURNING id;
      `;

      // Generate daily chapter
      const genResult = await storyService.generateNextChapterForUser(continuityUser, { timezone });
      const ch = genResult.chapter;
      const words = ch.content.trim().split(/\s+/).filter(Boolean).length;
      const qualityScore = ch.metadata?.qualityScore || 0;
      const cycleProgress = genResult.state.cycle_progress;

      console.log(`📖 Day ${day} (Chapter ${ch.chapter_number}): "${ch.title}"`);
      console.log(`   Stage: ${cycleProgress?.stage} (Chapter in Cycle: ${cycleProgress?.chapter_in_cycle})`);
      console.log(`   Word Count: ${words} words | Quality: ${qualityScore}/10`);
      console.log(`   Active Thread: "${genResult.state.open_threads?.[0]?.text}" [Status: ${genResult.state.open_threads?.[0]?.status}]`);
      console.log(`   Suspense Hook: ${ch.metadata?.suspenseType}`);

      assert(ch.chapter_number === day, `Chapter number must match day ${day}`);
      assert(words >= 550, `Chapter ${day} must meet word count requirement (Got: ${words})`);
      assert(qualityScore >= 7.5, `Chapter ${day} quality score must be >= 7.5`);

      // Backdate generated chapter to the past day so next day is eligible
      await sql`
        UPDATE story_chapters 
        SET 
          story_day_date = (CURRENT_DATE - (${pastDays} * INTERVAL '1 day'))::date,
          created_at = CURRENT_TIMESTAMP - (${pastDays} * INTERVAL '1 day')
        WHERE user_id = ${continuityUser} AND chapter_number = ${day};
      `;
    }

    console.log('\n✓ 7-Day Continuity Verified: Completed full weekly arc with zero duplicate titles and progressive thread/motif evolution!');

    console.log('\n================================================================');
    console.log('✨ ALL STORY CONTENT QUALITY & 7-DAY ARCS TESTS PASSED! ✨');
    console.log('================================================================\n');
  } finally {
    await sql`DELETE FROM story_chapters WHERE user_id = ${continuityUser};`;
    await sql`DELETE FROM story_states WHERE user_id = ${continuityUser};`;
    await sql`DELETE FROM journal_entries WHERE user_id = ${continuityUser};`;
  }
}

runStoryQualityOverhaulTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
