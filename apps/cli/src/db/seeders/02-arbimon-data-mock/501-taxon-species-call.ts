// TODO: fix species call seeder data into new type format

// import { Optional, QueryInterface } from 'sequelize'
import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

// import { LocationSiteModel } from '@rfcx-bio/node-common/dao/models/location-site-model'
// import { TaxonSpeciesCallModel } from '@rfcx-bio/node-common/dao/models/taxon-species-call-model'
// import { TaxonSpeciesModel } from '@rfcx-bio/node-common/dao/models/taxon-species-model'
// import { TaxonSpeciesCall } from '@rfcx-bio/node-common/dao/types'
// import { isDefined } from '@rfcx-bio/utils/predicates'

// import { rawSpeciesCallData } from '../_data/taxon-species-call'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
//   const sequelize = params.context.sequelize

//   // Lookups
//   const speciesScientificToId = await TaxonSpeciesModel(sequelize).findAll()
//     .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientificName, s.id])))

//   const siteNameToId = await LocationSiteModel(sequelize).findAll()
//     .then(allSites => Object.fromEntries(allSites.map(s => [s.name, s.id])))

//   // Convert data
//   const calls = Object.entries(rawSpeciesCallData)
//     .flatMap(([scientificName, calls]) => calls.map(call => ({ scientificName, ...call })))

//   const data: Array<Optional<TaxonSpeciesCall, 'id'>> = calls
//     .map(call => {
//       const { mediaWavUrl, mediaSpecUrl, redirectUrl, songType, recordedAt, timezone, siteName, scientificName } = call

//       const taxonSpeciesId = speciesScientificToId[scientificName]
//       if (!taxonSpeciesId) return undefined

//       return {
//         taxonSpeciesId: taxonSpeciesId,
//         callProjectId: 1, // TODO: Get the correct Bio Project ID
//         callSiteId: siteNameToId[siteName],
//         callType: songType,
//         callRecordedAt: new Date(recordedAt),
//         callTimezone: timezone,
//         callMediaWavUrl: mediaWavUrl,
//         callMediaSpecUrl: mediaSpecUrl,
//         callMediaRedirectUrl: redirectUrl
//       }
//     })
//     .filter(isDefined)

//   await TaxonSpeciesCallModel(sequelize).bulkCreate(data)
}
