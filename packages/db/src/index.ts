import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables manually from .env.local if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.resolve(__dirname, '../../../.env.local');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      envFile.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const index = trimmed.indexOf('=');
          if (index !== -1) {
            const key = trimmed.substring(0, index).trim();
            const value = trimmed.substring(index + 1).trim();
            process.env[key] = value;
          }
        }
      });
    }
  } catch (e) {
    console.warn('Failed to load .env.local manually:', e);
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export type DB = typeof db;
export * from './schema';
