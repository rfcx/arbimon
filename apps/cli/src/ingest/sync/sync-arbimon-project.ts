import { partition } from 'lodash-es'
import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getArbimonProjects } from '@/ingest/inputs/get-arbimon-projects'
import { writeProjectsToBio } from '@/ingest/outputs/projects'
import { createProjectVersionIfNeeded } from '../outputs/project-version'
import { writeSyncError } from '../outputs/sync-error'
import { writeSyncResult } from '../outputs/sync-status'
import { parseProjectArbimonToBio } from '../parsers/parse-project-arbimon-to-bio'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.ArbimonValidated.id,
  syncDataTypeId: masterSyncDataTypes.Project.id,
  syncBatchLimit: 1000
}

export const syncArbimonProjectsBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  const arbimonProjects = await getArbimonProjects(arbimonSequelize, syncStatus)
  if (arbimonProjects.length === 0) return syncStatus

  const [projects, validationErrors] = partition(arbimonProjects.map(parseProjectArbimonToBio), p => p.success)
  const projectData = projects.map(p => p.data)

  // Write projects to Bio
  const insertErrors = await writeProjectsToBio(projectData, biodiversitySequelize)
  const transaction = await biodiversitySequelize.transaction()
  try {
    // Create all missing project versions
    await createProjectVersionIfNeeded(biodiversitySequelize, transaction)

    // Update sync status
    const lastSyncdProject = arbimonProjects[projectData.length - 1]
    const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: lastSyncdProject.updatedAt, syncUntilId: lastSyncdProject.idArbimon }
    await writeSyncResult(updatedSyncStatus, biodiversitySequelize, transaction)

    // TODO: Log sync errors #809
    /* if (validationErrors.length > 0) {
      await Promise.all(validationErrors.map(async e => {
        const error = {
          externalId: 'TODO: find this from zod error',
          error: 'ValidationError',
          syncSourceId: updatedSyncStatus.syncDataTypeId,
          syncDataTypeId: updatedSyncStatus.syncDataTypeId
        }
        await writeSyncError(error, biodiversitySequelize, transaction)
      }))
    } */

    await Promise.all(insertErrors.map(async e => {
      const error = { ...e, syncSourceId: updatedSyncStatus.syncDataTypeId, syncDataTypeId: updatedSyncStatus.syncDataTypeId }
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

export const syncArbimonProjects = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  let syncStatus = await ModelRepository.getInstance(getSequelize())
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

  while (true) {
    const updatedSyncStatus = await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
    if (syncStatus.syncUntilDate === updatedSyncStatus.syncUntilDate && syncStatus.syncUntilId === updatedSyncStatus.syncUntilId) return
    syncStatus = updatedSyncStatus
  }
}

export const syncArbimonProjectsByIds = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, arbimonProjectIds: number[]): Promise<void> => {
  // TODO: Implement
}

export const syncArbimonProjectsThatFailed = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  // TODO: Lookup failures in sync_error table (in batches)
  // TODO: Call syncArbimonProjectsByIds
}
