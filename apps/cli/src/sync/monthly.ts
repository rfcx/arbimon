import { RiskRatingIucnModel } from '@rfcx-bio/common/dao/models/risk-rating-iucn-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'

import { refreshMviews } from '../db/actions/refresh-mviews'
import { getSequelize } from '../db/connections'
import { syncIucnSpeciesInfo } from './species-info/iucn'
import { syncWikiSpeciesInfo } from './species-info/wiki'

const main = async (): Promise<void> => {
  console.info('Monthly sync start')
  try {
    const sequelize = getSequelize()

    console.info('STEP: Get lookups')
    const speciesNameToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
      .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientificName, s.id])))

    const iucnCodeToId: Record<string, number> = await RiskRatingIucnModel(sequelize).findAll()
      .then(allRatings => Object.fromEntries(allRatings.map(r => [r.code, r.id])))

    console.info('STEP: Sync IUCN')
    await syncIucnSpeciesInfo(sequelize, speciesNameToId, iucnCodeToId)

    console.info('STEP: Sync Wiki')
    await syncWikiSpeciesInfo(sequelize, speciesNameToId)

    console.info('STEP: Refresh mviews')
    await refreshMviews(sequelize)

    console.info('Monthly sync end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Monthly sync end: failed')
  }
}

await main()
