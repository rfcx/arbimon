import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../outputs/helper'
import { syncArbimonProjectsBatch } from './sync-arbimon-project'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Project.id,
  syncBatchLimit: 2
}

const INITIAL_INSERT_SQL = `
  INSERT INTO projects (
    project_id, name, url, description, project_type_id, is_private, is_enabled,
    current_plan, storage_usage, processing_usage, pattern_matching_enabled,
    citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled,
    external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled
  )
  VALUES 
    (1920, 'RFCx 1', 'rfcx-1', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuodd', 0, '2021-03-20T12:01:00.000Z', '2021-03-20T15:00:00.000Z', NULL, NULL, 1),
    (1921, 'RFCx 2', 'rfcx-2', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cdd', 0, '2021-03-20T12:01:00.000Z', '2021-03-20T15:00:00.000Z', NULL, NULL, 1)
  ;
`

const idsArbimonObject = (ids: number[]): Record<string, number> => ids.reduce((acc, id, index) => { return { ...acc, [`idArbimon${index + 1}`]: id } }, {})

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
      await arbimonSequelize.query(INITIAL_INSERT_SQL)

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
      await arbimonSequelize.query(INITIAL_INSERT_SQL)

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
      const insertNewRowWithTooLongIdCoreSqlStatement = `
      INSERT INTO projects (
        project_id, name, url, description, project_type_id, is_private, is_enabled,
        current_plan, storage_usage, processing_usage, pattern_matching_enabled,
        citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled,
        external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled
      )
      VALUES 
        ($idArbimon1, 'RFCx 8', 'rfcx-8', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvwdkkk', 0, '2021-04-20T12:01:00.000Z', '2021-04-20T15:00:00.000Z', NULL, NULL, 1),
        ($idArbimon2, 'RFCx 9', 'rfcx-9', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvw', 0, '2021-04-20T12:01:00.000Z', '2021-04-20T15:00:00.000Z', NULL, NULL, 1)
      ;
      `
      await arbimonSequelize.query(insertNewRowWithTooLongIdCoreSqlStatement, { bind: idsArbimonObject(idsArbimon) })

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
      const insertNewRowWithTooLongIdCoreSqlStatement = `
      INSERT INTO projects (
        project_id, name, url, description, project_type_id, is_private, is_enabled,
        current_plan, storage_usage, processing_usage, pattern_matching_enabled,
        citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled,
        external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled
      )
      VALUES 
        ($idArbimon1, 'RFCx 8', 'rfcx-8', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvwdkkk', 0, '2021-04-20T12:01:00.000Z', '2021-04-20T15:00:00.000Z', NULL, NULL, 1),
        ($idArbimon2, 'RFCx 9', 'rfcx-9', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, NULL, 0, '2021-04-20T12:01:00.000Z', '2021-04-20T15:00:00.000Z', NULL, NULL, 1)
      ;
      `
      await arbimonSequelize.query(insertNewRowWithTooLongIdCoreSqlStatement, { bind: idsArbimonObject(idsArbimon) })

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
  })

  describe('syncArbimonProjects', () => {
    test.todo('can sync all projects', async () => { })
    test.todo('can sync all projects when some invalid', async () => { })
  })

  describe('syncArbimonProjectsByIds', () => {
    test.todo('can sync valid projects', async () => { })
    test.todo('can sync invalid projects', async () => { })
    test.todo('removes sync errors on successful sync', async () => { })
  })

  describe('syncArbimonProjectsThatFailed', () => {
    test.todo('can sync valid projects', async () => { })
  })
})
