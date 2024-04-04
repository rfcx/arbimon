import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const MATERIALIZED_VIEW_NAME_RECORDING = 'location_project_recording_metric'
const MATERIALIZED_VIEW_NAME_DETECTION = 'location_project_detection_metric'
const VIEW_NAME = 'location_project_metric'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`
    DROP VIEW IF EXISTS ${VIEW_NAME};
    DROP MATERIALIZED VIEW IF EXISTS ${MATERIALIZED_VIEW_NAME_RECORDING};
    DROP MATERIALIZED VIEW IF EXISTS ${MATERIALIZED_VIEW_NAME_DETECTION};
  `)

  await params.context.sequelize.query(`
    CREATE MATERIALIZED VIEW ${MATERIALIZED_VIEW_NAME_RECORDING} AS
      SELECT
        recording_by_site_hour.location_project_id,
        sum(recording_by_site_hour.count) AS recording_minutes_count,
        count(distinct recording_by_site_hour.location_site_id) AS site_count,
        min(recording_by_site_hour.time_precision_hour_local) AS min_date,
        max(recording_by_site_hour.time_precision_hour_local) AS max_date
      FROM recording_by_site_hour
        INNER JOIN location_site ON recording_by_site_hour.location_site_id = location_site.id
        WHERE location_site.hidden = false
        GROUP BY recording_by_site_hour.location_project_id;
  `)
  await grant(params.context.sequelize, MATERIALIZED_VIEW_NAME_RECORDING, [GrantPermission.SELECT], DatabaseUser.API)

  await params.context.sequelize.query(`
    CREATE MATERIALIZED VIEW ${MATERIALIZED_VIEW_NAME_DETECTION} AS
      SELECT
        detection_by_site_species_hour.location_project_id,
        sum(detection_by_site_species_hour.count) as detection_minutes_count,
        count(distinct detection_by_site_species_hour.taxon_species_id) AS species_count,
        min(detection_by_site_species_hour.time_precision_hour_local) AS min_date,
        max(detection_by_site_species_hour.time_precision_hour_local) AS max_date
      FROM detection_by_site_species_hour
        INNER JOIN location_site ON detection_by_site_species_hour.location_site_id = location_site.id
        WHERE location_site.hidden = false
        GROUP BY detection_by_site_species_hour.location_project_id;
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
        LEFT JOIN ${MATERIALIZED_VIEW_NAME_DETECTION} dm ON p.id = dm.location_project_id;
  `)
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}
