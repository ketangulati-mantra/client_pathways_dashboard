import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = 'postgresql://neondb_owner:npg_EIG4DeJn5AQv@ep-tiny-sky-azc069ex-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function run() {
  try {
    console.log('⚡ Initializing Admins Schema...');
    
    // Create admin_role_type enum
    try {
      await sql`DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role_type') THEN 
          CREATE TYPE admin_role_type AS ENUM ('admin', 'super_admin'); 
        END IF; 
      END $$;`;
      console.log('✅ Admin role type enum ensured.');
    } catch (e) {
      console.warn('Enum note:', e.message);
    }

    // Create admins table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role admin_role_type DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Created table: admins');

    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    console.log('\nTotal Tables in Neon Database:', tables.length);
    console.table(tables.map(t => ({ TableName: t.table_name })).sort((a, b) => a.TableName.localeCompare(b.TableName)));
  } catch (err) {
    console.error('❌ Error setting up admins table:', err);
  }
}

run();
