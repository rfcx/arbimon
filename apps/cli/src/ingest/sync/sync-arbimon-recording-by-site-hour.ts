import { groupBy } from 'lodash-es'
import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'

import { ArbimonRecordingBySiteHourQuery, getArbimonRecordingBySiteHour } from '../inputs/get-arbimon-recording-by-site-hour'
import { writeRecordingBySiteHourToBio } from '../outputs/recording-by-site-hour'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { writeSyncResult } from '../outputs/sync-status'
import { parseArray } from '../parsers/parse-array'
import { mapRecordingBySiteHourArbimonWithBioFk, parseRecordingBySiteHourToBio, RecordingBySiteHourArbimon } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Recording.id,
  syncBatchLimit: 1000
}

export const syncArbimonRecordingBySiteHourBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  // =========== Input ==========
  const arbimonRecordingBySiteHour = await getArbimonRecordingBySiteHour(arbimonSequelize, syncStatus)
  console.info('- syncArbimonRecordingBySiteHourBatch: from', syncStatus.syncUntilId, syncStatus.syncUntilDate)
  console.info('- syncArbimonRecordingBySiteHourBatch: found %d sites', arbimonRecordingBySiteHour.length)
  if (arbimonRecordingBySiteHour.length === 0) return syncStatus

  const lastSyncRecordingBySiteHour = arbimonRecordingBySiteHour[arbimonRecordingBySiteHour.length - 1] // already last uploaded item because query order by it
  // =========== Parser ==========

  // unknown to expected format
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray<ArbimonRecordingBySiteHourQuery, RecordingBySiteHourArbimon>(arbimonRecordingBySiteHour, parseRecordingBySiteHourToBio)
  const recordingDataBySiteHourArbimon = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)

  // convert to bio db
  const recordingBySiteHourBio = await mapRecordingBySiteHourArbimonWithBioFk(recordingDataBySiteHourArbimon, biodiversitySequelize)

  // =========== Output ==========
  const [insertSuccesses, insertErrors] = await writeRecordingBySiteHourToBio(recordingBySiteHourBio, biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()

  // =========== Sync Status ==========
  try {
    // sync status
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: lastSyncRecordingBySiteHour.lastUploaded, syncUntilId: lastSyncRecordingBySiteHour.lastRecordingIdArbimon.toString() }
    await writeSyncResult(updatedSyncStatus, biodiversitySequelize, transaction)

    // sync error
    await Promise.all(inputsAndParsingErrors.map(async e => {
      const error = {
        externalId: `${e[0].lastUploaded.toString()}-${e[0].siteIdArbimon}-${e[0].firstRecordingIdArbimon}-${e[0].lastRecordingIdArbimon}`,
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
    return updatedSyncStatus
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const syncArbimonRecordingBySiteHour = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<boolean> => {
  const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

  const updatedSyncStatus = await syncArbimonRecordingBySiteHourBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
  return (syncStatus.syncUntilDate === updatedSyncStatus.syncUntilDate && syncStatus.syncUntilId === updatedSyncStatus.syncUntilId)
}
