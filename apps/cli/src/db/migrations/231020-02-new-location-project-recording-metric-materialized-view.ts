/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const MATERIALIZED_VIEW_NAME = 'location_project_recording_metric'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
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
        location_project_id;`)
  await grant(params.context.sequelize, MATERIALIZED_VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS ${MATERIALIZED_VIEW_NAME}`)
}
