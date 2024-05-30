import { groupBy } from 'lodash-es'
import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { getArbimonProjectDetection } from '../inputs/get-arbimon-detection'
import { mapDetectionBySiteSpeciesHourArbimonWithPrevSync, writeDetectionBySiteSpeciesHourToBio } from '../outputs/resync-detection-by-site-species-hour'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { parseArray } from '../parsers/parse-array'
import { type DetectionArbimon, parseDetectionArbimonToBio } from '../parsers/parse-detection-arbimon-to-bio'
import { type SyncConfig } from './sync-config'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Detection.id,
  syncBatchLimit: 100000
}

export const syncArbimonDetection = async (projectId: number, offset: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<[number, DetectionArbimon[]]> => {
  // =========== Input ==========
  const arbimonDetections = await getArbimonProjectDetection(arbimonSequelize, projectId, SYNC_CONFIG.syncBatchLimit, offset)
  const totalArbimonDetectionBySiteSpeciesHour = arbimonDetections.length

  console.info('- syncArbimonDetectionBySiteSpeciesHourBatch: offset', offset)
  console.info('- syncArbimonDetectionBySiteSpeciesHourBatch: found %d detections', totalArbimonDetectionBySiteSpeciesHour)

  if (totalArbimonDetectionBySiteSpeciesHour === 0) return [totalArbimonDetectionBySiteSpeciesHour, []]

  // =========== Parser ==========
  // unknown to expected format
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonDetections, parseDetectionArbimonToBio)
  const detectionDataBySiteSpeciesHourArbimon = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)

  // =========== Sync logs ==========
  const transaction = await biodiversitySequelize.transaction()
  try {
    // sync error
    await Promise.all(inputsAndParsingErrors.map(async (e: any) => {
      const idArbimon = e[0].idArbimon as number
      const error = {
        externalId: `${idArbimon}`,
        error: 'ValidationError: ' + JSON.stringify(e[1].error.issues),
        syncSourceId: SYNC_CONFIG.syncSourceId,
        syncDataTypeId: SYNC_CONFIG.syncDataTypeId
      }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))
    await transaction.commit()

    return [totalArbimonDetectionBySiteSpeciesHour, detectionDataBySiteSpeciesHourArbimon]
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const writeDetectionBySiteSpeciesHourBatch = async (biodiversitySequelize: Sequelize, totalArbimonDetection: number, detectionArbimon: DetectionArbimon[]): Promise<boolean> => {
  // =========== Output ==========
  // group detection by site, species and hour
  const detectionBySiteSpeciesHour = await mapDetectionBySiteSpeciesHourArbimonWithPrevSync(detectionArbimon, biodiversitySequelize)

  if (totalArbimonDetection === 0) {
    // write detection by site, species and hour to bio db
    const [insertSuccess, insertErrors] = await writeDetectionBySiteSpeciesHourToBio(detectionBySiteSpeciesHour, biodiversitySequelize)
    const transaction = await biodiversitySequelize.transaction()

    // =========== Sync logs ==========
    try {
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

      await transaction.commit()
      return true
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } else return false
}

export const resyncArbimonDetectionBySiteSpeciesHourBatch = async (projectId: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  let index = 0
  async function getData (): Promise<void> {
    const offset = SYNC_CONFIG.syncBatchLimit * index
    const [totalArbimonDetection, detectionArbimon] = await syncArbimonDetection(projectId, offset, arbimonSequelize, biodiversitySequelize)
    const isArbimonDetectionBySiteSpeciesHourUpToDate = await writeDetectionBySiteSpeciesHourBatch(biodiversitySequelize, totalArbimonDetection, detectionArbimon)
    if (!isArbimonDetectionBySiteSpeciesHourUpToDate) {
      index++
      await getData()
    }
  }
  await getData()
}

export const deleteArbimonDetectionBySiteSpeciesHour = async (projectId: number, sequelize: Sequelize): Promise<void> => {
  await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.destroy({ where: { locationProjectId: projectId } })
}
