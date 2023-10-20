/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const MATERIALIZED_VIEW_NAME = 'location_project_detection_metric'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`
    CREATE MATERIALIZED VIEW ${MATERIALIZED_VIEW_NAME} AS
      SELECT
        location_project_id,
        sum(count) detection_minutes_count,
        count(distinct taxon_species_id) species_count,
        min(time_precision_hour_local) min_date,
        max(time_precision_hour_local) max_date
      FROM
        detection_by_site_species_hour
      GROUP BY
        location_project_id;`)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`DROP MATERIALIZED VIEW IF EXISTS ${MATERIALIZED_VIEW_NAME}`)
}
