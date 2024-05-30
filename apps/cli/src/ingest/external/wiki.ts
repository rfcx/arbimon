import { type Sequelize, QueryTypes } from 'sequelize'

import { SOURCES } from '@rfcx-bio/node-common/dao/types/source'
import { getSequentially } from '@rfcx-bio/utils/async'
import { isDefined } from '@rfcx-bio/utils/predicates'
import { truncateEllipsis } from '@rfcx-bio/utils/string'

import { getWikiSummary } from '@/ingest/_refactor/input-wiki'
import { writeWikiSpeciesDataToPostgres, writeWikiSpeciesPhotoDataToPostgres } from '@/ingest/_refactor/output-bio-db/taxon-species-wiki'

export const syncOnlyMissingWikiSpeciesInfo = async (sequelize: Sequelize): Promise<void> => {
  const unknownSpeciesRegexp = /^sp\d+$/

  const sql = `
    SELECT DISTINCT ts.id, ts.scientific_name, ts.slug
    FROM taxon_species ts
    LEFT JOIN taxon_species_wiki tsw ON ts.id = tsw.taxon_species_id
    WHERE tsw.taxon_species_id IS NULL OR DATE_PART('month',AGE(CURRENT_TIMESTAMP, tsw.updated_at)) >= 1 
    ORDER BY ts.id
  `
  // Lookups
  const speciesNameAndIds = await sequelize
    .query<{ id: number, scientific_name: string, slug: string }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(allSpecies => {
      return allSpecies.filter(s => !unknownSpeciesRegexp.test(s.slug))
    })

  let offset = 0
  const batchSize = 1000
  const batch = Math.ceil(speciesNameAndIds.length / batchSize)

  for (let i = 0; i < batch; i++) {
    const speciesNameToId = Object.fromEntries(speciesNameAndIds
        .slice(offset, Math.min(offset + batchSize, speciesNameAndIds.length))
        .map(s => [s.scientific_name, s.id]))
    console.info('| syncOnlyMissingWikiSpeciesInfo =', Object.entries(speciesNameToId).length)
    await syncWikiSpeciesInfo(sequelize, speciesNameToId)
    offset = offset + batchSize
  }
}

export const syncWikiSpeciesInfo = async (sequelize: Sequelize, speciesNameToId: Record<string, number>): Promise<void> => {
  const newData = Object.entries(await getSequentially(Object.keys(speciesNameToId), getWikiSummary))

  await writeWikiSpeciesDataToPostgres(sequelize, newData.map(([name, data]) => {
    // Ignore not support species name and sub species name wiki information
    if (name.split(' ').length > 2) return undefined

    return {
      taxonSpeciesId: speciesNameToId[name],
      description: data.content,
      descriptionSourceUrl: data.contentUrls.desktop
    }
  }).filter(isDefined))

  const speciesPhotos = newData.map(([name, data]) => {
    if (!data.thumbnailImage || !data.license) return undefined

    return {
      taxonSpeciesId: speciesNameToId[name],
      source: SOURCES.wiki,
      photoUrl: decodeURI(data.thumbnailImage),
      photoCaption: data.title,
      photoAuthor: truncateEllipsis(data.credit ?? '', 1023),
      photoLicense: data.license,
      photoLicenseUrl: data.licenseUrl ? decodeURI(data.licenseUrl) : undefined
    }
  }).filter(isDefined)

  await writeWikiSpeciesPhotoDataToPostgres(sequelize, speciesPhotos)
}
