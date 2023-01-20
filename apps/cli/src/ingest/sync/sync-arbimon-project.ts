import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'

import { getArbimonProjects } from '@/ingest/inputs/get-arbimon-project'
import { writeProjectsToBio } from '@/ingest/outputs/projects'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncResult } from '../outputs/sync-status'
import { parseArray } from '../parsers/parse-array'
import { parseProjectArbimonToBio } from '../parsers/parse-project-arbimon-to-bio'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'
import { isSyncable } from './syncable'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Project.id,
  syncBatchLimit: 200000
}

export const syncArbimonProjectsBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  const arbimonProjects = await getArbimonProjects(arbimonSequelize, syncStatus)
  console.info('- syncArbimonProjectsBatch: from', syncStatus.syncUntilId, syncStatus.syncUntilDate)
  console.info('- syncArbimonProjectsBatch: found %d projects', arbimonProjects.length)
  // Exit early if nothing to sync
  if (arbimonProjects.length === 0) return syncStatus

  // Error if project doesn't contain needed sync status data
  const lastSyncdProject = arbimonProjects[arbimonProjects.length - 1]
  if (!isSyncable(lastSyncdProject)) throw new Error('Input does not contain needed sync-status data')

  // Parse input
  const [inputsAndOutputs, inputsAndParsingErrors] = parseArray(arbimonProjects, parseProjectArbimonToBio)
  const projectData = inputsAndOutputs.map(inputAndOutput => inputAndOutput[1].data)

  // Write projects to Bio
  const insertErrors = await writeProjectsToBio(projectData, biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()
  try {
    // Update sync status
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: lastSyncdProject.updatedAt, syncUntilId: lastSyncdProject.idArbimon.toString() }
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

    // commit transactions
    await transaction.commit()
    // return sync status
    return updatedSyncStatus
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export const syncArbimonProjects = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<boolean> => {
  const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

  const updatedSyncStatus = await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
  return (syncStatus.syncUntilDate === updatedSyncStatus.syncUntilDate && syncStatus.syncUntilId === updatedSyncStatus.syncUntilId)
      // || numberOfItemsSynced < syncStatus.syncBatchLimit
      // TODO: add number of syncd items as a response of syncArbimonProjectsBatch so that we can check the case above ☝️
}

export const syncArbimonProjectsByIds = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, arbimonProjectIds: number[]): Promise<void> => {
  // TODO: Implement
}

export const syncArbimonProjectsThatFailed = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  // TODO: Lookup failures in sync_error table (in batches)
  // TODO: Call syncArbimonProjectsByIds
}
