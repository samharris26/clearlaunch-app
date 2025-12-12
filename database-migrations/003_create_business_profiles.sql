-- Create business_profiles table for storing business information separate from user auth
-- This allows users to edit business details without affecting auth.users

CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text,
  website_url text,
  audience text,
  tone_preset text,
  timezone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);

-- Enable RLS
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can SELECT their own business profile
CREATE POLICY "Users can view their own business profile"
  ON business_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can INSERT their own business profile
CREATE POLICY "Users can create their own business profile"
  ON business_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can UPDATE their own business profile
CREATE POLICY "Users can update their own business profile"
  ON business_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_business_profiles_updated_at();
