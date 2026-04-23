BEGIN;

CREATE TABLE IF NOT EXISTS user_account_premium_unlock (
  id SERIAL PRIMARY KEY,
  user_profile_id INTEGER NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  slot_count INTEGER NOT NULL DEFAULT 1,
  source VARCHAR(64) NOT NULL DEFAULT 'manual',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_account_premium_unlock_user_idx
  ON user_account_premium_unlock (user_profile_id);

CREATE TABLE IF NOT EXISTS account_tier_change_request (
  id SERIAL PRIMARY KEY,
  user_profile_id INTEGER NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  from_tier account_tier_code NOT NULL,
  to_tier account_tier_code NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS account_tier_change_request_user_idx
  ON account_tier_change_request (user_profile_id);

CREATE TABLE IF NOT EXISTS account_tier_change_project_selection (
  id SERIAL PRIMARY KEY,
  account_tier_change_request_id INTEGER NOT NULL REFERENCES account_tier_change_request(id) ON DELETE CASCADE,
  location_project_id INTEGER NOT NULL REFERENCES location_project(id) ON DELETE CASCADE,
  selected_project_type project_type_code,
  selected_entitlement_state project_entitlement_state_code NOT NULL DEFAULT 'active',
  selection_reason VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_tier_change_request_id, location_project_id)
);

CREATE INDEX IF NOT EXISTS account_tier_change_project_selection_request_idx
  ON account_tier_change_project_selection (account_tier_change_request_id);

CREATE INDEX IF NOT EXISTS account_tier_change_project_selection_project_idx
  ON account_tier_change_project_selection (location_project_id);

COMMENT ON TABLE account_tier_change_request IS 'Tracks requested or applied tier changes such as pro->free or enterprise->pro.';
COMMENT ON TABLE account_tier_change_project_selection IS 'Stores which projects the user selected to keep paid slots during downgrade.';

COMMIT;
