import { QueryTypes, Sequelize } from 'sequelize'

import { SOURCES } from '@rfcx-bio/common/dao/types/source'
import { getSequentially } from '@rfcx-bio/utils/async'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getWikiSummary } from '@/data-ingest/species/input-wiki'
import { writeWikiSpeciesDataToPostgres, writeWikiSpeciesPhotoDataToPostgres } from '@/data-ingest/species/output-bio-db/taxon-species-wiki'

export const syncOnlyMissingWikiSpeciesInfo = async (sequelize: Sequelize): Promise<void> => {
  const sql = `
    SELECT DISTINCT ts.id, ts.scientific_name
    FROM taxon_species ts
    LEFT JOIN taxon_species_wiki tsw ON ts.id = tsw.taxon_species_id
    WHERE tsw.taxon_species_id IS NULL OR DATE_PART('month',AGE(CURRENT_TIMESTAMP, ts.updated_at)) >= 1 
    ORDER BY ts.id
  `
  // Lookups
  const speciesNameToId: Record<string, number> = await sequelize
    .query<{ id: number, scientific_name: string }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientific_name, s.id])))
  console.info('| syncOnlyMissingWikiSpeciesInfo =', Object.entries(speciesNameToId).length)
  await syncWikiSpeciesInfo(sequelize, speciesNameToId)
}

export const syncWikiSpeciesInfo = async (sequelize: Sequelize, speciesNameToId: Record<string, number>): Promise<void> => {
    const newData = Object.entries(await getSequentially(Object.keys(speciesNameToId), getWikiSummary))

  await writeWikiSpeciesDataToPostgres(sequelize, newData.map(([name, data]) => ({
    taxonSpeciesId: speciesNameToId[name],
    description: data.content,
    descriptionSourceUrl: data.contentUrls.desktop
  })))

  await writeWikiSpeciesPhotoDataToPostgres(sequelize, newData.map(([name, data]) => {
    if (!data.thumbnailImage || !data.license) return undefined
    return {
      taxonSpeciesId: speciesNameToId[name],
      source: SOURCES.wiki,
      // WARNING: Temperary fix
      photoUrl: data.thumbnailImage.length > 512 ? '' : data.thumbnailImage,
      photoCaption: data.title,
      photoAuthor: data.credit ?? '',
      photoLicense: data.license,
      photoLicenseUrl: data.licenseUrl
    }
  }).filter(isDefined))
}
