import { Optional, Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesAudio } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { ArbimonSpeciesCall } from '../input-arbimon-call'

export async function writeSpeciesCallsToPostgres (sequelize: Sequelize, speciesCalls: ArbimonSpeciesCall[]): Promise<void> {
  // const models = ModelRepository.getInstance(sequelize)

  // const speciesIdArbimonToBio = await models.TaxonSpecies.findAll()
  // .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.idArbimon, s.id])))

  // const siteIdArbimonToBio = await models.ProjectSite.findAll()
  //   .then(allSites => Object.fromEntries(allSites.map(s => [s.idArbimon, s.id])))

  //   const projectIdArbimonToBio = await models.Project.findAll()
  //   .then(allProjects => Object.fromEntries(allProjects.map(s => [s.idArbimon, s.id])))

  // const data: Array<Optional<TaxonSpeciesAudio, 'id'>> = speciesCalls
  //   .map(call => {
  //     const taxonSpeciesId = speciesIdArbimonToBio[call.species_id]
  //     const siteId = siteIdArbimonToBio[call.site_idArbimon]
  //     if (!taxonSpeciesId || !siteId) return undefined
  //     return {
  //       taxonSpeciesId: taxonSpeciesId,
  //       callProjectId: projectIdArbimonToBio[call.project_idArbimon],
  //       callSiteId: siteId,
  //       callType: call.songtype,
  //       callRecordedAt: new Date(call.start),
  //       callTimezone: call.timezone,
  //       callMediaWavUrl: call.media_wav_url,
  //       callMediaSpecUrl: call.media_spec_url,
  //       callMediaRedirectUrl: call.redirect_url
  //     }
  //   })
  //   .filter(isDefined)

  // await models.TaxonSpeciesCall.bulkCreate(data)
}
