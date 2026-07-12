import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

/**
 * Tier rollback (2026-07-12, operator-directed): remove ALL user-tier /
 * pricing-based limitations for normal usage of Arbimon.
 *
 * Runbook: rfcx-local `runbooks/AUDIT-arbimon-tier-limitations-rollback-plan-2026-07-12.md`
 * (OPEN-ITEMS #51, operator decisions D1..D6 answered 2026-07-12).
 *
 * The tier MECHANISM stays in place (tables, columns, guards, super endpoints)
 * but every limit becomes NULL (= unlimited) and every view-only lock is
 * cleared. All server-side guards (bio-api assert*, legacy
 * assertJobRecordingLimit, ingest-service upload quota) no-op on NULL limits,
 * so this single migration restores pre-tiering behavior server-wide.
 *
 * 1. project_type_limit: all limit columns -> NULL for every project type.
 *    (Pre-change live values 2026-07-12: free = 526000 rec-"minutes" / 3
 *    collaborators / 300000 recs-per-job; premium = 20 collaborators; rest
 *    already NULL. NOTE: the free job_recording_limit had already been raised
 *    12000 -> 300000 by a direct-SQL change on 2026-07-02.)
 * 2. account_tier_project_limit: all active_project_limit -> NULL (including
 *    free->premium which was 0; operator D2).
 * 3. location_project.is_locked: FALSE everywhere (operator D5 confirmed the
 *    two projects locked 2026-07-08 should unlock too). Pre-change: 255 rows
 *    (214 live free, 23 deleted free, 18 deleted premium).
 *
 * Idempotent: re-running is a no-op. Down restores the captured 2026-07-12
 * limit values but does NOT re-lock projects (lock state was a legacy-model
 * artifact; the authoritative pre-change lock list lives in the runbook).
 */

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  await context.sequelize.query(`
    UPDATE project_type_limit
    SET recording_minutes_limit = NULL,
        collaborator_limit = NULL,
        guest_limit = NULL,
        analyze_job_limit = NULL,
        job_recording_limit = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE recording_minutes_limit IS NOT NULL
       OR collaborator_limit IS NOT NULL
       OR guest_limit IS NOT NULL
       OR analyze_job_limit IS NOT NULL
       OR job_recording_limit IS NOT NULL;
  `)

  await context.sequelize.query(`
    UPDATE account_tier_project_limit
    SET active_project_limit = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE active_project_limit IS NOT NULL;
  `)

  await context.sequelize.query(`
    UPDATE location_project
    SET is_locked = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE is_locked = TRUE;
  `)
}

export const down: MigrationFn<QueryInterface> = async ({ context }) => {
  // Restore the last live limit values (captured 2026-07-12 pre-migration).
  // Does NOT re-lock any project.
  await context.sequelize.query(`
    UPDATE project_type_limit
    SET recording_minutes_limit = 526000,
        collaborator_limit = 3,
        job_recording_limit = 300000,
        updated_at = CURRENT_TIMESTAMP
    WHERE project_type = 'free';
  `)
  await context.sequelize.query(`
    UPDATE project_type_limit
    SET collaborator_limit = 20,
        updated_at = CURRENT_TIMESTAMP
    WHERE project_type = 'premium';
  `)
  await context.sequelize.query(`
    UPDATE account_tier_project_limit
    SET active_project_limit = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE account_tier = 'free' AND project_type IN ('premium', 'unlimited');
  `)
  await context.sequelize.query(`
    UPDATE account_tier_project_limit
    SET active_project_limit = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE account_tier = 'pro' AND project_type = 'unlimited';
  `)
}
