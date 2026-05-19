BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_tier_code') THEN
    CREATE TYPE account_tier_code AS ENUM ('free', 'pro', 'enterprise');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_type_code') THEN
    CREATE TYPE project_type_code AS ENUM ('free', 'premium', 'unlimited');
  END IF;
END $$;

ALTER TABLE user_profile
  ADD COLUMN IF NOT EXISTS account_tier account_tier_code,
  ADD COLUMN IF NOT EXISTS account_tier_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS additional_premium_project_slots INTEGER NOT NULL DEFAULT 0;

ALTER TABLE location_project
  ADD COLUMN IF NOT EXISTS project_type project_type_code;

COMMENT ON COLUMN user_profile.account_tier IS 'User paid tier: free, pro, enterprise';
COMMENT ON COLUMN user_profile.additional_premium_project_slots IS 'Purchased add-on premium project slots for Pro accounts';
COMMENT ON COLUMN location_project.project_type IS 'Project entitlement type: free, premium, unlimited';

COMMIT;
