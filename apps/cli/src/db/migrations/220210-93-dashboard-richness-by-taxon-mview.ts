/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

const VIEW_NAME = 'dashboard_richness_by_taxon'
// const INDEX_COLS = ['location_project_id', 'count']

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    create view ${VIEW_NAME} as
    SELECT sip.location_project_id,
           sip.taxon_class_id,
           COUNT(1) AS count
    FROM species_in_project sip
    GROUP BY sip.location_project_id, sip.taxon_class_id
    ORDER BY sip.location_project_id, sip.taxon_class_id ASC
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
