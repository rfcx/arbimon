BEGIN;

ALTER TABLE location_project
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS location_project_project_type_idx
  ON location_project (project_type);

COMMENT ON COLUMN location_project.is_locked IS 'Project is locked for tiering-related restrictions such as inactive or over-limit states.';

COMMIT;
