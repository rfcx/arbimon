/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'dashboard_species_highlighted'
// const INDEX_COLS = ['location_project_id', 'highlighted_order']

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    CREATE VIEW ${VIEW_NAME} AS
    SELECT ps.location_project_id,
           ps.highlighted_order,
           sip.taxon_class_slug,
           sip.taxon_species_slug,
           sip.scientific_name,
           sip.common_name,
           sip.risk_rating_id,
           sip.photo_url
    FROM species_in_project sip
            INNER JOIN location_project_species ps ON sip.taxon_species_id = ps.taxon_species_id AND sip.location_project_id = ps.location_project_id
    WHERE ps.highlighted_order IS NOT NULL
    ;
    `
  )

  // for (const indexCol of INDEX_COLS) {
  //   await params.context.sequelize.query(
  //     `CREATE INDEX ${VIEW_NAME}_${indexCol}_idx ON ${VIEW_NAME} USING btree (${indexCol});`
  //   )
  // }
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
