import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 5001,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bis_sahayak',
  JWT_SECRET: process.env.JWT_SECRET || 'bis_sahayak_jwt_secure_secret_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RAG_API_URL: process.env.RAG_API_URL || 'http://127.0.0.1:8000',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
