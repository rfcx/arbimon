import { groupBy } from 'lodash-es'
import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type SyncStatus } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getArbimonRecordingDeleted } from '../inputs/get-arbimon-recording'
import { deleteRecordingFromBio } from '../outputs/recording-by-site-hour'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { writeSyncResult } from '../outputs/sync-status'
import { parseArray } from '../parsers/parse-array'
import { parseRecordingDeleted } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'
import { type SyncConfig, getDefaultSyncStatus } from './sync-config'
import { isSyncable } from './syncable'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.RecordingDeleted.id,
  syncBatchLimit: 100000
}

export const syncArbimonRecordingDeletedBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  // =========== Input ==========
  const arbimonRecordingDeleted = await getArbimonRecordingDeleted(arbimonSequelize, syncStatus)
  const totalArbimonRecordingBySiteHour = arbimonRecordingDeleted.length
  console.info('- syncArbimonRecordingDeleted: from', syncStatus.syncUntilId, syncStatus.syncUntilDate)
  console.info('- syncArbimonRecordingDeleted: found %d recordings', totalArbimonRecordingBySiteHour)

  if (totalArbimonRecordingBySiteHour === 0) return syncStatus
  // =========== Parser ==========

  // unknown to expected format
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonRecordingDeleted, parseRecordingDeleted)
  const recordingDataBySiteHourArbimon = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)

  // =========== Output ==========
  const [insertSuccesses, insertErrors] = await deleteRecordingFromBio(recordingDataBySiteHourArbimon, biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()

  // =========== Sync Status ==========
  try {
    // sync status
    const lastSyncRecording = arbimonRecordingDeleted[arbimonRecordingDeleted.length - 1]
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: dayjs.utc((lastSyncRecording as any).updatedAt).toDate(), syncUntilId: (lastSyncRecording as any).idArbimon.toString() }
    await writeSyncResult(updatedSyncStatus, biodiversitySequelize, transaction)

    // sync error
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

    // sync project log
    const groupedByProjectId = groupBy(insertSuccesses, 'locationProjectId')
    await Promise.all(Object.keys(groupedByProjectId).map(async projectId => {
      const log = {
        locationProjectId: parseInt(projectId),
        syncSourceId: SYNC_CONFIG.syncSourceId,
        syncDataTypeId: SYNC_CONFIG.syncDataTypeId,
        delta: groupedByProjectId[projectId].length
      }
      await writeSyncLogByProject(log, biodiversitySequelize, transaction)
    }))

    await transaction.commit()
    return updatedSyncStatus
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const syncArbimonRecordingDeleted = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<boolean> => {
  const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

  const updatedSyncStatus = await syncArbimonRecordingDeletedBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
  const isRecordingDeletedUpToDate = syncStatus.syncUntilDate === updatedSyncStatus.syncUntilDate && syncStatus.syncUntilId === updatedSyncStatus.syncUntilId
  return isRecordingDeletedUpToDate
}
