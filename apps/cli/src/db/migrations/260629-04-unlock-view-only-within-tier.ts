import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

/**
 * Tier reframe (2026-06-29) follow-up: clear the legacy `is_locked` (view-only)
 * flag for projects that should not be view-only under the new free/pro model.
 *
 * Under the reframe, view-only should NOT apply to:
 *   - premium projects (any pro user's projects are premium);
 *   - projects owned by a pro user;
 *   - free projects that are "fairly within the free tier" (<= 526,000 recording
 *     minutes AND <= 3 collaborators).
 *
 * It SHOULD remain only on free projects that genuinely exceed a free limit
 * (> 526k recording minutes OR > 3 collaborators) — those stay view-only until
 * the owner reduces usage or upgrades to Pro.
 *
 * Cross-DB note: recording-minute usage lives in the legacy arbimon2 MySQL DB,
 * not here in Bio Postgres, so this migration cannot compute it live. The set of
 * locked free projects that exceed 526k recordings was computed against live on
 * 2026-06-29 and is baked in as OVER_RECORDING_LIMIT_ARBIMON_IDS (by
 * location_project.id_arbimon). The collaborator axis IS available here via
 * location_project_member_quota_usage. This is a one-shot data correction, so a
 * point-in-time snapshot of the recording-over-limit set is correct.
 *
 * Idempotent: only flips is_locked TRUE->FALSE for the qualifying set; re-running
 * is a no-op once applied. Down is intentionally a no-op (we do not re-lock —
 * the lock state was a legacy-model artifact).
 */

// Locked FREE projects that exceeded 526,000 recordings as of 2026-06-29 (live).
// These remain view-only (over the free recording limit). By location_project.id_arbimon.
const OVER_RECORDING_LIMIT_ARBIMON_IDS = [
  1213, 1873, 1992, 2470, 2572, 2780, 2939, 3000, 3152, 3165, 3219, 3220, 3221,
  3278, 3323, 3327, 3709, 3772, 3827, 3961, 3981, 3995, 3999, 4017, 4113, 4317,
  4328, 4516, 4699, 4845, 5086, 5087, 5531, 5635, 5653, 5901, 6446, 6461, 6543,
  6690, 6937, 7199, 7399, 7405, 7417, 7445, 7638, 7668, 7740, 7761, 7851, 7852,
  7853, 8001, 8198, 8360, 8465, 8626, 8633, 8659, 8729, 8869, 8898, 8907
]

const FREE_COLLABORATOR_LIMIT = 3

export const up: MigrationFn<QueryInterface> = async ({ context }) => {
  const overIds = OVER_RECORDING_LIMIT_ARBIMON_IDS.join(',')

  // Unlock everything currently view-only EXCEPT free projects that exceed a
  // free limit (recordings snapshot OR > 3 collaborators).
  await context.sequelize.query(`
    UPDATE location_project lp
    SET is_locked = FALSE, updated_at = CURRENT_TIMESTAMP
    FROM (
      SELECT lp2.id,
             COALESCE(lp2.project_type, 'free') AS project_type,
             COALESCE(q.collaborator_count, 0) AS collaborator_count
      FROM location_project lp2
      LEFT JOIN location_project_member_quota_usage q
        ON q.location_project_id = lp2.id
      WHERE COALESCE(lp2.is_locked, FALSE) = TRUE
        AND lp2.deleted_at IS NULL
    ) src
    WHERE lp.id = src.id
      AND NOT (
        -- the ONLY projects that stay locked: free + over a free limit
        src.project_type = 'free'
        AND (
          src.collaborator_count > ${FREE_COLLABORATOR_LIMIT}
          OR lp.id_arbimon IN (${overIds})
        )
      );
  `)
}

export const down: MigrationFn<QueryInterface> = async () => {
  // No-op: is_locked was a legacy-model artifact; we do not restore it.
}
