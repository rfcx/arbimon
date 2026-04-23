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

-- Align inactive/view-only projection for any existing rows.
UPDATE location_project
SET
  entitlement_updated_at = COALESCE(entitlement_updated_at, NOW()),
  view_only_effective = CASE WHEN entitlement_state = 'inactive' THEN TRUE ELSE view_only_effective END
WHERE entitlement_updated_at IS NULL
   OR (entitlement_state = 'inactive' AND view_only_effective = FALSE);

COMMIT;
