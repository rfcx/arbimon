import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const USER_PROFILE_TABLE = 'user_profile'
const LOCATION_PROJECT_TABLE = 'location_project'

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    UPDATE "${USER_PROFILE_TABLE}"
    SET
      account_tier = COALESCE(account_tier, 'free'::account_tier_code),
      account_tier_updated_at = COALESCE(account_tier_updated_at, NOW())
    WHERE account_tier IS NULL;
  `)

  await context.sequelize.query(`
    UPDATE "${LOCATION_PROJECT_TABLE}"
    SET project_type = COALESCE(project_type, 'free'::project_type_code)
    WHERE project_type IS NULL;
  `)

  await context.sequelize.query(`
    UPDATE "${LOCATION_PROJECT_TABLE}"
    SET is_locked = COALESCE(is_locked, FALSE)
    WHERE is_locked IS NULL;
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    UPDATE "${LOCATION_PROJECT_TABLE}"
    SET
      project_type = NULL,
      is_locked = FALSE
    WHERE project_type = 'free'::project_type_code;
  `)

  await context.sequelize.query(`
    UPDATE "${USER_PROFILE_TABLE}"
    SET
      account_tier = NULL,
      account_tier_updated_at = NULL
    WHERE account_tier = 'free'::account_tier_code;
  `)
}
