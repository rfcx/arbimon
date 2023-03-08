import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type SyncStatus } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { syncArbimonSpeciesBatch } from './sync-arbimon-species'
import { type SyncConfig, getDefaultSyncStatus } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Species.id,
  syncBatchLimit: 2
}

const INITIAL_INSERT_SQL = `
  INSERT INTO species (
    species_id, scientific_name, code_name, taxon_id, family_id, image, description,
    biotab_id, defined_by, created_at, updated_at
  )
  VALUES
    (12204,'Duttaphrynus melanostictus','DUTMEL',2,207,NULL,NULL,NULL,NULL,'2021-03-18T11:00:00.000Z','2021-03-21T11:00:00.000Z'),
    (12675,'Hemidactylium scutatum','HEMSCU',2,241,NULL,NULL,NULL,NULL,'2021-03-18T11:00:00.000Z','2021-03-20T11:00:00.000Z'),
    (16729,'Chiropotes satanas','CHISAT',5,258,NULL,NULL,0,NULL,'2021-03-18T11:00:00.000Z','2021-03-19T11:00:00.000Z'),
    (42251,'Aepyceros melampus',NULL,5,362,NULL,NULL,NULL,NULL,'2021-03-18T11:00:00.000Z','2021-03-18T11:00:00.000Z')
  ;
`

const getSyncStatus = async (): Promise<SyncStatus> => {
  const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)
  return syncStatus
}

const expectLastSyncIdInSyncStatusToBe = async (expectedSyncUntilId: number): Promise<void> => {
  // - Assert sync status time and id are updated to the latest
  const updatedSyncStatus = await getSyncStatus()
  expect(updatedSyncStatus?.syncUntilId).toBe(expectedSyncUntilId.toString())
}

const idsArbimonObject = (ids: number[]): Record<string, number> => ids.reduce((acc, id, index) => { return { ...acc, [`idArbimon${index + 1}`]: id } }, {})

describe('ingest > sync', () => {
  beforeEach(async () => {
    // Delete species before testing
    await arbimonSequelize.query('DELETE FROM species')
    await biodiversitySequelize.query('DELETE FROM taxon_species_rfcx')
    await biodiversitySequelize.query('DELETE FROM sync_status')
    await biodiversitySequelize.query('DELETE FROM sync_error')
  })
  describe('syncArbimonSpeciesBatch', () => {
    const IDS_ARBIMON_FIRST_BATCH = [42251, 16729]
    const IDS_ARBIMON_SECOND_BATCH = [12675, 12204]
    test('can sync species of a first batch', async () => {
      // Arrange
      const SYNC_STATUS = await getSyncStatus()
      await arbimonSequelize.query(INITIAL_INSERT_SQL)

      // Act
      const UPDATED_SYNC_STATUS = await syncArbimonSpeciesBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)

      // Assert

      // - Assert write species bio is returning sync status of a first batch
      expect(UPDATED_SYNC_STATUS).toBeTypeOf('object')

      // - Assert valid species are in Bio taxon species table of the first batch
      const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findAll({
        where: { idArbimon: { [Op.in]: IDS_ARBIMON_FIRST_BATCH } }
      })
      expect(species).toHaveLength(2)

      // - Assert update sync status of the first batch
      await expectLastSyncIdInSyncStatusToBe(IDS_ARBIMON_FIRST_BATCH[IDS_ARBIMON_FIRST_BATCH.length - 1])
    })

    test('where syncUntilId = latest id of a new batch', async () => {
      // Arrange
      const SYNC_STATUS = await getSyncStatus()
      await arbimonSequelize.query(INITIAL_INSERT_SQL)

      // Act
      const UPDATED_SYNC_STATUS_FIRST_BATCH = await syncArbimonSpeciesBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)
      const SYNC_STATUS_SECOND_BATCH = await getSyncStatus()
      const UPDATED_SYNC_STATUS_SECOND_BATCH = await syncArbimonSpeciesBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS_SECOND_BATCH)

      // Assert

      // - Assert write species bio is returning sync status of the new batch
      expect(UPDATED_SYNC_STATUS_FIRST_BATCH).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS_SECOND_BATCH).toBeTypeOf('object')

      // - Assert valid species are in Bio taxon species table of the new batch
      const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findAll({
        where: { idArbimon: { [Op.in]: IDS_ARBIMON_SECOND_BATCH } }
      })
      expect(species).toHaveLength(2)

      // - Assert update sync status of the new batch
      await expectLastSyncIdInSyncStatusToBe(IDS_ARBIMON_SECOND_BATCH[IDS_ARBIMON_SECOND_BATCH.length - 1])
    })

    test('where sync is up-to-date', async () => {
      // Arrange
      const SYNC_STATUS = getDefaultSyncStatus({ ...SYNC_CONFIG, syncBatchLimit: 4 })
      const IDS_ARBIMON_FULL_BATCH = [...IDS_ARBIMON_FIRST_BATCH, ...IDS_ARBIMON_SECOND_BATCH]
      await arbimonSequelize.query(INITIAL_INSERT_SQL)

      // Act
      // Run the same batch twice
     await syncArbimonSpeciesBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)
     await syncArbimonSpeciesBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)

      // Assert
      // - Assert valid species are in Bio taxon species table
      const expectedSpecies = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findAll({
        where: { idArbimon: { [Op.in]: IDS_ARBIMON_FULL_BATCH } }
      })
      expect(expectedSpecies).toHaveLength(4)

      // - Assert update sync status of the same batch twice
      await expectLastSyncIdInSyncStatusToBe(IDS_ARBIMON_FULL_BATCH[IDS_ARBIMON_FULL_BATCH.length - 1])
    })
  })

  test('can not sync species when a taxon_id is invalid', async () => {
    // Arrange
    const SYNC_STATUS = await getSyncStatus()
    const ID_ARBIMON = 1111111
    const INSERT_SQL = `
      INSERT INTO species (
        species_id, scientific_name, code_name, taxon_id, family_id, image, description,
        biotab_id, defined_by, created_at, updated_at
      )
      VALUES
      (${ID_ARBIMON},'Carpodacus erythrinus not valid','CARERY',222222,189,NULL,NULL,NULL,NULL,'2021-03-18T11:00:00.000Z','2021-03-22T11:00:00.000Z')
      ;
    `
    await arbimonSequelize.query(INSERT_SQL)

    // Act
    await syncArbimonSpeciesBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)

    // Assert
    const notExpectedSpecies = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findAll({
      where: { idArbimon: { [Op.eq]: ID_ARBIMON } }
    })
    expect(notExpectedSpecies).toHaveLength(0)
  })

  test.todo('write sync error when a slug is not unique', async () => {
    // Arrange
    const SYNC_STATUS = await getSyncStatus()
    const IDS_ARBIMON = [9620, 9621]
    const INSERT_SQL = `
      INSERT INTO species (
        species_id, scientific_name, code_name, taxon_id, family_id, image, description,
        biotab_id, defined_by, created_at, updated_at
      )
      VALUES
      ($idArbimon1,'Carpodacus erythrinus test','CARERY',1,189,NULL,NULL,NULL,NULL,'2021-03-18T11:00:00.000Z','2021-03-22T11:00:00.000Z'),
      ($idArbimon2,'Carpodacus erythrinus test','CARERY',1,189,NULL,NULL,NULL,NULL,'2021-03-18T11:00:00.000Z','2021-03-22T11:00:00.000Z')
      ;
    `

    // Act & Assert
    await arbimonSequelize.query(INSERT_SQL, { bind: idsArbimonObject(IDS_ARBIMON) })
    await syncArbimonSpeciesBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)
    const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findAll({
      where: { idArbimon: { [Op.in]: IDS_ARBIMON } }
    })
    const syncError = await ModelRepository.getInstance(biodiversitySequelize).SyncError.findOne({
      where: {
        syncSourceId: SYNC_CONFIG.syncSourceId,
        syncDataTypeId: SYNC_CONFIG.syncDataTypeId,
        externalId: IDS_ARBIMON[1].toString()
      }
    })
    expect(species).toHaveLength(1)
    expect(syncError).toBeInstanceOf(Object)
  })
})
