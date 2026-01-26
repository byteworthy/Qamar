const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:jtqOfovqOkRtosDIhmwDvjqXvTolfjrA@gondola.proxy.rlwy.net:10765/railway',
  ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT, stripe_customer_id TEXT, stripe_subscription_id TEXT, subscription_status TEXT DEFAULT 'free', current_period_end TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS user_sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, email TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, expires_at TIMESTAMP NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (id SERIAL PRIMARY KEY, user_id TEXT NOT NULL, thought TEXT NOT NULL, distortions JSONB NOT NULL, reframe TEXT NOT NULL, intention TEXT NOT NULL, practice TEXT NOT NULL, key_assumption TEXT, detected_state TEXT, anchor TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS processed_stripe_events (event_id TEXT PRIMARY KEY, event_type TEXT NOT NULL, processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
`;

async function createTables() {
  try {
    await pool.query(sql);
    console.log('✅ All tables created successfully!');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTables();
