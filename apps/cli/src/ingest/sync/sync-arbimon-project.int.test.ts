import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { syncArbimonProjectsBatch } from './sync-arbimon-project'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Project.id,
  syncBatchLimit: 2
}

const SQL_INSERT_PROJECT = `
  INSERT INTO projects (project_id, name, url, description, project_type_id, is_private, is_enabled, current_plan, storage_usage, processing_usage, pattern_matching_enabled, citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled, external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled)
  VALUES ($projectId, $name, $url, $description, $projectTypeId, $isPrivate, $isEnabled, $currentPlan, $storageUsage, $processingUsage, $patternMatchingEnabled, $citizenScientistEnabled, $cnnEnabled, $aedEnabled, $clusteringEnabled, $externalId, $featured, $createdAt, $updatedAt, $deletedAt, $image, $reportsEnabled);
`
const DEFAULT_PROJECT = { projectId: 1920, createdAt: '2021-03-20T12:01:00.000Z', updatedAt: '2021-03-20T15:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuodd', featured: 0, image: null, reportsEnabled: 1 }

const expectLastSyncIdInSyncStatusToBe = async (expectedSyncUntilId: number): Promise<void> => {
  // - Assert sync status time and id are updated to the latest
  const updatedSyncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    })
  expect(updatedSyncStatus?.syncUntilId).toBe(expectedSyncUntilId.toString())
}

describe('ingest > sync', () => {
  beforeEach(async () => {
    await deleteOutputProjects(biodiversitySequelize)
    await arbimonSequelize.query('DELETE FROM projects')
    await biodiversitySequelize.query('DELETE FROM sync_status')
    await biodiversitySequelize.query('DELETE FROM sync_error')
  })
  describe('syncArbimonProjectsBatch', () => {
    test('can sync projects', async () => {
      // Arrange
      const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
        .SyncStatus
        .findOne({
          where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
          raw: true
        }) ?? getDefaultSyncStatus(SYNC_CONFIG)

      const idsArbimon = [1920, 1921]
      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1921, name: 'RFCx 2', url: 'rfcx-2', externalId: '807cuoi3cdd' } })

      // Act
      const updatedSyncStatus = await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

      // Assert

      // - Assert write project bio is returning sync status
      expect(updatedSyncStatus).toBeTypeOf('object')

      // - Assert valid projects are in Bio projects table
      const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
        where: { idArbimon: { [Op.in]: idsArbimon } }
      })
      expect(projects.length).toBe(2)

      // - Assert new project version got created
      const projectVersions = await ModelRepository.getInstance(biodiversitySequelize).ProjectVersion.findAll({
        where: { locationProjectId: { [Op.in]: projects.map(p => p.id) } }
      })
      expect(projectVersions.length).toBe(2)

      // - Assert update sync status
      await expectLastSyncIdInSyncStatusToBe(idsArbimon[idsArbimon.length - 1])
    })

    test('sync is idempotent', async () => {
      // Arrange
      const syncStatus = getDefaultSyncStatus(SYNC_CONFIG)
      const idArbimons = [1920, 1921]
      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1921, name: 'RFCx 2', url: 'rfcx-2', externalId: '807cuoi3cdd' } })
      // await arbimonSequelize.query(INITIAL_INSERT_SQL)

      // Act
      // Run the same batch twice
      await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
      await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

      // Assert
      // - Assert valid projects are in Bio projects table
      const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
        where: { idArbimon: { [Op.in]: idArbimons } }
      })
      expect(projects.length).toBe(2)
    })

    test('can sync projects when some invalid', async () => {
      // Arrange
      const idsArbimon = [1931, 1932]
      const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
      .SyncStatus
      .findOne({
        where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
        raw: true
      }) ?? getDefaultSyncStatus(SYNC_CONFIG)

      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1931, name: 'RFCx 8', url: 'rfcx-8', externalId: '807cuoi3cvwdkkk', createdAt: '2021-04-20T12:01:00.000Z', updatedAt: '2021-04-20T12:01:00.000Z' } })
      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1932, name: 'RFCx 9', url: 'rfcx-9', externalId: '807cuoi3cvw', createdAt: '2021-04-20T12:01:00.000Z', updatedAt: '2021-04-20T15:00:00.000Z' } })

      // Act
      await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

      // Assert
      // - Assert valid projects are in Bio projects table
      const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
        where: { idArbimon: { [Op.in]: idsArbimon } }
      })
      expect(projects.length).toBe(1)
      // - Assert invalid projects are in Bio sync_error table
      const syncError = await ModelRepository.getInstance(biodiversitySequelize).SyncError.findOne({
        where: {
          syncSourceId: SYNC_CONFIG.syncSourceId,
          syncDataTypeId: SYNC_CONFIG.syncDataTypeId,
          externalId: idsArbimon[0].toString()
        }
      })
      expect(syncError).toBeInstanceOf(Object)
      // - Assert sync status time and id are updated to the latest
      await expectLastSyncIdInSyncStatusToBe(idsArbimon[idsArbimon.length - 1])
    })

    test('can sync projects when all is invalid', async () => {
      // Arrange
      const idsArbimon = [1931, 1932]
      const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
      .SyncStatus
      .findOne({
        where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
        raw: true
      }) ?? getDefaultSyncStatus(SYNC_CONFIG)

      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1931, name: 'RFCx 8', url: 'rfcx-8', externalId: '807cuoi3cvwdkkk', createdAt: '2021-04-20T12:01:00.000Z', updatedAt: '2021-04-20T12:01:00.000Z' } })
      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1932, name: 'RFCx 9', url: 'rfcx-9', externalId: null, createdAt: '2021-04-20T12:01:00.000Z', updatedAt: '2021-04-20T15:00:00.000Z' } })

      // Act
      await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

      // Assert
      // - Assert 0 project added in Bio projects table
      const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
        where: { idArbimon: { [Op.in]: idsArbimon } }
      })
      expect(projects.length).toBe(0)
      // - Assert invalid projects are in Bio sync_error table
      const syncError = await ModelRepository.getInstance(biodiversitySequelize).SyncError.findAll({
        where: {
          syncSourceId: SYNC_CONFIG.syncSourceId,
          syncDataTypeId: SYNC_CONFIG.syncDataTypeId,
          externalId: { [Op.in]: idsArbimon.map(i => `${i}`) }
        }
      })
      expect(syncError.length).toBe(2)

      // - Assert sync status time and id are updated to the latest
      await expectLastSyncIdInSyncStatusToBe(idsArbimon[idsArbimon.length - 1])
    })

    test('do not sync project which is not enabled', async () => {
      // Arrange
      const idsArbimon = [1931, 1932]
      const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
      .SyncStatus
      .findOne({
        where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
        raw: true
      }) ?? getDefaultSyncStatus(SYNC_CONFIG)

      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1931, name: 'RFCx 8', url: 'rfcx-8', externalId: '807cuoi3cdd', createdAt: '2021-04-20T12:01:00.000Z', updatedAt: '2021-04-20T12:01:00.000Z', reportsEnabled: 1 } })
      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1932, name: 'RFCx 9', url: 'rfcx-9', externalId: '807cuoi3cdf', createdAt: '2021-04-20T12:01:00.000Z', updatedAt: '2021-04-20T15:00:00.000Z', reportsEnabled: 0 } })

      // Act
      await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

      // Assert
      // - Assert 1 project is added in Bio projects table
      const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
        where: { idArbimon: { [Op.in]: idsArbimon } }
      })
      expect(projects.length).toBe(1)

      // - Assert sync status time and id are updated only for the eabled project
      await expectLastSyncIdInSyncStatusToBe(idsArbimon[0])
    })
  })

  test('do not sync if all projects are not enabled', async () => {
    // Arrange
    const idsArbimon = [1931, 1932]
    const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1931, name: 'RFCx 8', url: 'rfcx-8', externalId: '807cuoi3cdd', createdAt: '2021-04-20T12:01:00.000Z', updatedAt: '2021-04-20T12:01:00.000Z', reportsEnabled: 0 } })
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1932, name: 'RFCx 9', url: 'rfcx-9', externalId: '807cuoi3cdf', createdAt: '2021-04-20T12:01:00.000Z', updatedAt: '2021-04-20T15:00:00.000Z', reportsEnabled: 0 } })

    // Act
    await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
    const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
      where: { idArbimon: { [Op.in]: idsArbimon } }
    })
    const updatedSyncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    })

    // Assert

    // - Assert 0 project added in Bio projects table
    expect(projects.length).toBe(0)
    // - Assert not any project statuses in the syc status table
    expect(updatedSyncStatus).toBeNull()
  })
})
