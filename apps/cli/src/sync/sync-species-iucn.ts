import { RiskRatingIucnModel } from '@rfcx-bio/common/dao/models/risk-rating-iucn-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'

import { syncIucnSpeciesInfo } from '@/sync/species-info/iucn'
import { getSequelize } from '../db/connections'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()

  // get scientificName from bioDB
  const speciesNameToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientificName, s.id])))

  const iucnCodeToId: Record<string, number> = await RiskRatingIucnModel(sequelize).findAll()
    .then(allRatings => Object.fromEntries(allRatings.map(r => [r.code, r.idOrdered])))

  await syncIucnSpeciesInfo(sequelize, speciesNameToId, iucnCodeToId)

  process.exit(0)
}

await main()
