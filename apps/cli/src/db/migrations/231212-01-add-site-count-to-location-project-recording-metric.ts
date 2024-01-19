import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const MATERIALIZED_VIEW_NAME = 'location_project_recording_metric'
const VIEW_NAME = 'location_project_metric'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`
    DROP VIEW IF EXISTS ${VIEW_NAME};
    DROP MATERIALIZED VIEW IF EXISTS ${MATERIALIZED_VIEW_NAME};
  `)

  await params.context.sequelize.query(`
    CREATE MATERIALIZED VIEW ${MATERIALIZED_VIEW_NAME} AS
      SELECT
        location_project_id,
        sum(count) AS recording_minutes_count,
        count(distinct location_site_id) AS site_count,
        min(time_precision_hour_local) AS min_date,
        max(time_precision_hour_local) AS max_date
      FROM recording_by_site_hour
      GROUP BY location_project_id;
  `)
  await grant(params.context.sequelize, MATERIALIZED_VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)

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
        LEFT JOIN ${MATERIALIZED_VIEW_NAME} rm ON p.id = rm.location_project_id
        LEFT JOIN location_project_detection_metric dm ON p.id = dm.location_project_id;
  `)
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`
    DROP VIEW IF EXISTS ${VIEW_NAME};
    DROP MATERIALIZED VIEW IF EXISTS ${MATERIALIZED_VIEW_NAME};
  `)

  await params.context.sequelize.query(`
    CREATE MATERIALIZED VIEW ${MATERIALIZED_VIEW_NAME} AS
      SELECT
        location_project_id,
        sum(count) AS recording_minutes_count,
        min(time_precision_hour_local) AS min_date,
        max(time_precision_hour_local) AS max_date
      FROM
        recording_by_site_hour
      GROUP BY
        location_project_id;
  `)
  await grant(params.context.sequelize, MATERIALIZED_VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)

  await params.context.sequelize.query(`
    CREATE VIEW ${VIEW_NAME} AS
      SELECT 
        rm.location_project_id,
        dm.species_count,
        rm.recording_minutes_count,
        dm.detection_minutes_count,
        least(dm.min_date, rm.min_date) min_date,
        greatest(dm.max_date, rm.max_date) max_date,
        rm.min_date as recording_min_date,
        rm.max_date as recording_max_date,
        dm.min_date as detection_min_date,
        dm.max_date as detection_max_date
      FROM ${MATERIALIZED_VIEW_NAME} rm
        INNER JOIN location_project_detection_metric dm ON rm.location_project_id = dm.location_project_id;
  `)
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}
