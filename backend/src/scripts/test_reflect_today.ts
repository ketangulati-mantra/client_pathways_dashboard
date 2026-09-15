import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function testReflectToday() {
  console.log('Testing Reflect on Today persistence in Neon DB...');

  const promptsData = [
    {
      step: 1,
      title: 'Look Back',
      prompt: "What's been taking up the most space in your mind today?",
      response: 'Balancing client deliverables with team check-ins was feeling slightly scattered.'
    },
    {
      step: 2,
      title: 'Explore',
      prompt: 'Was there a specific moment when that weight felt heaviest?',
      response: 'Around 2 PM right before our project review.'
    },
    {
      step: 3,
      title: 'Understand',
      prompt: 'What is one small boundary or pause you might give yourself right now?',
      response: 'Stepping outside for a 15-minute screen-free walk.'
    }
  ];

  const formattedContent = promptsData.map(p => `### ${p.prompt}\n${p.response}`).join('\n\n');

  const [inserted] = await sql`
    INSERT INTO journal_entries (
      user_id,
      title,
      content,
      entry_type,
      emotion,
      emotion_zone,
      intensity,
      metadata
    ) VALUES (
      '234306',
      'Reflecting on feeling Overwhelmed',
      ${formattedContent},
      'reflect_today',
      'Overwhelmed',
      'high_unpleasant',
      4,
      ${JSON.stringify({ prompts: promptsData })}
    )
    RETURNING *;
  `;

  console.log('✓ Successfully created Reflect on Today entry:', inserted.id, inserted.title);
  console.log('✓ Entry Type:', inserted.entry_type);
  console.log('✓ Stored Prompts Metadata:', inserted.metadata);
}

testReflectToday().catch(console.error);
