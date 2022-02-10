/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'dashboard_species_highlighted'
const INDEX_COLS = ['location_project_id', 'highlighted_order']

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    create materialized view ${VIEW_NAME} as
    SELECT ps.location_project_id,
           ps.highlighted_order,
           sip.scientific_name,
           sip.common_name,
           sip.risk_rating_iucn_id,
           sip.photo_url
    FROM species_in_project sip
            INNER JOIN location_project_species ps on sip.taxon_species_id = ps.taxon_species_id
    WHERE ps.highlighted_order IS NOT NULL
    ;
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
