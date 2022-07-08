import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncError, TaxonSpeciesCall } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { isDefined } from '@rfcx-bio/utils/predicates'
import { dateQueryParamify } from '@rfcx-bio/utils/url-helpers'

import { requireEnv } from '~/env'
import { SpeciesCallArbimon } from '../parsers/parse-species-call-arbimon-to-bio'

const { ARBIMON_BASE_URL, MEDIA_API_BASE_URL } = requireEnv('ARBIMON_BASE_URL', 'MEDIA_API_BASE_URL')

const transformSpeciesCall = async (speciesCall: SpeciesCallArbimon, sequelize: Sequelize): Promise<Omit<TaxonSpeciesCall, 'id'>> => {
  const models = ModelRepository.getInstance(sequelize)

  const speciesIdArbimonToBio = await models.TaxonSpecies.findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.idArbimon, s.id])))

  const siteIdArbimonToBio = await models.LocationSite.findAll()
    .then(allSites => Object.fromEntries(allSites.map(s => [s.idArbimon, s.id])))

  const projectIdArbimonToBio = await models.LocationProject.findAll()
    .then(allProjects => Object.fromEntries(allProjects.map(s => [s.idArbimon, s.id])))

  const taxonSpeciesId = speciesIdArbimonToBio[speciesCall.taxonSpeciesId]

  const callProjectId = projectIdArbimonToBio[speciesCall.callProjectId]
  const callSiteId = siteIdArbimonToBio[speciesCall.callSiteId]

  const start = dayjs(speciesCall.callRecordedAt).add(speciesCall.start, 'seconds')
  const end = dayjs(speciesCall.callRecordedAt).add(speciesCall.end, 'seconds')

  return {
      idArbimon: speciesCall.idArbimon,
      taxonSpeciesId: taxonSpeciesId,
      callProjectId: callProjectId,
      callSiteId: callSiteId,
      callType: speciesCall.callType,
      callRecordedAt: new Date(speciesCall.callRecordedAt),
      callTimezone: speciesCall.callTimezone,
      callMediaRedirectUrl: `${ARBIMON_BASE_URL}/project/${speciesCall.projectSlugArbimon}/visualizer/rec/${speciesCall.recordingId}`,
      callMediaWavUrl: `${MEDIA_API_BASE_URL}/internal/assets/streams/${speciesCall.siteIdCore}_t${dateQueryParamify(start.toISOString())}.${dateQueryParamify(end.toISOString())}_fwav.wav`,
      callMediaSpecUrl: `${MEDIA_API_BASE_URL}/internal/assets/streams/${speciesCall.siteIdCore}_t${dateQueryParamify(start.toISOString())}.${dateQueryParamify(end.toISOString())}_d512.512_mtrue_fspec.png`
    }
 }

const loopUpsert = async (speciesCalls: Array<Omit<TaxonSpeciesCall, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const sp of speciesCalls) {
    try {
      await ModelRepository.getInstance(sequelize).TaxonSpeciesCall.upsert(sp)
    } catch (e: any) {
      // store insert errors
      failedToInsertItems.push({
        externalId: `${sp.idArbimon}`,
        error: e.message
      })
    }
  }
  return failedToInsertItems
}

export const writeSpeciesCallsToBio = async (speciesCalls: SpeciesCallArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[Array<Omit<TaxonSpeciesCall, 'id'>>, Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const calls = await Promise.all(speciesCalls.map(async (call) => {
    return await transformSpeciesCall(call, sequelize)
  }))
  const filteredCalls = calls.filter(isDefined)
  try {
    await ModelRepository.getInstance(sequelize)
      .TaxonSpeciesCall
      .bulkCreate(filteredCalls, {
        ...transaction && { transaction }
      })
    return [filteredCalls, []]
  } catch (batchInsertError) {
    console.error('⚠️ Batch insert of species calls failed... try loop insert', (batchInsertError as any).errors)
    const failedToInsertItems = await loopUpsert(filteredCalls, sequelize)
    return [
      filteredCalls.filter(call => !failedToInsertItems.find(error => error.externalId === `${call.idArbimon}`)),
      failedToInsertItems
    ]
  }
}
