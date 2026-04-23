import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const USER_PROFILE_TABLE = 'user_profile'
const LOCATION_PROJECT_TABLE = 'location_project'

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_tier_code') THEN
        CREATE TYPE account_tier_code AS ENUM ('free', 'pro', 'enterprise');
      END IF;
    END $$;
  `)

  await context.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_type_code') THEN
        CREATE TYPE project_type_code AS ENUM ('free', 'premium', 'unlimited');
      END IF;
    END $$;
  `)

  await context.sequelize.query(`
    ALTER TABLE "${USER_PROFILE_TABLE}"
      ADD COLUMN IF NOT EXISTS account_tier account_tier_code,
      ADD COLUMN IF NOT EXISTS account_tier_updated_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS additional_premium_project_slots INTEGER NOT NULL DEFAULT 0;
  `)

  await context.sequelize.query(`
    ALTER TABLE "${LOCATION_PROJECT_TABLE}"
      ADD COLUMN IF NOT EXISTS project_type project_type_code;
  `)

  await context.sequelize.query(`
    COMMENT ON COLUMN "${USER_PROFILE_TABLE}".account_tier IS 'User paid tier: free, pro, enterprise';
    COMMENT ON COLUMN "${USER_PROFILE_TABLE}".additional_premium_project_slots IS 'Purchased add-on premium project slots for Pro accounts';
    COMMENT ON COLUMN "${LOCATION_PROJECT_TABLE}".project_type IS 'Project entitlement type: free, premium, unlimited';
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    ALTER TABLE "${LOCATION_PROJECT_TABLE}"
      DROP COLUMN IF EXISTS project_type;
  `)

  await context.sequelize.query(`
    ALTER TABLE "${USER_PROFILE_TABLE}"
      DROP COLUMN IF EXISTS additional_premium_project_slots,
      DROP COLUMN IF EXISTS account_tier_updated_at,
      DROP COLUMN IF EXISTS account_tier;
  `)

  await context.sequelize.query(`DROP TYPE IF EXISTS project_type_code;`)
  await context.sequelize.query(`DROP TYPE IF EXISTS account_tier_code;`)
}
