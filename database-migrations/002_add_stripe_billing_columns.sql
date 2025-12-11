-- Add Stripe billing columns to users table
-- This migration adds support for Stripe subscription management

ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS subscription_renews_at timestamptz;

-- Ensure plan column has proper default and constraint
ALTER TABLE users
ALTER COLUMN plan SET DEFAULT 'free';

-- Add check constraint for plan values (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_plan_check'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_plan_check CHECK (plan IN ('free', 'pro', 'power'));
  END IF;
END $$;

-- Create index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
