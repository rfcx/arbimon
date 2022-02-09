/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'location_project_metric'

export const up: MigrationFn<QueryInterface> = async (params): Promise<unknown> =>
  await params.context.sequelize.query(
    `
    create materialized view ${VIEW_NAME} as
    SELECT Count(1) AS detection_count,
          Count(distinct d.location_site_id) as site_count,
          Count(distinct d.taxon_species_id) as species_count,
          Count(distinct
              CASE WHEN s.extinction_risk_rating IN ('CR', 'EN', 'VU') THEN d.taxon_species_id END
          ) as species_threatened_count
    FROM detection_by_site_species_hour d
    INNER JOIN taxon_species s ON d.taxon_species_id = s.id
    GROUP BY d.location_project_id
    ;
    `
  )

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
