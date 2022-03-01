import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'

import { getSequelize } from '../db/connections'
import { syncWikiSpeciesInfo } from './species-info/wiki'

const main = async (): Promise<void> => {
  const sequelize = getSequelize()

  // Lookups
  const speciesNameToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientificName, s.id])))

  await syncWikiSpeciesInfo(sequelize, speciesNameToId)

  process.exit(0)
}

await main()
