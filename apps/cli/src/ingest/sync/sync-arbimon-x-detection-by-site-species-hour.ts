import { groupBy } from 'lodash-es'
import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getArbimonDetections } from '../inputs/get-arbimon-detections'
import { writeDetectionsToBio } from '../outputs/detection-by-site-species-hour'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { writeSyncResult } from '../outputs/sync-status'
import { parseArray } from '../parsers/parse-array'
import { parseDetectionArbimonToBio } from '../parsers/parse-detection-arbimon-to-bio'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'
import { isSyncable } from './syncable'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Detection.id,
  syncBatchLimit: 20000
}

// This batch works like a loop where all detections are in sync
export const syncArbimonDetectionBySiteSpeciesHourBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  // Get detections by sync config parameters
  const arbimonDetections = await getArbimonDetections(arbimonSequelize, syncStatus)

  console.info('- syncArbimonDetectionBySiteSpeciesHourBatch: from', syncStatus.syncUntilId, syncStatus.syncUntilDate)
  console.info('- syncArbimonDetectionBySiteSpeciesHourBatch: found %d detections', arbimonDetections.length)

  if (arbimonDetections.length === 0) return syncStatus

  const lastSyncdSite = arbimonDetections[arbimonDetections.length - 1]
  if (!isSyncable(lastSyncdSite)) throw new Error('Input does not contain needed sync-status data')

  // Parser

  // unknown to expected format
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonDetections, parseDetectionArbimonToBio)
  const parsedDetections = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)

  // Writer
  const [insertSuccess, insertErrors] = await writeDetectionsToBio(parsedDetections, biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()

  try {
    // Update sync status
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: lastSyncdSite.updatedAt, syncUntilId: lastSyncdSite.idArbimon.toString() }
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
    const groupedByProject = groupBy(insertSuccess, 'locationProjectId')
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
    console.error(error)
    throw error
  }
}

export const syncArbimonDetectionBySiteSpeciesHour = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<boolean> => {
  const syncStatus = await ModelRepository.getInstance(getSequelize())
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

  const updatedSyncStatus = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
  return (syncStatus.syncUntilDate === updatedSyncStatus.syncUntilDate && syncStatus.syncUntilId === updatedSyncStatus.syncUntilId)
}
