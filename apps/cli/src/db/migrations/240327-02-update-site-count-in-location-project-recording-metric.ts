import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const MATERIALIZED_VIEW_NAME_RECORDING = 'location_project_recording_metric'
const MATERIALIZED_VIEW_NAME_DETECTION = 'location_project_detection_metric'
const VIEW_NAME = 'location_project_metric'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME}`)
  await params.context.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS ${MATERIALIZED_VIEW_NAME_RECORDING}`)
  await params.context.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS ${MATERIALIZED_VIEW_NAME_DETECTION}`)

  await params.context.sequelize.query(`
    CREATE MATERIALIZED VIEW ${MATERIALIZED_VIEW_NAME_RECORDING} AS
      SELECT
        rbsh.location_project_id,
        sum(rbsh.count) AS recording_minutes_count,
        count(distinct rbsh.location_site_id) AS site_count,
        min(rbsh.time_precision_hour_local) AS min_date,
        max(rbsh.time_precision_hour_local) AS max_date
      FROM recording_by_site_hour rbsh
        INNER JOIN location_site ls ON rbsh.location_site_id = ls.id
        WHERE ls.hidden = false AND ls.latitude IS NOT NULL
        GROUP BY rbsh.location_project_id
  `)
  await grant(params.context.sequelize, MATERIALIZED_VIEW_NAME_RECORDING, [GrantPermission.SELECT], DatabaseUser.API)

  await params.context.sequelize.query(`
    CREATE MATERIALIZED VIEW ${MATERIALIZED_VIEW_NAME_DETECTION} AS
      SELECT
        dbssh.location_project_id,
        sum(dbssh.count) as detection_minutes_count,
        count(distinct dbssh.taxon_species_id) AS species_count,
        min(dbssh.time_precision_hour_local) AS min_date,
        max(dbssh.time_precision_hour_local) AS max_date
      FROM detection_by_site_species_hour dbssh
        INNER JOIN location_site ls ON dbssh.location_site_id = ls.id
        WHERE ls.hidden = false AND ls.latitude IS NOT NULL
        GROUP BY dbssh.location_project_id
  `)
  await grant(params.context.sequelize, MATERIALIZED_VIEW_NAME_DETECTION, [GrantPermission.SELECT], DatabaseUser.API)

  // INFO: Taken from `./231212-01-add-site-count-to-location-project-recording-metric.ts` (latest reference to the view)
  await params.context.sequelize.query(`
    CREATE VIEW ${VIEW_NAME} AS
      SELECT
        p.id location_project_id,
        coalesce(dm.species_count, 0)::int species_count,
        coalesce(rm.site_count, 0)::int site_count,
        coalesce(rm.recording_minutes_count, 0)::int recording_minutes_count,
        coalesce(dm.detection_minutes_count, 0)::int detection_minutes_count,
        least(dm.min_date, rm.min_date) min_date,
        greatest(dm.max_date, rm.max_date) max_date,
        rm.min_date recording_min_date,
        rm.max_date recording_max_date,
        dm.min_date detection_min_date,
        dm.max_date detection_max_date
      FROM location_project p
        LEFT JOIN ${MATERIALIZED_VIEW_NAME_RECORDING} rm ON p.id = rm.location_project_id
        LEFT JOIN ${MATERIALIZED_VIEW_NAME_DETECTION} dm ON p.id = dm.location_project_id
  `)
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}
