/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'detection_metric'
// const INDEX_COLS = ['location_project_id']

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  // await params.context.sequelize.query(
  //   `
  //   create view ${VIEW_NAME} AS
  //   SELECT d.location_project_id,
  //          Sum(d.count)                       AS detection_count,
  //          Count(distinct d.location_site_id) AS site_count,
  //          Count(distinct d.taxon_species_id) AS species_count,
  //          Max(d.time_precision_hour_local)   AS max_date,
  //          Min(d.time_precision_hour_local)   AS min_date
  //   FROM detection_by_site_species_hour d
  //   GROUP BY d.location_project_id
  //   ;
  //   `
  // )

  // for (const indexCol of INDEX_COLS) {
  //   await params.context.sequelize.query(
  //     `CREATE INDEX ${VIEW_NAME}_${indexCol}_idx ON ${VIEW_NAME} USING btree (${indexCol});`
  //   )
  // }
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
