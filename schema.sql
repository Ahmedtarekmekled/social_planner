-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: customers (linked to GHL locations)
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ghl_location_id TEXT UNIQUE NOT NULL,
  name TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: posts
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  base_caption TEXT,
  platform_overrides JSONB DEFAULT '{}',
  platforms JSONB DEFAULT '[]', -- Array of strings: ['instagram', 'facebook', etc]
  media_urls JSONB DEFAULT '[]', -- Array of strings (GHL URLs)
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft', -- draft, scheduled, published, failed
  publer_post_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customers_ghl_location_id ON customers(ghl_location_id);
CREATE INDEX idx_posts_customer_id ON posts(customer_id);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);
