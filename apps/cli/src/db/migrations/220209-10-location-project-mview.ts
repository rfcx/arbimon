/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'location_project_metric'
const INDEX_COLS = ['location_project_id']

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    create materialized view ${VIEW_NAME} as
    SELECT d.location_project_id,
          Count(1) AS detection_count,
          Count(distinct d.location_site_id) as site_count,
          Count(distinct d.taxon_species_id) as species_count,
          Count(distinct
              CASE WHEN s.extinction_risk_rating IN ('CR', 'EN', 'VU') THEN d.taxon_species_id END
          ) as species_threatened_count
    FROM detection_by_site_species_hour d
    INNER JOIN taxon_species s ON d.taxon_species_id = s.id
    GROUP BY d.location_project_id
    ;
    `
  )

  for (const indexCol of INDEX_COLS) {
    await params.context.sequelize.query(
      `CREATE INDEX ${VIEW_NAME}_${indexCol}_idx ON ${VIEW_NAME}(${indexCol});`
    )
  }
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
