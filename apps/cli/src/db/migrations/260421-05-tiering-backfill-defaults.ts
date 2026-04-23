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
    SET
      entitlement_updated_at = COALESCE(entitlement_updated_at, NOW()),
      view_only_effective = CASE WHEN entitlement_state = 'inactive' THEN TRUE ELSE view_only_effective END
    WHERE entitlement_updated_at IS NULL
      OR (entitlement_state = 'inactive' AND view_only_effective = FALSE);
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    UPDATE "${LOCATION_PROJECT_TABLE}"
    SET
      project_type = NULL,
      view_only_effective = FALSE,
      entitlement_updated_at = NULL
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
