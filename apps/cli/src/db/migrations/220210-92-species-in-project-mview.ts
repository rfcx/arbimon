/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'species_in_project'
const INDEX_COLS = ['location_project_id', 'taxon_class_id', 'taxon_species_id']

// TODO: Add some logic for picking which photo to show
export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(
    `
    create materialized view ${VIEW_NAME} as
    SELECT d.location_project_id,
           ts.taxon_class_id,
           tc.slug as taxon_class_slug,
           ts.id AS taxon_species_id,
           ts.slug as taxon_species_slug,
           ts.scientific_name,
           MAX(tsi.common_name) AS common_name,
           COALESCE(MAX(tsi.risk_rating_iucn_id), -1) AS risk_rating_iucn_id,
           MAX(tsp.photo_url) AS photo_url
    FROM detection_by_site_species_hour d
      INNER JOIN taxon_species ts ON d.taxon_species_id = ts.id
      INNER JOIN taxon_class tc ON ts.taxon_class_id = tc.id
      LEFT OUTER JOIN taxon_species_iucn tsi ON ts.id = tsi.taxon_species_id
      LEFT OUTER JOIN taxon_species_wiki tsw ON ts.id = tsw.taxon_species_id
      LEFT OUTER JOIN taxon_species_photo tsp ON ts.id = tsp.taxon_species_id
    GROUP BY d.location_project_id, ts.id, tc.slug
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
