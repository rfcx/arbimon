import { Op } from 'sequelize'
import { describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { syncArbimonProjectsBatch } from './sync-arbimon-project'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.ArbimonValidated.id,
  syncDataTypeId: masterSyncDataTypes.Project.id,
  syncBatchLimit: 2
}

describe('ingest > sync', () => {
  describe('syncArbimonProjectsBatch', () => {
    test('can sync projects', async () => {
      // Arrange
      const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
        .SyncStatus
        .findOne({
          where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
          raw: true
        }) ?? getDefaultSyncStatus(SYNC_CONFIG)

      // Act
      await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

      // Assert
      // - Assert valid projects are in Bio projects table
      const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
        where: { idArbimon: { [Op.in]: [1920, 1921] } }
      })
      expect(projects.length).toBe(2)

      // - Assert new project version
      const projectVersions = await ModelRepository.getInstance(biodiversitySequelize).ProjectVersion.findAll({
        where: { locationProjectId: { [Op.in]: projects.map(p => p.id) } }
      })
      expect(projectVersions.length).toBe(2)
    })

    test('can sync projects when some invalid', async () => {
      // Arrange
      const idArbimon = 1929
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
        ($idArbimon, 'RFCx 8', 'rfcx-8', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvwds', 0, '2021-04-20T12:01:00.000Z', '2021-04-20T12:00:00.000Z', NULL, NULL, 1),
        (1930, 'RFCx 9', 'rfcx-9', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvw', 0, '2021-04-20T12:01:00.000Z', '2021-04-20T12:00:00.000Z', NULL, NULL, 1)
      ;
      `
      await arbimonSequelize.query(insertNewRowWithTooLongIdCoreSqlStatement, { bind: { idArbimon } })

      // Act
      await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

      // Assert
      // TODO: Assert valid projects are in Bio projects table
      const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
        where: { idArbimon: { [Op.in]: [1930, idArbimon] } }
      })
      expect(projects.length).toBe(1)
      // TODO: Assert invalid projects are in Bio sync_error table
      const syncError = await ModelRepository.getInstance(biodiversitySequelize).SyncError.findOne({
        where: {
          syncSourceId: SYNC_CONFIG.syncSourceId,
          syncDataTypeId: SYNC_CONFIG.syncDataTypeId,
          externalId: `${idArbimon}`
        }
      })
      expect(syncError).toBeInstanceOf(Object)
    })

    test.todo('sync is idempotent', async () => {
      // Arrange

      // Act
      // TODO: Run the same batch twice

      // Assert
      // TODO: Assert result is the same as if we ran sync once
    })

    test.todo('updates sync status with last ID and updatedAt', async () => { })
    test.todo('returns sync status (to support immediately looping)', async () => { })
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
