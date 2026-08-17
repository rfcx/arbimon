import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

/**
 * Add UNIQUE indexes to the materialized views so they can be refreshed with
 * `REFRESH MATERIALIZED VIEW CONCURRENTLY`.
 *
 * WHY: a plain (non-concurrent) `REFRESH MATERIALIZED VIEW` takes an
 * ACCESS EXCLUSIVE lock on the view for the whole rebuild. Every reader needs
 * an ACCESS SHARE lock, and those two conflict — so all reads block until the
 * refresh finishes.
 *
 * `refreshMviews()` runs at the end of the every-5-minutes incremental-sync
 * job. On 2026-08-17 that produced a user-visible outage on production: project
 * lists, search and dashboards hung for 30-100+s at a time, because the API
 * reads the view `location_project_metric`, which LEFT JOINs BOTH metric
 * mviews. Observed live: three listing queries waiting 49/83/97s behind one
 * `REFRESH MATERIALIZED VIEW location_project_recording_metric`, and
 * `GET /api/projects/<id>/filters` timing out after 45s with no response.
 *
 * Refresh is expensive because these views re-aggregate large sources:
 *   - location_project_recording_metric <- recording_by_site_hour (~18.2M rows,
 *     4.7GB): seq scan + a 17.98M-row sort that spills to disk (BufFileWrite).
 *   - location_project_detection_metric <- detection_by_site_species_hour, a
 *     TimescaleDB hypertable with 1077 chunks (measured: 200s to refresh,
 *     despite only 144kB of output — output size is NOT a proxy for cost).
 *
 * `CONCURRENTLY` takes an EXCLUSIVE lock instead of ACCESS EXCLUSIVE, which
 * does NOT conflict with the readers' ACCESS SHARE, so lists keep serving while
 * the view rebuilds. Postgres requires a UNIQUE index with no WHERE clause on
 * the mview for this — which is what this migration creates.
 *
 * Key choice: every one of these views is `GROUP BY location_project_id`, so
 * that column is unique by construction. Verified against production data
 * before writing this migration:
 *   location_project_recording_metric  3793 rows / 3793 distinct
 *   location_project_detection_metric  1634 rows / 1634 distinct
 *   location_project_country           4756 rows / 4756 distinct
 * (These mviews previously carried NO indexes at all.)
 *
 * NOTE: building the index is itself a blocking operation on the mview, but it
 * is a one-off and these views are small (144-368kB).
 */

interface MviewIndex { view: string, index: string, column: string }

const MVIEW_INDEXES: MviewIndex[] = [
  { view: 'location_project_recording_metric', index: 'location_project_recording_metric_pkey', column: 'location_project_id' },
  { view: 'location_project_detection_metric', index: 'location_project_detection_metric_pkey', column: 'location_project_id' },
  { view: 'location_project_country', index: 'location_project_country_pkey', column: 'location_project_id' }
]

export const up: MigrationFn<QueryInterface> = async ({ context }): Promise<void> => {
  for (const { view, index, column } of MVIEW_INDEXES) {
    // Guarded so this is safe on a fresh/seeded database where a view may not
    // exist yet, and idempotent on re-run.
    await context.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = '${view}') THEN
          CREATE UNIQUE INDEX IF NOT EXISTS ${index} ON public.${view} (${column});
        END IF;
      END $$;
    `)
  }
}

export const down: MigrationFn<QueryInterface> = async ({ context }): Promise<void> => {
  for (const { index } of MVIEW_INDEXES) {
    await context.sequelize.query(`DROP INDEX IF EXISTS public.${index};`)
  }
}
