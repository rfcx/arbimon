import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const PROJECT_TYPE_LIMIT_TABLE = 'project_type_limit'
const ACCOUNT_TIER_PROJECT_LIMIT_TABLE = 'account_tier_project_limit'

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    CREATE TABLE IF NOT EXISTS "${PROJECT_TYPE_LIMIT_TABLE}" (
      project_type project_type_code PRIMARY KEY,
      recording_minutes_limit INTEGER,
      collaborator_limit INTEGER,
      guest_limit INTEGER,
      analyze_job_limit INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await grant(context.sequelize, PROJECT_TYPE_LIMIT_TABLE, [GrantPermission.SELECT, GrantPermission.INSERT, GrantPermission.UPDATE, GrantPermission.DELETE], DatabaseUser.API)

  await context.sequelize.query(`
    CREATE TABLE IF NOT EXISTS "${ACCOUNT_TIER_PROJECT_LIMIT_TABLE}" (
      account_tier account_tier_code NOT NULL,
      project_type project_type_code NOT NULL,
      active_project_limit INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (account_tier, project_type)
    );
  `)
  await grant(context.sequelize, ACCOUNT_TIER_PROJECT_LIMIT_TABLE, [GrantPermission.SELECT, GrantPermission.INSERT, GrantPermission.UPDATE, GrantPermission.DELETE], DatabaseUser.API)

  await context.sequelize.query(`
    INSERT INTO "${PROJECT_TYPE_LIMIT_TABLE}" (project_type, recording_minutes_limit, collaborator_limit, guest_limit, analyze_job_limit)
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
  `)

  await context.sequelize.query(`
    INSERT INTO "${ACCOUNT_TIER_PROJECT_LIMIT_TABLE}" (account_tier, project_type, active_project_limit)
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
  `)

  await context.sequelize.query(`
    COMMENT ON TABLE "${PROJECT_TYPE_LIMIT_TABLE}" IS 'Canonical project-type limits for recording minutes, collaborators, guests, and analysis jobs.';
    COMMENT ON TABLE "${ACCOUNT_TIER_PROJECT_LIMIT_TABLE}" IS 'Canonical account-tier portfolio limits by allowed active project type.';
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`DROP TABLE IF EXISTS "${ACCOUNT_TIER_PROJECT_LIMIT_TABLE}";`)
  await context.sequelize.query(`DROP TABLE IF EXISTS "${PROJECT_TYPE_LIMIT_TABLE}";`)
}
