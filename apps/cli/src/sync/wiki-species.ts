import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { getSequentially } from '@rfcx-bio/utils/async'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getWikiSummary } from '../data-ingest/species/input-wiki'
import { writeWikiSpeciesDataToPostgres, writeWikiSpeciesPhotoDataToPostgres } from '../data-ingest/species/output-wiki-postgres'
import { getSequelize } from '../db/connections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()

  // get scientificName from bioDB

  const speciesNameToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientificName, s.id])))

  // get new data from wiki
  const newData = Object.entries(await getSequentially(Object.keys(speciesNameToId), getWikiSummary))

  // save new data to DB
  await writeWikiSpeciesDataToPostgres(sequelize, newData.map(([name, data]) => ({
    taxonSpeciesId: speciesNameToId[name],
    description: data.content,
    descriptionSourceUrl: data.contentUrls.desktop
  })))

  await writeWikiSpeciesPhotoDataToPostgres(sequelize, newData.map(([name, data]) => {
    if (!data.thumbnailImage || !data.license) return undefined
    return {
      taxonSpeciesId: speciesNameToId[name],
      photoUrl: data.thumbnailImage,
      photoCaption: data.title,
      photoAuthor: data.credit ?? '',
      photoLicense: data.license,
      photoLicenseUrl: data.licenseUrl
    }
  }).filter(isDefined))

  process.exit(0)
}

await main()
