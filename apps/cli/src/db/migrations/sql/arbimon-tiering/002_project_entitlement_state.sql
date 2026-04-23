BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_entitlement_state_code') THEN
    CREATE TYPE project_entitlement_state_code AS ENUM ('active', 'inactive');
  END IF;
END $$;

ALTER TABLE location_project
  ADD COLUMN IF NOT EXISTS entitlement_state project_entitlement_state_code NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS entitlement_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS entitlement_inactivated_reason TEXT,
  ADD COLUMN IF NOT EXISTS downgrade_locked BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS view_only_effective BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS location_project_entitlement_state_idx
  ON location_project (entitlement_state);

CREATE INDEX IF NOT EXISTS location_project_project_type_idx
  ON location_project (project_type);

COMMENT ON COLUMN location_project.entitlement_state IS 'Internal entitlement state. Inactive projects should render as view-only in the UI.';
COMMENT ON COLUMN location_project.entitlement_inactivated_reason IS 'Reason a project became inactive, for example downgrade_over_limit';
COMMENT ON COLUMN location_project.downgrade_locked IS 'True when project state is the result of a downgrade selection outcome';
COMMENT ON COLUMN location_project.view_only_effective IS 'Explicit UI-facing projection of inactive entitlement state';

COMMIT;
