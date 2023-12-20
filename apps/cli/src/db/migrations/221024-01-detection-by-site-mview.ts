/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const VIEW_NAME = 'detection_by_site'
const INDEX_COLS = ['location_project_id']

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    CREATE MATERIALIZED VIEW ${VIEW_NAME} AS
    SELECT d.location_project_id,
           d.location_site_id,
           cast(sum(d.count) as integer) as count
    FROM detection_by_site_species_hour d
    GROUP BY d.location_project_id,
             d.location_site_id;
    `
  )

  for (const indexCol of INDEX_COLS) {
    await params.context.sequelize.query(
      `CREATE INDEX ${VIEW_NAME}_${indexCol}_idx ON ${VIEW_NAME} USING btree (${indexCol});`
    )
  }
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
