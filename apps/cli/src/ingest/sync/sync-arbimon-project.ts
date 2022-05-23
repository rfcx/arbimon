import { partition } from 'lodash-es'
import { Sequelize } from 'sequelize'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncStatus } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getArbimonProjects } from '@/ingest/inputs/get-arbimon-projects'
import { writeProjectsToBio } from '@/ingest/outputs/projects'
import { parseProjectArbimonToBio } from '../parsers/parse-project-arbimon-to-bio'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const SYNC_CONFIG: SyncConfig = {
  sourceId: masterSources.ArbimonValidated.id,
  syncDataTypeId: masterSyncDataTypes.Project.id,
  syncBatchLimit: 1000
}

export const syncArbimonProjectsBatch = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, syncStatus: SyncStatus): Promise<SyncStatus> => {
  const arbimonProjects = await getArbimonProjects(arbimonSequelize, syncStatus)
  if (arbimonProjects.length === 0) return syncStatus

  const [projects, validationErrors] = partition(arbimonProjects.map(parseProjectArbimonToBio), p => p.success)

  // TODO: Use a transaction
  await writeProjectsToBio(biodiversitySequelize, projects)
  // const insertErrors = await writeProjectsToBio(biodiversitySequelize, projects)
  console.log(validationErrors)
  // await writeErrorsToBio(validationErrors, insertErrors)

  const updatedSyncStatus: SyncStatus = { ...syncStatus, syncUntilDate: arbimonProjects[arbimonProjects.length - 1].updatedAt, syncUntilId: arbimonProjects[arbimonProjects.length - 1].id }
  // await writeSyncResult(updatedSyncStatus)

  return updatedSyncStatus
}

export const syncArbimonProjects = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize): Promise<void> => {
  let syncStatus = await ModelRepository.getInstance(getSequelize())
    .SyncStatus
    .findOne({
      where: { sourceId: SYNC_CONFIG.sourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
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
