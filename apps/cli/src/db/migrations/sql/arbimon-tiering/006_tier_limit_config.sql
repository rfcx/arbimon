CREATE TABLE IF NOT EXISTS project_type_limit (
  project_type project_type_code PRIMARY KEY,
  recording_minutes_limit INTEGER,
  collaborator_limit INTEGER,
  guest_limit INTEGER,
  analyze_job_limit INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_tier_project_limit (
  account_tier account_tier_code NOT NULL,
  project_type project_type_code NOT NULL,
  active_project_limit INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (account_tier, project_type)
);

INSERT INTO project_type_limit (project_type, recording_minutes_limit, collaborator_limit, guest_limit, analyze_job_limit)
VALUES
  ('free', 40000, 0, 0, 50),
  ('premium', 1000000, 4, 3, 200),
  ('unlimited', NULL, NULL, NULL, NULL)
ON CONFLICT (project_type) DO UPDATE SET
  recording_minutes_limit = EXCLUDED.recording_minutes_limit,
  collaborator_limit = EXCLUDED.collaborator_limit,
  guest_limit = EXCLUDED.guest_limit,
  analyze_job_limit = EXCLUDED.analyze_job_limit,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO account_tier_project_limit (account_tier, project_type, active_project_limit)
VALUES
  ('free', 'free', 5),
  ('free', 'premium', 0),
  ('free', 'unlimited', 0),
  ('pro', 'free', 50),
  ('pro', 'premium', 2),
  ('pro', 'unlimited', 0),
  ('enterprise', 'free', NULL),
  ('enterprise', 'premium', NULL),
  ('enterprise', 'unlimited', 1)
ON CONFLICT (account_tier, project_type) DO UPDATE SET
  active_project_limit = EXCLUDED.active_project_limit,
  updated_at = CURRENT_TIMESTAMP;

COMMENT ON TABLE project_type_limit IS 'Canonical project-type limits for recording minutes, collaborators, guests, and analysis jobs.';
COMMENT ON TABLE account_tier_project_limit IS 'Canonical account-tier portfolio limits by allowed active project type.';
