const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: connectionString,
  });

  const client = await pool.connect();

  try {
    const sqlFile = path.join(__dirname, 'drizzle', '0000_old_lady_bullseye.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    console.log('Running migrations...');
    await client.query(sql);
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});
