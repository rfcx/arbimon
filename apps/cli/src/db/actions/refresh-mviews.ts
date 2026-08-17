import { type Sequelize, QueryTypes } from 'sequelize'

interface MviewInfo { view_name: string, is_populated: boolean, has_unique_index: boolean }

/**
 * Refresh all materialized views.
 *
 * Uses `REFRESH MATERIALIZED VIEW CONCURRENTLY` wherever Postgres allows it,
 * because a plain refresh takes an ACCESS EXCLUSIVE lock for the entire rebuild
 * and therefore blocks every reader of the view. The API reads
 * `location_project_metric`, which LEFT JOINs both metric mviews, so a plain
 * refresh stalls project lists, search and dashboards — on 2026-08-17 this
 * caused a production incident with listing queries blocked 49-97s and
 * `/api/projects/:id/filters` timing out after 45s.
 *
 * CONCURRENTLY takes an EXCLUSIVE lock instead, which does not conflict with
 * the readers' ACCESS SHARE lock, so lists keep serving during the rebuild.
 *
 * Postgres only permits CONCURRENTLY when the view is already POPULATED and has
 * a UNIQUE index with no WHERE clause (see migration
 * `260817-02-mview-unique-indexes-for-concurrent-refresh`). Both conditions are
 * checked per-view at runtime and we fall back to a plain refresh when they are
 * not met — this keeps the first-run paths correct, where the view has just
 * been created `WITH NO DATA` or the migration has not been applied yet:
 *   - `db/seed.ts`      (fresh database)
 *   - `ingest/daily.ts`
 *   - `ingest/incrementally.ts`
 *   - `ingest/refresh-mviews.ts`
 */
export const refreshMviews = async (sequelize: Sequelize): Promise<void> => {
  // Prioritize views that have dependencies
  const mvsWithDependencies: string[] = [
    // 'species_in_project' // TODO: make `species_in_project` a mview
  ]

  // Get every mview together with the two properties that decide whether it can
  // be refreshed concurrently.
  const mvInfos = await sequelize.query<MviewInfo>(`
    SELECT
      mv.matviewname AS view_name,
      mv.ispopulated AS is_populated,
      EXISTS (
        SELECT 1
        FROM pg_index i
        JOIN pg_class c ON c.oid = i.indexrelid
        WHERE i.indrelid = (quote_ident(mv.schemaname) || '.' || quote_ident(mv.matviewname))::regclass
          AND i.indisunique
          AND i.indpred IS NULL
      ) AS has_unique_index
    FROM pg_matviews mv
    WHERE mv.schemaname = 'public'
  `, { type: QueryTypes.SELECT })

  const infoByName = new Map(mvInfos.map(info => [info.view_name, info]))
  const mvsAll = mvInfos.map(info => info.view_name)

  // Merge
  const mvsOrdered = [
    ...mvsWithDependencies.filter(mv => mvsAll.includes(mv)), // only if they exist
    ...mvsAll.filter(mv => !mvsWithDependencies.includes(mv)) // only if they aren't listed above
  ]

  // Refresh in order
  console.info('Refreshing materialized views:')
  for (const view of mvsOrdered) {
    const info = infoByName.get(view)
    // Both flags must be known-true; a missing `info` (view vanished between the
    // catalogue read and now) falls back to the safe blocking refresh.
    const canRefreshConcurrently = (info?.is_populated ?? false) && (info?.has_unique_index ?? false)

    if (canRefreshConcurrently) {
      console.info(`- public.${view} (concurrently)`)
      await sequelize.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`)
    } else {
      // Blocking refresh: readers of this view stall until it completes.
      const reason = (info?.is_populated ?? false) ? 'no unique index' : 'not populated'
      console.info(`- public.${view} (blocking refresh: ${reason})`)
      await sequelize.query(`REFRESH MATERIALIZED VIEW ${view}`)
    }
  }
}
