import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function run() {
  try {
    console.log('⚡ Initializing Database Schema in new Neon DB...');

    // Read schema.sql
    const schemaSql = fs.readFileSync(path.resolve('backend/src/db/schema.sql'), 'utf-8');
    const schemaAdminsSql = fs.existsSync(path.resolve('backend/src/db/schema_admins.sql'))
      ? fs.readFileSync(path.resolve('backend/src/db/schema_admins.sql'), 'utf-8')
      : '';

    const fullSql = schemaSql + '\n' + schemaAdminsSql;
    
    // Clean up SQL comments and split by semicolon
    const cleanSql = fullSql.replace(/--.*$/gm, '');
    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        await sql.query(stmt);
      } catch (e) {
        console.warn('Statement warning:', e.message || e);
      }
    }

    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log('\n✅ Database setup complete!');
    console.log('Total Tables Created:', tables.length);
    console.table(tables.map(t => ({ TableName: t.table_name })).sort((a, b) => a.TableName.localeCompare(b.TableName)));
  } catch (err) {
    console.error('❌ Migration Error:', err);
  }
}

run();
