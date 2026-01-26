-- Railway Postgres Table Creation
-- Run this to initialize your database schema

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'free',
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  thought TEXT NOT NULL,
  distortions JSONB NOT NULL,
  reframe TEXT NOT NULL,
  intention TEXT NOT NULL,
  practice TEXT NOT NULL,
  key_assumption TEXT,
  detected_state TEXT,
  anchor TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create processed_stripe_events table
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Success message
SELECT 'Tables created successfully!' AS result;
