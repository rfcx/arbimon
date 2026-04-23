BEGIN;

-- Default all existing users to Free until a real billing backfill is available.
UPDATE user_profile
SET
  account_tier = COALESCE(account_tier, 'free'::account_tier_code),
  account_tier_updated_at = COALESCE(account_tier_updated_at, NOW())
WHERE account_tier IS NULL;

-- Default all existing projects to Free unless manually reclassified.
UPDATE location_project
SET project_type = COALESCE(project_type, 'free'::project_type_code)
WHERE project_type IS NULL;

-- Default existing projects to unlocked unless explicitly changed later.
UPDATE location_project
SET is_locked = COALESCE(is_locked, FALSE)
WHERE is_locked IS NULL;

COMMIT;
