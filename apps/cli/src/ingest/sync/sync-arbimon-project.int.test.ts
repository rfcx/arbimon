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
  sourceId: masterSources.ArbimonValidated.id,
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
          where: { sourceId: SYNC_CONFIG.sourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
          raw: true
        }) ?? getDefaultSyncStatus(SYNC_CONFIG)

      // Act
      await syncArbimonProjectsBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

      // Assert
      // - Assert valid projects are in Bio projects table
      const projects = await ModelRepository.getInstance(biodiversitySequelize).Project.findAll({
        where: { idArbimon: { [Op.in]: [1920, 1921] } }
      })
      expect(projects.length).toBe(2)

      // - Assert new project version
      const projectVersions = await ModelRepository.getInstance(biodiversitySequelize).ProjectVersion.findAll({
        where: { projectId: { [Op.in]: projects.map(p => p.id) } }
      })
      expect(projectVersions.length).toBe(2)
    })

    test.todo('can sync projects when some invalid', async () => {
      // Arrange
      // TODO: add invalid data to arbimon database
      // Act

      // Assert
      // TODO: Assert valid projects are in Bio projects table
      // TODO: Assert invalid projects are in Bio sync_error table
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
