/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'dashboard_richness_by_taxon'
// const INDEX_COLS = ['location_project_id', 'count']

export const up: MigrationFn<QueryInterface> = async ({ context: { createTable, sequelize } }): Promise<void> => {
  // await sequelize.query(
  //   `
  //   create view ${VIEW_NAME} as
  //   SELECT sip.location_project_id,
  //          sip.taxon_class_id,
  //          COUNT(1) AS count
  //   FROM species_in_project sip
  //   GROUP BY sip.location_project_id, sip.taxon_class_id
  //   ORDER BY sip.location_project_id, sip.taxon_class_id ASC
  //   ;
  //   `
  // )

  // for (const indexCol of INDEX_COLS) {
  //   await sequelize.query(
  //     `CREATE INDEX ${VIEW_NAME}_${indexCol}_idx ON ${VIEW_NAME} USING btree (${indexCol});`
  //   )
  // }
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
