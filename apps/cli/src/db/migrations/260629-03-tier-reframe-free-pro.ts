import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

/**
 * Tier reframe (2026-06-29): two account tiers (free, pro), two project types
 * (free, premium). Project-level limits become the primary control surface.
 *
 * - free project:    526,000 recording minutes, 3 collaborators, unlimited
 *                    guests + jobs, max 12,000 recordings per analysis job.
 * - premium project: unlimited minutes, 20 collaborators, unlimited guests,
 *                    jobs, and recordings-per-job.
 *
 * account_tier => project_type coupling: a Pro user's owned projects are
 * premium; a Free user's owned projects are free. The `enterprise` account tier
 * and the `unlimited` project type are retired (folded into pro / premium). The
 * enum VALUES are left physically present (Postgres can't DROP a value without a
 * column rewrite) but are no longer referenced by code/config/UI.
 *
 * NOTE: this migration is idempotent (safe to re-run): DDL uses IF NOT EXISTS,
 * config uses INSERT ... ON CONFLICT DO UPDATE, and the data steps are
 * convergent UPDATEs.
 */

const PROJECT_TYPE_LIMIT_TABLE = 'project_type_limit'
const ACCOUNT_TIER_PROJECT_LIMIT_TABLE = 'account_tier_project_limit'

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  // 1. New per-job recording cap column on project_type_limit.
  await context.sequelize.query(`
    ALTER TABLE "${PROJECT_TYPE_LIMIT_TABLE}"
      ADD COLUMN IF NOT EXISTS job_recording_limit INTEGER;
  `)
  await context.sequelize.query(`
    COMMENT ON COLUMN "${PROJECT_TYPE_LIMIT_TABLE}".job_recording_limit IS 'Max number of recordings (playlist size) a single analysis job may run on. NULL = uncapped.';
  `)

  // 2. Reseed project-type limits to the new model.
  //    free:    minutes 526000, collaborators 3, guests/jobs unlimited, job recordings 12000
  //    premium: minutes/jobs/guests unlimited, collaborators 20, job recordings unlimited
  //    unlimited (retired): keep a fully-unlimited row so any not-yet-migrated
  //    'unlimited' project keeps working until folded to premium.
  await context.sequelize.query(`
    INSERT INTO "${PROJECT_TYPE_LIMIT_TABLE}"
      (project_type, recording_minutes_limit, collaborator_limit, guest_limit, analyze_job_limit, job_recording_limit)
    VALUES
      ('free',      526000,  3,    NULL, NULL, 12000),
      ('premium',   NULL,    20,   NULL, NULL, NULL),
      ('unlimited', NULL,    NULL, NULL, NULL, NULL)
    ON CONFLICT (project_type) DO UPDATE SET
      recording_minutes_limit = EXCLUDED.recording_minutes_limit,
      collaborator_limit = EXCLUDED.collaborator_limit,
      guest_limit = EXCLUDED.guest_limit,
      analyze_job_limit = EXCLUDED.analyze_job_limit,
      job_recording_limit = EXCLUDED.job_recording_limit,
      updated_at = CURRENT_TIMESTAMP;
  `)

  // 3. Reconcile the account-tier portfolio matrix to free/pro only.
  //    The matrix MECHANISM is kept (operator may impose project-COUNT caps
  //    later) but no count cap is enforced now: NULL = unlimited. free->premium
  //    stays 0 so a free user cannot self-own a premium project. enterprise rows
  //    removed.
  await context.sequelize.query(`
    DELETE FROM "${ACCOUNT_TIER_PROJECT_LIMIT_TABLE}" WHERE account_tier = 'enterprise';
  `)
  await context.sequelize.query(`
    INSERT INTO "${ACCOUNT_TIER_PROJECT_LIMIT_TABLE}"
      (account_tier, project_type, active_project_limit)
    VALUES
      ('free', 'free',      NULL),
      ('free', 'premium',   0),
      ('free', 'unlimited', 0),
      ('pro',  'free',      NULL),
      ('pro',  'premium',   NULL),
      ('pro',  'unlimited', 0)
    ON CONFLICT (account_tier, project_type) DO UPDATE SET
      active_project_limit = EXCLUDED.active_project_limit,
      updated_at = CURRENT_TIMESTAMP;
  `)

  // 4. Data: migrate enterprise users -> pro.
  await context.sequelize.query(`
    UPDATE user_profile
    SET account_tier = 'pro', account_tier_updated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE account_tier = 'enterprise';
  `)

  // 5. Data: fold 'unlimited' projects -> 'premium'.
  await context.sequelize.query(`
    UPDATE location_project
    SET project_type = 'premium', updated_at = CURRENT_TIMESTAMP
    WHERE project_type = 'unlimited';
  `)

  // 6. Data: enforce the coupling for existing pro users -> all their owned
  //    (primary-admin / owner role) projects become premium.
  await context.sequelize.query(`
    UPDATE location_project lp
    SET project_type = 'premium', updated_at = CURRENT_TIMESTAMP
    FROM location_project_user_role lpur
    INNER JOIN user_profile up ON up.id = lpur.user_id
    WHERE lpur.location_project_id = lp.id
      AND lpur.role_id = 4
      AND up.account_tier = 'pro'
      AND COALESCE(lp.project_type, 'free') <> 'premium';
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  // Restore the original (2026-05-19) limit config + matrix. Data conversions
  // (enterprise->pro, unlimited->premium, pro-owned->premium) are NOT reversed:
  // the source labels are ambiguous after the fact. Schema/config revert only.
  await context.sequelize.query(`
    INSERT INTO "${PROJECT_TYPE_LIMIT_TABLE}"
      (project_type, recording_minutes_limit, collaborator_limit, guest_limit, analyze_job_limit)
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
    INSERT INTO "${ACCOUNT_TIER_PROJECT_LIMIT_TABLE}"
      (account_tier, project_type, active_project_limit)
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
    ALTER TABLE "${PROJECT_TYPE_LIMIT_TABLE}"
      DROP COLUMN IF EXISTS job_recording_limit;
  `)
}
