import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as path from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables manually from .env.local if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, "../../../.env.local");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const index = trimmed.indexOf("=");
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          const value = trimmed.substring(index + 1).trim();
          process.env[key] = value;
        }
      }
    });
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString: connectionString,
  });

  const db = drizzle(pool);

  console.log("Running migrations...");
  
  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "../drizzle"),
    });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
