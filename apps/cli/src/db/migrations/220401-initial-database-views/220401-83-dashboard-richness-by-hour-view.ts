/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'dashboard_richness_by_hour'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  // await sequelize.query(
  //   `
  //   create view ${VIEW_NAME} as
  //   SELECT location_project_id,
  //          EXTRACT(HOUR FROM time_precision_hour_local) AS hour,
  //          count(distinct taxon_species_id)             AS richness
  //   FROM detection_by_site_species_hour
  //   GROUP BY 1, 2
  //   ORDER BY 1, 2
  //   ;
  //   `
  // )
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
