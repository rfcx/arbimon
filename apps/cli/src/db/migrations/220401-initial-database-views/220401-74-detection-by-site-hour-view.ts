/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'detection_by_site_hour'
// const INDEX_COLS = ['location_project_id', 'location_site_id', 'time_precision_hour_local']

export const up: MigrationFn<QueryInterface> = async ({ context: { createTable, sequelize } }): Promise<void> => {
  // await sequelize.query(
  //   `
  //   create view ${VIEW_NAME} as
  //   SELECT d.location_project_id,
  //          d.location_site_id,
  //          d.time_precision_hour_local,
  //          sum(d.count) as count,
  //          max(d.duration_minutes) as duration_minutes
  //   FROM detection_by_site_species_hour d
  //   GROUP BY d.location_project_id,
  //            d.location_site_id,
  //            d.time_precision_hour_local
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
