-- Create early_access_signups table for holding page signups
CREATE TABLE IF NOT EXISTS early_access_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'holding_page',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_early_access_signups_email ON early_access_signups(email);

-- Create index on created_at for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_early_access_signups_created_at ON early_access_signups(created_at);

-- Add comment to table
COMMENT ON TABLE early_access_signups IS 'Stores early access signup emails from the holding page';


