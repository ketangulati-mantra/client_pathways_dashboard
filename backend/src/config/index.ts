import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend-specific .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isProd = process.env.NODE_ENV === 'production';
const targetPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 80;

const DEFAULT_DB_URL = 'postgresql://neondb_owner:npg_p3UDOg6fsydB@ep-still-wave-azxe0y0q.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export const config = {
  port: targetPort,
  databaseUrl: process.env.DATABASE_URL || DEFAULT_DB_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'mantracare_admin_jwt_super_secret_key_2026',
  cookieSecret: process.env.COOKIE_SECRET || 'mantracare_cookie_secret_key_2026',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'hxbamdqf',
    apiKey: process.env.CLOUDINARY_API_KEY || '945291215694863',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'bf4nrUef-ITYjztuN3vZecq_KWI',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    modelName: process.env.MODEL_NAME || 'gemini-2.5-flash'
  }
};
