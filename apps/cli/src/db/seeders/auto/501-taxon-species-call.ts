import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { TaxonSpeciesCallModel } from '@rfcx-bio/common/dao/models/taxon-species-call-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpeciesCall } from '@rfcx-bio/common/dao/types'
import { rawSpecies } from '@rfcx-bio/common/mock-data'
import { isDefined } from '@rfcx-bio/utils/predicates'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // PK Lookups
  const speciesSlugToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  const siteNameToId: Record<string, number> = await LocationSiteModel(sequelize).findAll()
    .then(allSites => Object.fromEntries(allSites.map(s => [s.name, s.id])))

  // Convert data
  const data: Array<Optional<TaxonSpeciesCall, 'id'>> =
  rawSpecies.map(s => {
      if (s.speciesCalls.length === 0) return undefined
      // TODO: @nui fix this
      const { mediaWavUrl, mediaSpecUrl, redirectUrl, songType, recordedAt, timezone, siteName } = s.speciesCalls[0]

      return {
        taxonSpeciesId: speciesSlugToId[s.speciesSlug],
        callProjectId: 1,
        callSiteId: siteNameToId[siteName],
        callType: songType,
        callRecordedAt: new Date(recordedAt),
        callTimezone: timezone,
        callMediaWavUrl: mediaWavUrl,
        callMediaSpecUrl: mediaSpecUrl,
        callMediaRedirectUrl: redirectUrl
      }
    })
    .filter(isDefined)

  await TaxonSpeciesCallModel(sequelize).bulkCreate(data)
}
