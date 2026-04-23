import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const MEMBER_USAGE_VIEW = 'location_project_member_quota_usage'

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    CREATE OR REPLACE VIEW "${MEMBER_USAGE_VIEW}" AS
    SELECT
      lpur.location_project_id,
      COUNT(*) FILTER (WHERE lpur.role_id = 3) AS guest_count,
      COUNT(*) FILTER (WHERE lpur.role_id NOT IN (3, 4)) AS collaborator_count
    FROM location_project_user_role lpur
    GROUP BY lpur.location_project_id;
  `)
  await grant(context.sequelize, MEMBER_USAGE_VIEW, [GrantPermission.SELECT], DatabaseUser.API)

  await context.sequelize.query(`
    COMMENT ON VIEW "${MEMBER_USAGE_VIEW}" IS 'Per-project collaborator and guest counts derived from location_project_user_role. Recording-minute and job usage stay in legacy.';
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`DROP VIEW IF EXISTS "${MEMBER_USAGE_VIEW}";`)
}
