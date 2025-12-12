-- Add goal fields to launches table if they don't already exist
-- These fields allow per-launch goal tracking (moved from global onboarding)

-- Add goal_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'launches' AND column_name = 'goal_type'
  ) THEN
    ALTER TABLE launches ADD COLUMN goal_type text;
  END IF;
END $$;

-- Add goal_value if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'launches' AND column_name = 'goal_value'
  ) THEN
    ALTER TABLE launches ADD COLUMN goal_value numeric;
  END IF;
END $$;

-- Add goal_unit if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'launches' AND column_name = 'goal_unit'
  ) THEN
    ALTER TABLE launches ADD COLUMN goal_unit text;
  END IF;
END $$;
