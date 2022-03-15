import { Optional, Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesCallModel } from '@rfcx-bio/common/dao/models/taxon-species-call-model'
import { TaxonSpeciesCall } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { ArbimonSpeciesCall } from '../arbimon-call'

export async function writeSpeciesCallsToPostgres (sequelize: Sequelize, speciesCalls: ArbimonSpeciesCall[]): Promise<void> {
  const models = ModelRepository.getInstance(sequelize)

  const speciesIdArbimonToBio = await models.TaxonSpecies.findAll()
  .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.idArbimon, s.id])))

  const siteIdArbimonToBio = await models.LocationSite.findAll()
    .then(allSites => Object.fromEntries(allSites.map(s => [s.idArbimon, s.id])))

    const projectIdArbimonToBio = await models.LocationProject.findAll()
    .then(allProjects => Object.fromEntries(allProjects.map(s => [s.idArbimon, s.id])))

  const data: Array<Optional<TaxonSpeciesCall, 'id'>> = speciesCalls
    .map(call => {
      const taxonSpeciesId = speciesIdArbimonToBio[call.species_id]
      if (!taxonSpeciesId) return undefined
      return {
        taxonSpeciesId: taxonSpeciesId,
        callProjectId: projectIdArbimonToBio[call.project_idArbimon],
        callSiteId: siteIdArbimonToBio[call.site_idArbimon],
        callType: call.songtype,
        callRecordedAt: new Date(call.start),
        callTimezone: call.timezone,
        callMediaWavUrl: call.media_wav_url,
        callMediaSpecUrl: call.media_spec_url,
        callMediaRedirectUrl: call.redirect_url
      }
    })
    .filter(isDefined)

  await TaxonSpeciesCallModel(sequelize).bulkCreate(data)
}
