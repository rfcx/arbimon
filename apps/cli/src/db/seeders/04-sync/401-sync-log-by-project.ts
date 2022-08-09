import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_SYNC_SOURCE } from '@rfcx-bio/common/dao/models/sync-source-model'
import { SyncDataType, SyncLogByProject, SyncSource } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'

export const masterSources = {
  Arbimon: { id: 100, name: 'Arbimon' }
} as const

const sources: readonly SyncSource[] = Object.values(masterSources)

export const testSyncDataType: SyncDataType[] = [
  {
    id: 100,
    name: 'Project'
  },
  {
    id: 200,
    name: 'Site'
  },
  {
    id: 300,
    name: 'Species'
  },
  {
    id: 400,
    name: 'Species Call'
  },
  {
    id: 500,
    name: 'Recording'
  },
  {
    id: 600,
    name: 'Detection'
  }
]

const rawSyncLogByProject: Array<Omit<SyncLogByProject, 'createdAt' | 'updatedAt'>> = [
  {
    id: 1,
    syncSourceId: 100,
    syncDataTypeId: 200,
    delta: 2,
    locationProjectId: 1
  },
  {
    id: 2,
    syncSourceId: 100,
    syncDataTypeId: 200,
    delta: 4,
    locationProjectId: 2
  },
  {
    id: 3,
    syncSourceId: 100,
    syncDataTypeId: 200,
    delta: 815,
    locationProjectId: 3
  },
  {
    id: 4,
    syncSourceId: 100,
    syncDataTypeId: 300,
    delta: 1,
    locationProjectId: 1
  },
  {
    id: 5,
    syncSourceId: 100,
    syncDataTypeId: 400,
    delta: 48,
    locationProjectId: 1
  }
]

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  const masterData = [
    { model: models.SyncSource, data: sources, updateOnDuplicate: UPDATE_ON_DUPLICATE_SYNC_SOURCE }
  ]

  for (const { model, data, updateOnDuplicate } of masterData) {
    await model.bulkCreate(data, { updateOnDuplicate })
  }

  await ModelRepository.getInstance(getSequelize())
    .SyncDataType
    .bulkCreate(testSyncDataType)

  await ModelRepository.getInstance(getSequelize())
    .SyncLogByProject
    .bulkCreate(rawSyncLogByProject)
}
