import { groupBy } from 'lodash-es'
import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type SyncStatus } from '@rfcx-bio/node-common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { writeSpeciesCallsToBio } from '@/ingest/outputs/species-calls'
import { getArbimonSpeciesCalls } from '../inputs/get-arbimon-species-call'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { writeSyncResult } from '../outputs/sync-status'
import { parseArray } from '../parsers/parse-array'
import { parseSpeciesCallArbimonToBio } from '../parsers/parse-species-call-arbimon-to-bio'
import { type SyncConfig, getDefaultSyncStatus } from './sync-config'
import { isSyncable } from './syncable'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.SpeciesCall.id,
  syncBatchLimit: 20000
}

export const syncArbimonSpeciesCallBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  const arbimonSpeciesCalls = await getArbimonSpeciesCalls(arbimonSequelize, syncStatus)

  // Exit early if nothing to sync
  if (arbimonSpeciesCalls.length === 0) return syncStatus

  console.info('- syncArbimonSpeciesCallsBatch: from', syncStatus.syncUntilId, syncStatus.syncUntilDate)
  console.info('- syncArbimonSpeciesCallsBatch: found %d species calls', arbimonSpeciesCalls.length)

  // Error if taxon species call doesn't contain needed sync status data
  const lastSyncedTaxonSpeciesCall = arbimonSpeciesCalls[arbimonSpeciesCalls.length - 1]
  if (!isSyncable(lastSyncedTaxonSpeciesCall)) throw new Error('Input does not contain needed sync-status data')

  // Parse input
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonSpeciesCalls, parseSpeciesCallArbimonToBio)
  const speciesCalls = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)

  // Write species to Bio
  const [insertSuccess, insertErrors] = await writeSpeciesCallsToBio(speciesCalls, biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()
  try {
    // Update sync status
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: dayjs.utc(lastSyncedTaxonSpeciesCall.updatedAt).toDate(), syncUntilId: lastSyncedTaxonSpeciesCall.idArbimon.toString() }
    await writeSyncResult(updatedSyncStatus, biodiversitySequelize, transaction)

    await Promise.all(inputsAndParsingErrors.map(async e => {
      const idArbimon = isSyncable(e[0]) ? e[0].idArbimon : 'unknown'
      const error = {
        externalId: `${idArbimon}`,
        error: 'ValidationError: ' + JSON.stringify(e[1].error.issues),
        syncSourceId: updatedSyncStatus.syncSourceId,
        syncDataTypeId: updatedSyncStatus.syncDataTypeId
      }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))

    await Promise.all(insertErrors.map(async e => {
      const error = { ...e, syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))

    // log project sync
    const groupedByProject = groupBy(insertSuccess, 'callProjectId')
    await Promise.all(Object.keys(groupedByProject).map(async projectId => {
      const log = {
        locationProjectId: parseInt(projectId),
        syncSourceId: SYNC_CONFIG.syncSourceId,
        syncDataTypeId: SYNC_CONFIG.syncDataTypeId,
        delta: groupedByProject[projectId].length
      }
      await writeSyncLogByProject(log, biodiversitySequelize, transaction)
    }))

    // commit transactions
    await transaction.commit()
    // return sync status
    return updatedSyncStatus
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const syncArbimonSpeciesCalls = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<boolean> => {
  const syncStatus = await ModelRepository.getInstance(getSequelize())
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

  const updatedSyncStatus = await syncArbimonSpeciesCallBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
  return (syncStatus.syncUntilDate === updatedSyncStatus.syncUntilDate && syncStatus.syncUntilId === updatedSyncStatus.syncUntilId)
}
