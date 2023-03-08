import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { syncArbimonProjectsBatch } from './sync-arbimon-project'
import { type SyncConfig, getDefaultSyncStatus } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Project.id,
  syncBatchLimit: 2
}

const SQL_INSERT_PROJECT = `
  INSERT INTO projects (project_id, name, url, description, project_type_id, is_private, is_enabled, current_plan, storage_usage, processing_usage, pattern_matching_enabled, citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled, external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled)
  VALUES ($projectId, $name, $url, $description, $projectTypeId, $isPrivate, $isEnabled, $currentPlan, $storageUsage, $processingUsage, $patternMatchingEnabled, $citizenScientistEnabled, $cnnEnabled, $aedEnabled, $clusteringEnabled, $externalId, $featured, $createdAt, $updatedAt, $deletedAt, $image, $reportsEnabled);
`
const SQL_UPDATE_PROJECT = `
  UPDATE projects SET is_private = $isPrivate, updated_at = $updatedAt, deleted_at = $deletedAt
  WHERE project_id = $projectId
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
      expect(projects).toHaveLength(2)

      // - Assert new project version got created
      const projectVersions = await ModelRepository.getInstance(biodiversitySequelize).ProjectVersion.findAll({
        where: { locationProjectId: { [Op.in]: projects.map(p => p.id) } }
      })
      expect(projectVersions).toHaveLength(2)

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
      expect(projects).toHaveLength(2)
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
      expect(projects).toHaveLength(1)
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
      expect(projects).toHaveLength(0)
      // - Assert invalid projects are in Bio sync_error table
      const syncError = await ModelRepository.getInstance(biodiversitySequelize).SyncError.findAll({
        where: {
          syncSourceId: SYNC_CONFIG.syncSourceId,
          syncDataTypeId: SYNC_CONFIG.syncDataTypeId,
          externalId: { [Op.in]: idsArbimon.map(i => `${i}`) }
        }
      })
      expect(syncError).toHaveLength(2)

      // - Assert sync status time and id are updated to the latest
      await expectLastSyncIdInSyncStatusToBe(idsArbimon[idsArbimon.length - 1])
    })

    test('can sync project which is reports_enabled=true', async () => {
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
      // - Assert 2 project is added in Bio projects table
      const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
        where: { idArbimon: { [Op.in]: idsArbimon } }
      })
      expect(projects).toHaveLength(2)

      // - Assert sync status time and id are updated for both projects
      await expectLastSyncIdInSyncStatusToBe(idsArbimon[1])
    })
  })

  test('can sync all projects which is reports_enabled=true', async () => {
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

    // Assert
    // - Assert 2 project added in Bio projects table
    expect(projects).toHaveLength(2)
    // - Assert not any project statuses in the syc status table
    await expectLastSyncIdInSyncStatusToBe(idsArbimon[1])
  })

  test('can sync deleted projects', async () => {
    // Arrange
    // Sync new projects
    const idsArbimon = [1933, 1934]
    const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1933, name: 'RFCx 10', url: 'rfcx-10', externalId: '807cuoi3c10', createdAt: '2021-04-20T12:01:00.000Z', updatedAt: '2021-04-20T12:01:00.000Z', deletedAt: null } })
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1934, name: 'RFCx 11', url: 'rfcx-11', externalId: '807cuoi3c11', createdAt: '2021-04-20T12:01:00.000Z', updatedAt: '2021-04-20T15:00:00.000Z', deletedAt: null } })

    // Check new projects
    await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)
    const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
      where: { idArbimon: { [Op.in]: idsArbimon } }
    })

    expect(projects).toHaveLength(2)
    await expectLastSyncIdInSyncStatusToBe(idsArbimon[1])

    const nextSyncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)

    // Act
    await arbimonSequelize.query(SQL_UPDATE_PROJECT, { bind: { projectId: 1933, isPrivate: 0, updatedAt: '2022-08-29T16:00:00.000Z', deletedAt: '2022-08-29T16:00:00.000Z' } })

    // Assert
    await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, nextSyncStatus)
    const result = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
      where: { idArbimon: 1933 }
    })

    expect(result).toHaveLength(0)
  })
})
