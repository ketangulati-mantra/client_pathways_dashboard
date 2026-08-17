import { neon } from '@neondatabase/serverless';
import { config } from '../config/index.js';

const fallbackSql = (query: any, ...args: any[]) => {
  console.warn('⚠️ DATABASE_URL is not configured. Database query bypassed:', query);
  return Promise.resolve([]);
};

export const sql: any = config.databaseUrl 
  ? neon(config.databaseUrl)
  : fallbackSql;
