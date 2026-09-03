import { sql } from '../db/client.js';
import { storyContextService } from '../services/storyContextService.js';
import { setupDb } from '../utils/setupDb.js';

async function runStoryContextVerification() {
  console.log('🚀 Starting Story Context Engine Verification (Phase 3)...\n');

  try {
    await setupDb();

    const testUserNoData = `test-ctx-empty-${Date.now()}`;
    const testUserSingle = `test-ctx-single-${Date.now()}`;
    const testUserRich = `test-ctx-rich-${Date.now()}`;
    const testUserIso = `test-ctx-iso-${Date.now()}`;

    // Clean up
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserNoData}, ${testUserSingle}, ${testUserRich}, ${testUserIso});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserNoData}, ${testUserSingle}, ${testUserRich}, ${testUserIso});`;

    // ==========================================
    // TEST 1: NO DATA (Sparse Handling)
    // ==========================================
    console.log('1. Testing Sparse Data Handling: User With NO Data...');
    const ctxNoData = await storyContextService.buildStoryContext(testUserNoData);
    console.log(`   ✓ Confidence Level: "${ctxNoData.dataConfidence.level}" (Expected: "none")`);
    console.log(`   ✓ Total Data Points: ${ctxNoData.dataConfidence.totalDataPoints} (Expected: 0)`);
    console.log(`   ✓ Recurring Patterns: ${ctxNoData.recurringPatterns.length} (Expected: 0)`);
    console.log(`   ✓ Emotional Direction: "${ctxNoData.emotionalDirection.status}" (Expected: "insufficient_data")`);

    if (ctxNoData.dataConfidence.level !== 'none' || ctxNoData.recurringPatterns.length !== 0) {
      throw new Error('No-data case invented patterns or misclassified confidence!');
    }

    // ==========================================
    // TEST 2: SINGLE CHECK-IN (Minimal Data)
    // ==========================================
    console.log('\n2. Testing Minimal Data: User With ONE Check-in...');
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts)
      VALUES (${testUserSingle}, 'daily_check_in', 'daily-check-in', 'Anxious', 4, '["work"]'::jsonb);
    `;

    const ctxSingle = await storyContextService.buildStoryContext(testUserSingle);
    console.log(`   ✓ Confidence Level: "${ctxSingle.dataConfidence.level}" (Expected: "low")`);
    console.log(`   ✓ Captured Emotions: ${ctxSingle.recentContext.emotions.length} (Expected: 1)`);
    console.log(`   ✓ Situation Contexts: ${JSON.stringify(ctxSingle.recentContext.situations)} (Expected: ["work"])`);
    console.log(`   ✓ Recurring Patterns: ${ctxSingle.recurringPatterns.length} (Expected: 0, no false recurrence)`);

    if (ctxSingle.dataConfidence.level !== 'low' || ctxSingle.recentContext.emotions.length !== 1) {
      throw new Error('Single check-in case misclassified context!');
    }

    // ==========================================
    // TEST 3: RICH DATA WITH RECURRING THEME & DIRECTION
    // ==========================================
    console.log('\n3. Testing Rich Canonical Data with Recurring Theme & Improving Trajectory...');
    
    // Check-in 1 (Older, heavy)
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts, created_at)
      VALUES (${testUserRich}, 'daily_check_in', 'daily-check-in', 'Overwhelmed', 4, '["work"]'::jsonb, NOW() - INTERVAL '5 days');
    `;
    // Check-in 2 (Middle, heavy)
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts, created_at)
      VALUES (${testUserRich}, 'daily_check_in', 'daily-check-in', 'Stressed', 3, '["work", "alone"]'::jsonb, NOW() - INTERVAL '3 days');
    `;
    // Check-in 3 (Recent, positive)
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts, created_at)
      VALUES (${testUserRich}, 'daily_check_in', 'daily-check-in', 'Calm', 2, '["friends"]'::jsonb, NOW() - INTERVAL '1 day');
    `;
    // Check-in 4 (Latest, positive)
    await sql`
      INSERT INTO user_activities (user_id, activity_type, activity_id, primary_emotion, intensity, contexts, created_at)
      VALUES (${testUserRich}, 'daily_check_in', 'daily-check-in', 'Grounded', 1, '["alone"]'::jsonb, NOW());
    `;

    // Reflection 1: Communication
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUserRich}, 'Talking to my friend', 'I wanted to communicate more openly about how work has been feeling.', 'free_write', 'Stressed', NOW() - INTERVAL '4 days');
    `;
    // Reflection 2: Communication + Growth
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUserRich}, 'A clear conversation', 'Had an honest conversation today. Finding space to express myself helped things feel lighter.', 'guided_prompt', 'Calm', NOW() - INTERVAL '2 days');
    `;
    // Reflection 3: Ordinary Ease / Gratitude
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, emotion, created_at)
      VALUES (${testUserRich}, 'Quiet morning walk', 'Took a slow morning walk with tea and noticed how peaceful the quiet felt.', 'free_write', 'Grounded', NOW());
    `;

    const ctxRich = await storyContextService.buildStoryContext(testUserRich);

    console.log(`   ✓ Confidence Level: "${ctxRich.dataConfidence.level}" (Expected: "high")`);
    console.log(`   ✓ Journal Count: ${ctxRich.dataConfidence.journalCount} (Expected: 3)`);
    console.log(`   ✓ Check-in Count: ${ctxRich.dataConfidence.checkInCount} (Expected: 4)`);
    console.log(`   ✓ Recurring Patterns Detected: ${ctxRich.recurringPatterns.map(p => `${p.theme} (freq: ${p.frequency})`).join(', ')}`);
    console.log(`   ✓ Emotional Direction: "${ctxRich.emotionalDirection.status}" - "${ctxRich.emotionalDirection.summary}"`);
    console.log(`   ✓ Growth Signals: ${ctxRich.growthSignals.map(g => g.type).join(', ')}`);
    console.log(`   ✓ Total Source Inputs: ${ctxRich.sourceInputs.length} (Expected: 7)`);
    console.log(`   ✓ Allegorical Seeds: ${JSON.stringify(ctxRich.storyRelevantSignals.allegoricalSeeds)}`);

    const hasCommPattern = ctxRich.recurringPatterns.some(p => p.theme === 'communication' && p.frequency >= 2);
    if (!hasCommPattern) throw new Error('Failed to detect recurring communication pattern!');
    if (ctxRich.emotionalDirection.status !== 'improving') throw new Error('Failed to detect improving emotional direction!');
    if (ctxRich.sourceInputs.length !== 7) throw new Error('Source inputs count mismatch!');

    // ==========================================
    // TEST 4: USER ISOLATION
    // ==========================================
    console.log('\n4. Testing User Isolation...');
    await sql`
      INSERT INTO journal_entries (user_id, title, content, entry_type, created_at)
      VALUES (${testUserIso}, 'User Iso Entry', 'Special secret content for user isolation test', 'free_write', NOW());
    `;

    const ctxIso = await storyContextService.buildStoryContext(testUserIso);
    console.log(`   ✓ User Iso Source Inputs: ${ctxIso.sourceInputs.length} (Expected: 1)`);
    const richHasIso = ctxRich.sourceInputs.some(s => s.source_id === ctxIso.sourceInputs[0]?.source_id);
    console.log(`   ✓ Zero cross-user data contamination verified: ${!richHasIso}`);
    if (richHasIso || ctxIso.sourceInputs.length !== 1) throw new Error('User isolation violated!');

    // Clean up
    await sql`DELETE FROM journal_entries WHERE user_id IN (${testUserNoData}, ${testUserSingle}, ${testUserRich}, ${testUserIso});`;
    await sql`DELETE FROM user_activities WHERE user_id IN (${testUserNoData}, ${testUserSingle}, ${testUserRich}, ${testUserIso});`;

    console.log('\n✨ ALL STORY CONTEXT ENGINE VERIFICATION TESTS PASSED! ✨\n');
  } catch (err) {
    console.error('\n❌ Story Context Verification Failed:', err);
    process.exit(1);
  }
}

runStoryContextVerification();
