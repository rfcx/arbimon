/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { DatabaseUser, grant, GrantPermission } from './_helpers/grants'

const VIEW_NAME = 'dashboard_richness_by_site'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    DROP VIEW IF EXISTS ${VIEW_NAME};
    create or replace view ${VIEW_NAME} as
    SELECT ls.location_project_id,
       ls.name,
       ls.longitude,
       ls.latitude,
       richness_by_site.richness,
       richness_by_site.taxon_class_id
    FROM location_site ls
    JOIN (
      SELECT
        detection_by_site_species.location_site_id,
        detection_by_site_species.taxon_class_id as taxon_class_id,
        count(1)::integer as richness
      FROM (
        SELECT location_site_id, taxon_class_id
        FROM detection_by_site_species_hour
        GROUP BY location_site_id, taxon_species_id, taxon_class_id
      ) detection_by_site_species
      GROUP BY location_site_id, taxon_class_id
    ) richness_by_site
    ON ls.id = richness_by_site.location_site_id
    `
  )
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}

export const down: MigrationFn<QueryInterface> = async (params) => {
  await params.context.sequelize.query(`
    DROP VIEW IF EXISTS ${VIEW_NAME};
    create view ${VIEW_NAME} as
      SELECT ls.location_project_id,
        ls.name,
        ls.longitude,
        ls.latitude,
        richness_by_site.richness
      FROM location_site ls
      JOIN (
        SELECT
          detection_by_site_species.location_site_id,
          count(1)::integer as richness
        FROM (
          SELECT location_site_id
          FROM detection_by_site_species_hour
          GROUP BY location_site_id, taxon_species_id
        ) detection_by_site_species
        GROUP BY location_site_id
      ) richness_by_site
      ON ls.id = richness_by_site.location_site_id
  `)
  await grant(params.context.sequelize, VIEW_NAME, [GrantPermission.SELECT], DatabaseUser.API)
}
