/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const VIEW_NAME = 'location_project_metric'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME}`)

  await params.context.sequelize.query(
    `
      CREATE VIEW ${VIEW_NAME} AS
      SELECT d.location_project_id,
            SUM(d.count)                       AS detection_minutes_count,
            COUNT(distinct d.taxon_species_id) AS species_count,
            MAX(d.time_precision_hour_local)   AS max_date,
            MIN(d.time_precision_hour_local)   AS min_date
      FROM detection_by_site_species_hour d
      GROUP BY d.location_project_id
    `
  )
}

// Old migrate logic from `220210-91-location-project-metric-mview`
export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME}`)

  await params.context.sequelize.query(
    `
      CREATE VIEW ${VIEW_NAME} AS
      SELECT d.location_project_id,
            SUM(d.count)                       AS detection_minutes_count,
            COUNT(distinct d.location_site_id) AS site_count,
            COUNT(distinct d.taxon_species_id) AS species_count,
            MAX(d.time_precision_hour_local)   AS max_date,
            MIN(d.time_precision_hour_local)   AS min_date
      FROM detection_by_site_species_hour d
      GROUP BY d.location_project_id
    ;
    `
  )
}
