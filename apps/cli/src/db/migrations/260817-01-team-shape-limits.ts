import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const MEMBER_USAGE_VIEW = 'location_project_member_quota_usage'

/**
 * Team-shape limits (2026-08-17, operator-directed — align enforcement with
 * the /pricing page Team row):
 *
 * Free project = 1 Primary Admin + up to `collaborator_limit` non-guest
 * collaborators, of which at most `admin_limit` may hold the Admin role,
 * plus unlimited guests. Premium/unlimited projects — and any project whose
 * Primary Admin is a Pro user — have NO team limits (the exemption is
 * computed in bio-api, not stored here).
 *
 * 1. project_type_limit gains `admin_limit` (nullable = unlimited), the same
 *    tunable-without-rebuild pattern as the other limit columns: bio-api
 *    reads this table per request, so operators change numbers with an
 *    UPDATE, never a deploy.
 * 2. The member-usage view gains `admin_count` (role_id = 1). Counts remain
 *    derived — no denormalized state.
 * 3. Arm the free tier per the pricing page: 5 collaborators / 1 admin.
 *    Guests stay NULL (unlimited). Premium + unlimited stay all-NULL.
 * 4. recording_minutes_limit is pinned NULL for ALL tiers (product decision
 *    2026-08-17: "Unlimited audio uploads" on every tier — see the pricing
 *    page Recordings row). The column stays for display/history but must not
 *    be re-armed; bio-api's upload-limit path no longer consumes it.
 *
 * Grandfathering: guards are add/promote-time only. Projects already over a
 * limit (79 free projects >5 collaborators, 237 free projects >1 Admin at
 * migration time) keep every existing member; they just cannot add more of
 * the capped kind while over.
 *
 * Idempotent: ADD COLUMN IF NOT EXISTS + CREATE OR REPLACE VIEW + keyed
 * UPDATEs. Down restores the previous view shape and NULLs the armed values.
 */
export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    ALTER TABLE project_type_limit
    ADD COLUMN IF NOT EXISTS admin_limit INTEGER;
  `)

  await context.sequelize.query(`
    COMMENT ON COLUMN project_type_limit.admin_limit IS 'Max members holding the Admin role (role_id 1). NULL = unlimited. Add/promote-time only — existing members are never removed.';
  `)

  await context.sequelize.query(`
    CREATE OR REPLACE VIEW "${MEMBER_USAGE_VIEW}" AS
    SELECT
      lpur.location_project_id,
      COUNT(*) FILTER (WHERE lpur.role_id = 3) AS guest_count,
      COUNT(*) FILTER (WHERE lpur.role_id NOT IN (3, 4)) AS collaborator_count,
      COUNT(*) FILTER (WHERE lpur.role_id = 1) AS admin_count
    FROM location_project_user_role lpur
    GROUP BY lpur.location_project_id;
  `)
  await grant(context.sequelize, MEMBER_USAGE_VIEW, [GrantPermission.SELECT], DatabaseUser.API)

  // Arm the free tier per the pricing page (Team row). Premium/unlimited stay
  // NULL. recording_minutes stays NULL everywhere (unlimited audio uploads).
  await context.sequelize.query(`
    UPDATE project_type_limit
    SET collaborator_limit = 5,
        admin_limit = 1,
        recording_minutes_limit = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE project_type = 'free';
  `)
  await context.sequelize.query(`
    UPDATE project_type_limit
    SET admin_limit = NULL,
        recording_minutes_limit = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE project_type IN ('premium', 'unlimited');
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
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
    UPDATE project_type_limit
    SET collaborator_limit = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE project_type = 'free';
  `)
  await context.sequelize.query(`
    ALTER TABLE project_type_limit DROP COLUMN IF EXISTS admin_limit;
  `)
}
