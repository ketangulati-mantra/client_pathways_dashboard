import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function run() {
  try {
    console.log('Testing connection to new Neon DB...');
    const now = await sql`SELECT NOW()`;
    console.log('✅ Connected successfully at:', now[0].now);

    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log('\nExisting Tables count:', tables.length);
    console.log('Existing Tables:', tables.map(t => t.table_name).sort());
  } catch (err) {
    console.error('❌ Connection/Query error:', err);
  }
}

run();
