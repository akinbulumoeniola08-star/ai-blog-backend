const { Pool } = require("pg");

// DATABASE_URL will be set as an environment variable on Render
// (this is the "Internal Database URL" you copied earlier)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com")
    ? { rejectUnauthorized: false }
    : false
});

// Creates the posts table automatically if it doesn't exist yet.
// Safe to run every time the app starts.
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      topic TEXT,
      source TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

module.exports = { pool, ensureSchema };
