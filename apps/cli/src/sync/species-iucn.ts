import { RiskRatingIucnModel } from '@rfcx-bio/common/dao/models/risk-rating-iucn-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'
import { getSequentially } from '@rfcx-bio/utils/async'

import { getIucnSpecies } from '../data-ingest/species/input-iucn/iucn-species'
import { getIucnSpeciesNarrative } from '../data-ingest/species/input-iucn/iucn-species-narrative'
import { writeWikiSpeciesDataToPostgres } from '../data-ingest/species/output-iucn-postgres'
import { getSequelize } from '../db/connections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()

  // get scientificName from bioDB
  const speciesNameToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientificName, s.id])))

  const iucnCodeToId: Record<string, number> = await RiskRatingIucnModel(sequelize).findAll()
    .then(allRatings => Object.fromEntries(allRatings.map(r => [r.code, r.idOrdered])))

  const speciesName = Object.keys(speciesNameToId)

  // get new data from wiki
  const [iucnSpecies, iucnSpeciesNarrative] = await Promise.all([getSequentially(speciesName, getIucnSpecies), getSequentially(speciesName, getIucnSpeciesNarrative)])

  const newData: TaxonSpeciesIucn[] = speciesName.map(speciesName => {
    const iucnSpeciesData = iucnSpecies[speciesName]
    const iucnSpeciesNarrativeData = iucnSpeciesNarrative[speciesName]

    return {
      taxonSpeciesId: speciesNameToId[speciesName],
      commonName: iucnSpeciesData.main_common_name ?? '',
      riskRatingIucnId: iucnCodeToId[iucnSpeciesData?.category ?? '-1'],
      description: iucnSpeciesNarrativeData?.habitat ?? '',
      descriptionSourceUrl: iucnSpeciesNarrativeData.sourceUrl
    }
  })

  await writeWikiSpeciesDataToPostgres(sequelize, newData)
}

await main()
