/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'species_in_project'
const INDEX_COLS = ['location_project_id', 'taxon_class_id', 'taxon_species_id']

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    create materialized view ${VIEW_NAME} as
    SELECT d.location_project_id, ts.taxon_class_id, ts.id AS taxon_species_id, ts.scientific_name, ts.common_name, ts.extinction_risk_rating, ts.photo_url
    FROM detection_by_site_species_hour d
    INNER JOIN taxon_species ts ON d.taxon_species_id = ts.id
    GROUP BY d.location_project_id, ts.id;
    `
  )

  for (const indexCol of INDEX_COLS) {
    await params.context.sequelize.query(
      `CREATE INDEX ${VIEW_NAME}_${indexCol}_idx ON ${VIEW_NAME} USING btree (${indexCol});`
    )
  }
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
