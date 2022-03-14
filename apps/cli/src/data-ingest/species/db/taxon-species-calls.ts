import { Optional, QueryTypes, Sequelize } from 'sequelize'

import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { TaxonSpeciesCallModel } from '@rfcx-bio/common/dao/models/taxon-species-call-model'
import { TaxonSpeciesCall } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { ArbimonSpeciesCall } from '../arbimon-call'

export async function writeSpeciesCallsToPostgres (sequelize: Sequelize, speciesCalls: Record<string, ArbimonSpeciesCall[]>): Promise<void> {
    const sql = `
    SELECT DISTINCT ts.id, ts.scientific_name
    FROM taxon_species ts
    LEFT JOIN taxon_species_call tsc ON ts.id = tsc.taxon_species_id
    WHERE tsc.taxon_species_id IS NULL OR DATE_PART('month',AGE(CURRENT_TIMESTAMP, ts.updated_at)) >= 1 
    ORDER BY ts.id
  `

  const speciesScientificToId = await sequelize
    .query<{ id: number, scientific_name: string }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientific_name, s.id])))

  const siteNameToId = await LocationSiteModel(sequelize).findAll()
    .then(allSites => Object.fromEntries(allSites.map(s => [s.name, s.id])))

  const calls = Object.entries(speciesCalls)
    .flatMap(([scientificName, calls]) => calls.map(call => ({ scientificName, ...call })))

  const data: Array<Optional<TaxonSpeciesCall, 'id'>> = calls
    .map(call => {
      const { mediaWavUrl, mediaSpecUrl, redirectUrl, songType, recordedAt, timezone, siteName, scientificName } = call

      const taxonSpeciesId = speciesScientificToId[scientificName]
      if (!taxonSpeciesId) return undefined

      return {
        taxonSpeciesId: taxonSpeciesId,
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
