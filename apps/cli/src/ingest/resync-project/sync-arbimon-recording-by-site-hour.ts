import { groupBy } from 'lodash-es'
import { type Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'

import { getArbimonProjectRecording } from '../inputs/get-arbimon-recording'
import { mapRecordingBySiteHourArbimonWithPrevSync, writeRecordingBySiteHourToBio } from '../outputs/resync-recording-by-site-hour'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncLogByProject } from '../outputs/sync-log-by-project'
import { parseArray } from '../parsers/parse-array'
import { type RecordingArbimon, parseRecordingBySiteHourToBio } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'
import { type SyncConfig } from './sync-config'
import { isSyncable } from './syncable'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Recording.id,
  syncBatchLimit: 100000
}

export const syncArbimonRecording = async (projectId: number, offset: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<[number, RecordingArbimon[]]> => {
  // =========== Input ==========
  const arbimonRecordingBySiteHour = await getArbimonProjectRecording(arbimonSequelize, projectId, SYNC_CONFIG.syncBatchLimit, offset)
  const totalArbimonRecordingBySiteHour = arbimonRecordingBySiteHour.length

  console.info('- syncArbimonRecordingBySiteHourBatch: offset', offset)
  console.info('- syncArbimonRecordingBySiteHourBatch: found %d recordings', totalArbimonRecordingBySiteHour)

  if (totalArbimonRecordingBySiteHour === 0) return [totalArbimonRecordingBySiteHour, []]

  const lastSyncRecording = arbimonRecordingBySiteHour[arbimonRecordingBySiteHour.length - 1] // already last uploaded item because query order by it
  if (!isSyncable(lastSyncRecording)) throw new Error('Input does not contain needed sync-status data')

  // =========== Parser ==========
  // unknown to expected format
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonRecordingBySiteHour, parseRecordingBySiteHourToBio)
  const recordingDataBySiteHourArbimon = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)
  console.info('\n\n---1-----recordingDataBySiteHourArbimon---', recordingDataBySiteHourArbimon)

  // =========== Sync logs ==========
  const transaction = await biodiversitySequelize.transaction()
  try {
    // sync error
    await Promise.all(inputsAndParsingErrors.map(async e => {
      const idArbimon = isSyncable(e[0]) ? e[0].idArbimon : 'unknown'
      const error = {
        externalId: `${idArbimon}`,
        error: 'ValidationError: ' + JSON.stringify(e[1].error.issues),
        syncSourceId: SYNC_CONFIG.syncSourceId,
        syncDataTypeId: SYNC_CONFIG.syncDataTypeId
      }
      await writeSyncError(error, biodiversitySequelize, transaction)
    }))
    await transaction.commit()

    return [totalArbimonRecordingBySiteHour, recordingDataBySiteHourArbimon]
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const writeRecordingSiteHourBatch = async (biodiversitySequelize: Sequelize, totalArbimonRecordingBySiteHour: number, recordingDataBySiteHourArbimon: RecordingArbimon[]): Promise<boolean> => {
  // =========== Output ==========
  // group recordings by site, hour
  const recordingBySiteHour = await mapRecordingBySiteHourArbimonWithPrevSync(recordingDataBySiteHourArbimon, biodiversitySequelize)
  if (totalArbimonRecordingBySiteHour === 0) {
    // write recordings by site, hour to bio db
    const [insertSuccesses, insertErrors] = await writeRecordingBySiteHourToBio(recordingBySiteHour, biodiversitySequelize)
    const transaction = await biodiversitySequelize.transaction()

    // =========== Sync logs ==========
    try {
      // insert error
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
      return true
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } else return false
}

export const resyncArbimonRecordingBySiteHourBatch = async (projectId: number, arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  let index = 0
  async function getData (): Promise<void> {
    const offset = SYNC_CONFIG.syncBatchLimit * index
    const [totalArbimonRecordingBySiteHour, recordingDataBySiteHourArbimon] = await syncArbimonRecording(projectId, offset, arbimonSequelize, biodiversitySequelize)
    const isArbimonRecordingBySiteHourSyncedUpToDate = await writeRecordingSiteHourBatch(biodiversitySequelize, totalArbimonRecordingBySiteHour, recordingDataBySiteHourArbimon)
    if (!isArbimonRecordingBySiteHourSyncedUpToDate) {
      index++
      await getData()
    }
  }
  await getData()
}
