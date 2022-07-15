import { groupBy } from 'lodash-es'
import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { getArbimonDetections } from '../inputs/get-arbimon-detections'
import { writeDetectionsToBio } from '../outputs/detection-by-site-species-hour'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { writeSyncResult } from '../outputs/sync-status'
import { parseArray } from '../parsers/parse-array'
import { parseDetectionArbimonToBio } from '../parsers/parse-detection-arbimon-to-bio'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Detection.id,
  syncBatchLimit: 5
}

// This batch works like a loop where all detections are in sync
export const syncArbimonDetectionBySiteSpeciesHourBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  const timeToStart = dayjs.utc().toDate()
  // Default offset
  let offset = 0
  // eslint-disable-next-line no-unreachable-loop
  while (true) {
    // Get detections by limit and offset in the loop
    const arbimonDetections = await getArbimonDetections(arbimonSequelize, { ...syncStatus, syncUntilId: (offset * syncStatus.syncBatchLimit).toString() })
    const transaction = await biodiversitySequelize.transaction()
    // Exit if nothing to sync
    if (arbimonDetections.length === 0) {
      const updatedFinalSyncStatus: SyncStatus = { ...syncStatus, syncUntilId: '0', syncUntilDate: dayjs.utc(timeToStart).toDate() }
      await writeSyncResult(updatedFinalSyncStatus, biodiversitySequelize, transaction)
      await transaction.commit()
      const newSyncStatus = await ModelRepository.getInstance(getSequelize())
        .SyncStatus
        .findOne({
          where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
          raw: true
        }) ?? getDefaultSyncStatus(SYNC_CONFIG)
      return newSyncStatus
    }

    console.info('- syncArbimonDetectionBySiteSpeciesHourBatch: offset, dateStart', offset, syncStatus.syncUntilDate)
    console.info('- syncArbimonDetectionBySiteSpeciesHourBatch: found %d detections', arbimonDetections.length)

    // Parse input
    const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonDetections, parseDetectionArbimonToBio)
    const detections = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)
    // Write detections to Bio
    const [insertSuccess, insertErrors] = await writeDetectionsToBio(detections, biodiversitySequelize)
    try {
      // Update sync status
      const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilId: (offset * syncStatus.syncBatchLimit).toString() }
      await writeSyncResult(updatedSyncStatus, biodiversitySequelize, transaction)
      // Update sync error - parse input
      await Promise.all(inputsAndParsingErrors.map(async e => {
        const errorDetection = e[0] as any
        const error = {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          externalId: `${errorDetection.updatedAt}|${errorDetection.locationProjectId}|${errorDetection.locationSiteId}|${errorDetection.detectionId}`,
          error: 'ValidationError: ' + JSON.stringify(e[1].error.issues),
          syncSourceId: updatedSyncStatus.syncSourceId,
          syncDataTypeId: updatedSyncStatus.syncDataTypeId
        }
        await writeSyncError(error, biodiversitySequelize, transaction)
      }))
      // Update sync error - insert
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
      // increment offset
      offset++
    } catch (error) {
      await transaction.rollback()
      throw error
    }
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
  return updatedSyncStatus !== undefined
}
