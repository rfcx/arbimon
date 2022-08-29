import { groupBy } from 'lodash-es'
import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getArbimonRecording } from '../inputs/get-arbimon-recording'
import { writeRecordingBySiteHourToBio } from '../outputs/recording-by-site-hour'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { writeSyncResult } from '../outputs/sync-status'
import { parseArray } from '../parsers/parse-array'
import { parseRecordingBySiteHourToBio } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'
import { isSyncable } from './syncable'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Recording.id,
  syncBatchLimit: 200000
}

export const syncArbimonRecordingBySiteHourBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<[number, SyncStatus]> => {
  // =========== Input ==========
  const arbimonRecordingBySiteHour = await getArbimonRecording(arbimonSequelize, syncStatus)
  const totalArbimonRecordingBySiteHour = arbimonRecordingBySiteHour.length
  console.info('- syncArbimonRecordingBySiteHourBatch: from', syncStatus.syncUntilId, syncStatus.syncUntilDate)
  console.info('- syncArbimonRecordingBySiteHourBatch: found %d recordings', totalArbimonRecordingBySiteHour)
  if (totalArbimonRecordingBySiteHour === 0) return [totalArbimonRecordingBySiteHour, syncStatus]

  const lastSyncRecording = arbimonRecordingBySiteHour[arbimonRecordingBySiteHour.length - 1] // already last uploaded item because query order by it
  if (!isSyncable(lastSyncRecording)) throw new Error('Input does not contain needed sync-status data')
  // =========== Parser ==========

  // unknown to expected format
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonRecordingBySiteHour, parseRecordingBySiteHourToBio)
  const recordingDataBySiteHourArbimon = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)

  // =========== Output ==========
  const [insertSuccesses, insertErrors] = await writeRecordingBySiteHourToBio(recordingDataBySiteHourArbimon, biodiversitySequelize)

  const transaction = await biodiversitySequelize.transaction()

  // =========== Sync Status ==========
  try {
    // sync status
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: dayjs.utc(lastSyncRecording.updatedAt).toDate(), syncUntilId: lastSyncRecording.idArbimon.toString(), projectId: syncStatus.projectId }
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
      return await writeSyncError(error, biodiversitySequelize, transaction)
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
      return await writeSyncLogByProject(log, biodiversitySequelize, transaction)
    }))

    await transaction.commit()
    return [totalArbimonRecordingBySiteHour, updatedSyncStatus]
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const syncArbimonRecordingBySiteHour = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, projectId: number): Promise<boolean> => {
  const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId, projectId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

  if (syncStatus.projectId === null) syncStatus.projectId = projectId

  const [totalArbimonRecordingBySiteHour] = await syncArbimonRecordingBySiteHourBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
  return totalArbimonRecordingBySiteHour < SYNC_CONFIG.syncBatchLimit
}
