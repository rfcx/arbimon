import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const PREMIUM_UNLOCK_TABLE = 'user_account_premium_unlock'
const TIER_CHANGE_REQUEST_TABLE = 'account_tier_change_request'
const TIER_CHANGE_SELECTION_TABLE = 'account_tier_change_project_selection'

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    CREATE TABLE IF NOT EXISTS "${PREMIUM_UNLOCK_TABLE}" (
      id SERIAL PRIMARY KEY,
      user_profile_id INTEGER NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
      slot_count INTEGER NOT NULL DEFAULT 1,
      source VARCHAR(64) NOT NULL DEFAULT 'manual',
      starts_at TIMESTAMPTZ,
      ends_at TIMESTAMPTZ,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS user_account_premium_unlock_user_idx ON "${PREMIUM_UNLOCK_TABLE}" (user_profile_id);`)
  await grant(context.sequelize, PREMIUM_UNLOCK_TABLE, [GrantPermission.SELECT, GrantPermission.INSERT, GrantPermission.UPDATE, GrantPermission.DELETE], DatabaseUser.API)

  await context.sequelize.query(`
    CREATE TABLE IF NOT EXISTS "${TIER_CHANGE_REQUEST_TABLE}" (
      id SERIAL PRIMARY KEY,
      user_profile_id INTEGER NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
      from_tier account_tier_code NOT NULL,
      to_tier account_tier_code NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'draft',
      submitted_at TIMESTAMPTZ,
      processed_at TIMESTAMPTZ,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS account_tier_change_request_user_idx ON "${TIER_CHANGE_REQUEST_TABLE}" (user_profile_id);`)
  await grant(context.sequelize, TIER_CHANGE_REQUEST_TABLE, [GrantPermission.SELECT, GrantPermission.INSERT, GrantPermission.UPDATE, GrantPermission.DELETE], DatabaseUser.API)

  await context.sequelize.query(`
    CREATE TABLE IF NOT EXISTS "${TIER_CHANGE_SELECTION_TABLE}" (
      id SERIAL PRIMARY KEY,
      account_tier_change_request_id INTEGER NOT NULL REFERENCES "${TIER_CHANGE_REQUEST_TABLE}"(id) ON DELETE CASCADE,
      location_project_id INTEGER NOT NULL REFERENCES location_project(id) ON DELETE CASCADE,
      selected_project_type project_type_code,
      selected_entitlement_state project_entitlement_state_code NOT NULL DEFAULT 'active',
      selection_reason VARCHAR(64),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (account_tier_change_request_id, location_project_id)
    );
  `)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS account_tier_change_project_selection_request_idx ON "${TIER_CHANGE_SELECTION_TABLE}" (account_tier_change_request_id);`)
  await context.sequelize.query(`CREATE INDEX IF NOT EXISTS account_tier_change_project_selection_project_idx ON "${TIER_CHANGE_SELECTION_TABLE}" (location_project_id);`)
  await grant(context.sequelize, TIER_CHANGE_SELECTION_TABLE, [GrantPermission.SELECT, GrantPermission.INSERT, GrantPermission.UPDATE, GrantPermission.DELETE], DatabaseUser.API)

  await context.sequelize.query(`
    COMMENT ON TABLE "${TIER_CHANGE_REQUEST_TABLE}" IS 'Tracks requested or applied tier changes such as pro->free or enterprise->pro.';
    COMMENT ON TABLE "${TIER_CHANGE_SELECTION_TABLE}" IS 'Stores which projects the user selected to keep paid slots during downgrade.';
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`DROP TABLE IF EXISTS "${TIER_CHANGE_SELECTION_TABLE}";`)
  await context.sequelize.query(`DROP TABLE IF EXISTS "${TIER_CHANGE_REQUEST_TABLE}";`)
  await context.dropTable(PREMIUM_UNLOCK_TABLE)
}
