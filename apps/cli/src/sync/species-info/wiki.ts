import { Sequelize } from 'sequelize'

import { SOURCES } from '@rfcx-bio/common/dao/types/source'
import { getSequentially } from '@rfcx-bio/utils/async'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getWikiSummary } from '../../data-ingest/species/input-wiki'
import { writeWikiSpeciesDataToPostgres, writeWikiSpeciesPhotoDataToPostgres } from '../../data-ingest/species/output-wiki-postgres'

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
      photoUrl: data.thumbnailImage,
      photoCaption: data.title,
      photoAuthor: data.credit ?? '',
      photoLicense: data.license,
      photoLicenseUrl: data.licenseUrl
    }
  }).filter(isDefined))
}
