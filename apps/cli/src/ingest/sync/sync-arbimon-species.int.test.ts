import { Op } from 'sequelize'
import { describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { syncArbimonSpeciesBatch } from './sync-arbimon-species'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Species.id,
  syncBatchLimit: 1000
}

describe('ingest > sync', () => {
  describe('syncArbimonSpeciesBatch', () => {
    test('can sync species', async () => {
      // Arrange
      const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
        .SyncStatus
        .findOne({
          where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
          raw: true
        }) ?? getDefaultSyncStatus(SYNC_CONFIG)

      // Act
      await syncArbimonSpeciesBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

      // Assert
      // - Assert valid species are in Bio taxon species table
      const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findAll({
        where: { idArbimon: { [Op.in]: [501, 1050] } }
      })
      expect(species.length).toBe(2)
    })
  })
})
