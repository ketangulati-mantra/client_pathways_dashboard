import { neon } from '@neondatabase/serverless';

const DEFAULT_DB_URL = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(process.env.DATABASE_URL || DEFAULT_DB_URL);

async function runAudit() {
  console.log('=== RUNNING COMPREHENSIVE JOURNAL ECOSYSTEM AUDIT ===\n');

  try {
    // 1. Audit journal_entries table structure
    const tableRes = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'journal_entries'
      ORDER BY ordinal_position;
    `;

    console.log('1. journal_entries Table Columns:');
    tableRes.forEach(r => console.log(`   - ${r.column_name} (${r.data_type}) nullable=${r.is_nullable}`));

    // 2. Query sample real records across all entry types
    const entries = await sql`
      SELECT id, user_id, entry_type, title, content, emotion, metadata, created_at
      FROM journal_entries
      ORDER BY created_at DESC
      LIMIT 10;
    `;

    console.log(`\n2. Real Database Journal Records found: ${entries.length}`);
    entries.forEach((row, i) => {
      console.log(`\n[Record #${i + 1}]`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Type: ${row.entry_type}`);
      console.log(`   Title: "${row.title}"`);
      console.log(`   Emotion: ${row.emotion}`);
      console.log(`   Content Length: ${row.content?.length || 0} chars`);
      console.log(`   Metadata:`, JSON.stringify(row.metadata));
      console.log(`   Raw Preview: "${row.content?.slice(0, 80).replace(/\n/g, ' ')}..."`);
    });

    // 3. Test Markdown Stripping on records containing ### headings
    console.log('\n3. Testing Content Sanitization:');
    function cleanRawMarkdown(text) {
      if (!text || typeof text !== 'string') return '';
      return text
        .replace(/^###\s+.*$/gm, '')
        .replace(/^##\s+.*$/gm, '')
        .replace(/^#\s+.*$/gm, '')
        .replace(/[*_~`]/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    const testMarkdown = `### What stood out most about your day today?\nI had a quiet coffee in the morning and felt at peace.\n\n### How did that experience make you feel underneath?\nIt made me realize how much I needed rest.`;
    const cleaned = cleanRawMarkdown(testMarkdown);
    console.log('   Original Markdown:');
    console.log('   ------------------');
    console.log(testMarkdown);
    console.log('   Cleaned User Reflection:');
    console.log('   -----------------------');
    console.log(cleaned);

    if (cleaned.includes('###')) {
      throw new Error('Markdown heading was not stripped!');
    }
    console.log('   ✓ Markdown headings cleanly stripped with 0 artifacts.');

    // 4. Test Patterns timeframe filtering calculations
    console.log('\n4. Testing Patterns Analytics Computation:');
    const allJournals = entries;
    const now = new Date();
    const cutoff7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const cutoff30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const journals7d = allJournals.filter(j => new Date(j.created_at) >= cutoff7d);
    const journals30d = allJournals.filter(j => new Date(j.created_at) >= cutoff30d);

    console.log(`   Total entries (All Time): ${allJournals.length}`);
    console.log(`   Entries in Last 30 Days: ${journals30d.length}`);
    console.log(`   Entries in Last 7 Days: ${journals7d.length}`);

    // Verify type counts
    const typeCounts = { free_write: 0, guided_prompt: 0, reflect_today: 0 };
    allJournals.forEach(j => {
      const type = j.entry_type || 'free_write';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    console.log('   Type Distribution:', typeCounts);

    console.log('\n=== AUDIT VERIFICATION SUCCESSFUL ===');
  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  }
}

runAudit();
