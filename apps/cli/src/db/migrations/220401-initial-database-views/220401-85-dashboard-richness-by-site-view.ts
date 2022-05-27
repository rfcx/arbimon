/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'dashboard_richness_by_site'

export const up: MigrationFn<QueryInterface> = async ({ context: { createTable, sequelize } }): Promise<void> => {
  // await sequelize.query(
  //   `
  //   create view ${VIEW_NAME} as
  //   SELECT ls.location_project_id,
  //      ls.name,
  //      ls.longitude,
  //      ls.latitude,
  //      richness_by_site.richness
  //   FROM location_site ls
  //   JOIN (
  //     SELECT
  //       detection_by_site_species.location_site_id,
  //       count(1)::integer as richness
  //     FROM (
  //       SELECT location_site_id
  //       FROM detection_by_site_species_hour
  //       GROUP BY location_site_id, taxon_species_id
  //     ) detection_by_site_species
  //     GROUP BY location_site_id
  //   ) richness_by_site
  //   ON ls.id = richness_by_site.location_site_id
  //   `
  // )
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
