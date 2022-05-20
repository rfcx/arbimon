/**
 * WARNING: MIGRATIONS ARE IMMUTABLE
 * Do not depend on imported code which may change
 */

import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

const VIEW_NAME = 'taxon_species_merged'
// const INDEX_COLS = []

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await params.context.sequelize.query(`
    CREATE VIEW ${VIEW_NAME} AS
    WITH audio AS (SELECT DISTINCT ON (taxon_species_id) taxon_species_id, audio_url, source_url, spectrogram_url
                   FROM taxon_species_audio
                   ORDER BY taxon_species_id, "order"),
         common_name AS (SELECT DISTINCT ON (taxon_species_id) taxon_species_id, common_name, taxon_species_source_id
                         FROM taxon_species_common_name
                         ORDER BY taxon_species_id, taxon_species_source_id),
         description AS (SELECT DISTINCT ON (taxon_species_id) taxon_species_id, description, source_url, taxon_species_source_id
                         FROM taxon_species_description
                         ORDER BY taxon_species_id, taxon_species_source_id),
         photo AS (SELECT DISTINCT ON (taxon_species_id) taxon_species_id, photo_url, source_url, license, caption, author, taxon_species_source_id
                   FROM taxon_species_photo
                   ORDER BY taxon_species_id, taxon_species_source_id, "order"),
         risk AS (SELECT DISTINCT ON (taxon_species_id) taxon_species_id, risk_rating_id, risk_rating_custom_code, source_url, taxon_species_source_id
                  FROM taxon_species_risk_rating
                  ORDER BY taxon_species_id, taxon_species_source_id)

    SELECT ts.id, ts.slug, ts.taxon_class_id, ts.scientific_name,
           audio.audio_url, audio.source_url AS audio_source_url, audio.spectrogram_url,
           common_name.common_name, common_name.taxon_species_source_id AS common_name_source_id,
           description.description, description.source_url AS description_source_url, description.taxon_species_source_id AS description_source_id,
           photo.photo_url, photo.source_url AS photo_source_url, photo.license AS photo_license, photo.caption AS photo_caption, photo.author AS photo_author, photo.taxon_species_source_id AS photo_source_id,
           risk.risk_rating_id, risk.risk_rating_custom_code, risk.source_url AS risk_rating_source_url, risk.taxon_species_source_id AS risk_rating_source_id
    FROM taxon_species ts
        LEFT JOIN audio ON audio.taxon_species_id = ts.id
        LEFT JOIN common_name ON common_name.taxon_species_id = ts.id
        LEFT JOIN description ON description.taxon_species_id = ts.id
        LEFT JOIN photo ON photo.taxon_species_id = ts.id
        LEFT JOIN risk ON risk.taxon_species_id = ts.id
    ;
  `)

  // for (const indexCol of INDEX_COLS) {
  //   await params.context.sequelize.query(
  //     `CREATE INDEX ${VIEW_NAME}_${indexCol}_idx ON ${VIEW_NAME} USING btree (${indexCol});`
  //   )
  // }
}

export const down: MigrationFn<QueryInterface> = async (params) =>
  await params.context.sequelize.query(`DROP VIEW IF EXISTS ${VIEW_NAME};`)
