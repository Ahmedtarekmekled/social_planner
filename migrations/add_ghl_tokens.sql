-- Table to store GHL OAuth tokens per location
CREATE TABLE IF NOT EXISTS ghl_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ghl_location_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ghl_tokens_location_id ON ghl_tokens(ghl_location_id);

-- Add reference to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS has_ghl_token BOOLEAN DEFAULT FALSE;
