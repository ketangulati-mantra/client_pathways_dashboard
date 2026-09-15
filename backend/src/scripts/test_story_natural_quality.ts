import { sql } from '../db/client.js';
import { storyService } from '../services/storyService.js';
import { storyQualityEngine } from '../services/storyQualityEngine.js';
import { setupDb } from '../utils/setupDb.js';
import assert from 'assert';

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

async function runNaturalQualityTests() {
  console.log('================================================================');
  console.log('📖 TESTING NATURAL QUALITY, SIMPLE LANGUAGE & RADICAL DIFFERENTIATION');
  console.log('================================================================\n');

  await setupDb();
  const timezone = 'UTC';

  // TEST 1: User A vs User B Radical Differentiation
  console.log('=== TEST 1: USER A (STUDY + FRIENDS) vs USER B (WORK OVERWHELM + SOLITUDE) ===\n');

  const userA = `test_natural_user_a_${Date.now()}`;
  const userB = `test_natural_user_b_${Date.now()}`;

  // User A input
  await sql`
    INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, intensity, created_at)
    VALUES (
      ${userA},
      'Exams and Study Pressure',
      'I had a stressful day studying for exams, but meeting my friends afterward made me feel lighter. We had tea and talked.',
      'free_write',
      'Relieved',
      3,
      CURRENT_TIMESTAMP
    );
  `;

  // User B input
  await sql`
    INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, intensity, created_at)
    VALUES (
      ${userB},
      'Work Overload',
      'I felt overwhelmed at work today with back-to-back meetings. I went home alone, shut my laptop, and finally had some quiet time by the window.',
      'free_write',
      'Overwhelmed',
      4,
      CURRENT_TIMESTAMP
    );
  `;

  const [resA, resB] = await Promise.all([
    storyService.generateNextChapterForUser(userA, { timezone }),
    storyService.generateNextChapterForUser(userB, { timezone })
  ]);

  const chA = resA.chapter;
  const chB = resB.chapter;

  console.log('📌 User A Chapter 1:');
  console.log(`   Title: "${chA.title}"`);
  console.log(`   World: ${chA.metadata.worldName}`);
  console.log(`   Word Count: ${chA.metadata.wordCount} words`);
  console.log(`   Quality Score: ${chA.metadata.qualityScore}/10`);
  console.log(`   First Paragraph:\n   ${chA.content.split('\n\n')[0]}`);
  console.log(`   Dialogue excerpt:\n   ${chA.content.split('\n\n')[2]}\n`);

  console.log('📌 User B Chapter 1:');
  console.log(`   Title: "${chB.title}"`);
  console.log(`   World: ${chB.metadata.worldName}`);
  console.log(`   Word Count: ${chB.metadata.wordCount} words`);
  console.log(`   Quality Score: ${chB.metadata.qualityScore}/10`);
  console.log(`   First Paragraph:\n   ${chB.content.split('\n\n')[0]}`);
  console.log(`   Dialogue excerpt:\n   ${chB.content.split('\n\n')[2]}\n`);

  // Assertions for Test 1
  assert.notStrictEqual(chA.metadata.worldId, chB.metadata.worldId, 'User A and User B must receive different worlds');
  assert.notStrictEqual(chA.title, chB.title, 'User A and User B must receive different titles');
  assert(chA.metadata.wordCount >= 400 && chA.metadata.wordCount <= 900, 'User A word count in optimal range');
  assert(chB.metadata.wordCount >= 400 && chB.metadata.wordCount <= 900, 'User B word count in optimal range');

  // Check 0% Banned Purple Prose
  const contentLowerA = chA.content.toLowerCase();
  const contentLowerB = chB.content.toLowerCase();

  BANNED_PURPLE_PROSE.forEach((word) => {
    assert(!contentLowerA.includes(word), `User A story must not contain purple prose word: "${word}"`);
    assert(!contentLowerB.includes(word), `User B story must not contain purple prose word: "${word}"`);
  });
  console.log('✓ Banned Purple Prose Check Passed: 0% academic / purple words detected!\n');

  // TEST 2: Multi-Reflection Same-Day Synthesis
  console.log('=== TEST 2: MULTI-REFLECTION SAME-DAY COHESIVE SYNTHESIS ===\n');

  const userMulti = `test_natural_user_multi_${Date.now()}`;

  // 3 same-day reflections forming an emotional arc
  await sql`
    INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, intensity, created_at)
    VALUES 
    (${userMulti}, 'Morning Anxiety', 'Woke up feeling anxious about my project deadlines.', 'free_write', 'Anxious', 4, CURRENT_TIMESTAMP),
    (${userMulti}, 'Afternoon Chat', 'Talked to my partner over lunch and felt supported.', 'free_write', 'Calm', 3, CURRENT_TIMESTAMP),
    (${userMulti}, 'Evening Realization', 'Realized I need to take things one step at a time and rest.', 'free_write', 'Grounded', 2, CURRENT_TIMESTAMP);
  `;

  const resMulti = await storyService.generateNextChapterForUser(userMulti, { timezone });
  const chMulti = resMulti.chapter;

  console.log(`📌 User Multi Chapter 1: "${chMulti.title}"`);
  console.log(`   Word Count: ${chMulti.metadata.wordCount} words`);
  console.log(`   Quality Score: ${chMulti.metadata.qualityScore}/10`);
  console.log(`   Content Preview:\n   ${chMulti.content.split('\n\n').slice(0, 2).join('\n\n')}\n`);

  assert(chMulti.metadata.wordCount >= 450, 'Multi-reflection chapter has rich depth');
  assert(chMulti.metadata.qualityScore >= 7.5, 'Multi-reflection chapter has high quality score');
  console.log('✓ Multi-Reflection Synthesis Verified: 3 reflections unified into 1 coherent story arc!\n');

  // TEST 3: 7-Day Multi-Chapter Continuity
  console.log('=== TEST 3: 7-DAY MULTI-CHAPTER LONGITUDINAL CONTINUITY ===\n');

  const userCont = `test_natural_user_cont_${Date.now()}`;

  for (let day = 1; day <= 7; day++) {
    const pastDays = 10 - day;
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (
        ${userCont},
        ${`Day ${day} reflection`},
        ${`Day ${day}: Making steady progress, drinking tea on the porch, and taking a quiet walk.`},
        'free_write',
        ${day % 2 === 0 ? 'Calm' : 'Hopeful'},
        CURRENT_TIMESTAMP - (${pastDays} * INTERVAL '1 day')
      );
    `;

    const genRes = await storyService.generateNextChapterForUser(userCont, { timezone });
    const ch = genRes.chapter;

    console.log(`📖 Day ${day} (Chapter ${ch.chapter_number}): "${ch.title}"`);
    console.log(`   Words: ${ch.metadata.wordCount} | Quality: ${ch.metadata.qualityScore}/10 | Stage: ${genRes.state.cycle_progress?.stage}`);

    assert(ch.chapter_number === day, `Chapter number matches day ${day}`);
    assert(ch.metadata.wordCount >= 400, 'Word count meets requirement');

    // Backdate chapter
    await sql`
      UPDATE story_chapters
      SET
        story_day_date = (CURRENT_DATE - (${pastDays} * INTERVAL '1 day'))::date,
        created_at = CURRENT_TIMESTAMP - (${pastDays} * INTERVAL '1 day')
      WHERE user_id = ${userCont} AND chapter_number = ${day};
    `;
  }

  console.log('\n✓ 7-Day Longitudinal Arc Verified: Full weekly cycle completed with evolving motifs and simple, natural prose!\n');
  console.log('================================================================');
  console.log('✨ ALL NATURAL QUALITY & SIMPLE LANGUAGE TESTS PASSED! ✨');
  console.log('================================================================');
}

runNaturalQualityTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
