-- Home Champion Database Schema
-- This migration creates all necessary tables for the Home Champion app

-- Create users table (for Clerk integration)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chores table
CREATE TABLE IF NOT EXISTS chore (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS reward (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member_chore junction table (for tracking completed chores)
CREATE TABLE IF NOT EXISTS member_chore (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  chore_id INTEGER REFERENCES chore(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 1,
  date TIMESTAMP WITH TIME ZONE[] DEFAULT ARRAY[NOW()],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, chore_id)
);

-- Create member_reward junction table (for tracking redeemed rewards)
CREATE TABLE IF NOT EXISTS member_reward (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  reward_id INTEGER REFERENCES reward(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 1,
  date TIMESTAMP WITH TIME ZONE[] DEFAULT ARRAY[NOW()],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, reward_id)
);

-- Create points_deduction table for tracking point deductions
CREATE TABLE IF NOT EXISTS points_deduction (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_clerk_user_id ON members(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_chore_user_id ON chore(user_id);
CREATE INDEX IF NOT EXISTS idx_chore_clerk_user_id ON chore(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_reward_user_id ON reward(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_clerk_user_id ON reward(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_chore ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_reward ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_deduction ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Members policies
CREATE POLICY "Users can view own members" ON members
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can manage own members" ON members
  FOR ALL USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Chores policies
CREATE POLICY "Users can view own chores" ON chore
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can manage own chores" ON chore
  FOR ALL USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Rewards policies
CREATE POLICY "Users can view own rewards" ON reward
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can manage own rewards" ON reward
  FOR ALL USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Member_chore policies
CREATE POLICY "Users can view own member chores" ON member_chore
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can manage own member chores" ON member_chore
  FOR ALL USING (
    member_id IN (
      SELECT id FROM members WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Member_reward policies
CREATE POLICY "Users can view own member rewards" ON member_reward
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can manage own member rewards" ON member_reward
  FOR ALL USING (
    member_id IN (
      SELECT id FROM members WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Points deduction policies
CREATE POLICY "Users can view own points deductions" ON points_deduction
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can manage own points deductions" ON points_deduction
  FOR ALL USING (
    member_id IN (
      SELECT id FROM members WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );
