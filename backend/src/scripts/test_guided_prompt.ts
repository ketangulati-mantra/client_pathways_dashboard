import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function testGuidedPrompt() {
  console.log('Testing Guided Prompt persistence in Neon DB...');

  const promptText = 'What brought you even a small moment of joy recently?';
  const responseText = 'Seeing morning sunlight on my plants while drinking warm tea without rushing.';

  const [inserted] = await sql`
    INSERT INTO journal_entries (
      user_id,
      title,
      content,
      entry_type,
      emotion,
      metadata
    ) VALUES (
      '234306',
      ${promptText},
      ${responseText},
      'guided_prompt',
      'Calm',
      ${JSON.stringify({
        category: 'Gratitude & Positivity',
        categoryId: 'gratitude_positivity',
        prompt: promptText
      })}
    )
    RETURNING *;
  `;

  console.log('✓ Successfully created Guided Prompt entry:', inserted.id, inserted.title);
  console.log('✓ Entry Type:', inserted.entry_type);
  console.log('✓ Metadata:', inserted.metadata);
}

testGuidedPrompt().catch(console.error);
