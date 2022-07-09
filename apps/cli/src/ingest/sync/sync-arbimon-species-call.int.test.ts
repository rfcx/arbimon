import { Op } from 'sequelize'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, Site, SyncStatus, TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { writeProjectsToBio } from '../outputs/projects'
import { syncArbimonSpeciesCallBatch } from './sync-arbimon-species-call'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.SpeciesCall.id,
  syncBatchLimit: 4
}
const SQL_INSERT_TEMPLATE = `
  INSERT INTO templates (template_id, project_id, recording_id, species_id, songtype_id, name, uri, x1, y1, x2, y2, date_created, deleted, source_project_id, user_id)
  VALUES ($templateId, $projectId, $recordingId, $speciesId, $songtypeId, $name, $uri, $x1, $y1, $x2, $y2, $dateCreated, $deleted, $sourceProjectId, $userId);
`
const DEFAULT_TEMPLATE = { templateId: 975, projectId: 1920, recordingId: 7047504, speciesId: 1050, songtypeId: 1, name: 'Falco', uri: 'project_1920/templates/970.png', x1: 75.24309455587392, y1: 469.36114732724906, x2: 80.86693409742121, y2: 2252.9335071707956, dateCreated: '2022-03-27 07:31:11', deleted: 0, sourceProjectId: null, userId: 1017 }

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

// const idsArbimonObject = (ids: number[]): Record<string, number> => ids.reduce((acc, id, index) => { return { ...acc, [`idArbimon${index + 1}`]: id } }, {})

describe('ingest > sync', () => {
  beforeAll(async () => {
    // Batch species
    const SPECIES_INPUT: Array<Omit<TaxonSpecies, 'id'>> = [{
      idArbimon: 74,
      slug: 'crypturellus-boucardi',
      taxonClassId: 300,
      scientificName: 'Crypturellus boucardi'
    },
    {
      idArbimon: 3842,
      slug: 'merops-orientalis',
      taxonClassId: 300,
      scientificName: 'Merops orientalis'
    }
  ]

    await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate(SPECIES_INPUT)

    // Batch species calls
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: DEFAULT_TEMPLATE })
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, templateId: 976, dateCreated: '2022-03-28 07:31:11' } })
  })
  beforeEach(async () => {
    await biodiversitySequelize.query('DELETE FROM taxon_species_call')
    await deleteOutputProjects(biodiversitySequelize)
    await biodiversitySequelize.query('DELETE FROM sync_status')
    await biodiversitySequelize.query('DELETE FROM sync_error')
    // Batch project data
    const PROJECT_INPUT: Omit<Project, 'id'> = {
      idArbimon: 1920,
      idCore: '807cuoi3cvw0',
      slug: 'rfcx-1',
      name: 'rfcx 1',
      latitudeNorth: 0,
      latitudeSouth: 0,
      longitudeEast: 0,
      longitudeWest: 0
    }
    await writeProjectsToBio([PROJECT_INPUT], biodiversitySequelize)
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: PROJECT_INPUT.idArbimon } })

    if (!project) return

    const ID_PROJECT = project.id

    // Batch site data
    const SITE_INPUT: Omit<Site, 'id'> = {
      idCore: 'cydwrzz91cbz',
      idArbimon: 88528,
      locationProjectId: ID_PROJECT,
      name: 'Site 3',
      latitude: 16.742010693566815,
      longitude: 100.1923308193772,
      altitude: 0.0
    }

    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([SITE_INPUT])
  })
  afterAll(async () => {
    await biodiversitySequelize.query('DELETE FROM taxon_species_call')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (74, 3842, 12675, 42251)')
  })

  describe('syncArbimonSpeciesCallBatch', () => {
    const IDS_ARBIMON_FIRST_BATCH = [970, 971, 972, 973]
    const IDS_ARBIMON_SECOND_BATCH = [974, 975, 976]

    test.todo('can sync species calls of a first batch', async () => {
      // Arrange
      const SYNC_STATUS = await getSyncStatus()

      // Act
      const UPDATED_SYNC_STATUS = await syncArbimonSpeciesCallBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)

      // Assert

      // - Assert write species calls bio is returning sync status of a first batch
      expect(UPDATED_SYNC_STATUS).toBeTypeOf('object')

      // - Assert valid species are in Bio taxon species table of the first batch
      const speciesCalls = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesCall.findAll({
        where: { idArbimon: { [Op.in]: IDS_ARBIMON_FIRST_BATCH } }
      })
      expect(speciesCalls.length).toBe(4)

      // - Assert update sync status of the first batch
      await expectLastSyncIdInSyncStatusToBe(IDS_ARBIMON_FIRST_BATCH[IDS_ARBIMON_FIRST_BATCH.length - 1])
    })

    test.todo('where syncUntilId = latest id of a new batch', async () => {
      // Arrange
      const SYNC_STATUS = await getSyncStatus()

      // Act
      const UPDATED_SYNC_STATUS_FIRST_BATCH = await syncArbimonSpeciesCallBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)
      const SYNC_STATUS_SECOND_BATCH = await getSyncStatus()
      const UPDATED_SYNC_STATUS_SECOND_BATCH = await syncArbimonSpeciesCallBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS_SECOND_BATCH)

      // Assert

      // - Assert write species bio is returning sync status of the new batch
      expect(UPDATED_SYNC_STATUS_FIRST_BATCH).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS_SECOND_BATCH).toBeTypeOf('object')

      // - Assert valid species are in Bio taxon species table of the new batch
      const calls = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesCall.findAll({
        where: { idArbimon: { [Op.in]: IDS_ARBIMON_SECOND_BATCH } }
      })
      expect(calls.length).toBe(3)

      // - Assert update sync status of the new batch
      await expectLastSyncIdInSyncStatusToBe(IDS_ARBIMON_SECOND_BATCH[IDS_ARBIMON_SECOND_BATCH.length - 1])
    })

    test.todo('where sync is up-to-date', async () => {
      // Arrange
      const SYNC_STATUS = getDefaultSyncStatus({ ...SYNC_CONFIG, syncBatchLimit: 7 })
      const IDS_ARBIMON_FULL_BATCH = [...IDS_ARBIMON_FIRST_BATCH, ...IDS_ARBIMON_SECOND_BATCH]

      // Act
      const UPDATED_SYNC_STATUS_FIRST_BATCH = await syncArbimonSpeciesCallBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)
      const SYNC_STATUS_SECOND_BATCH = await getSyncStatus()
      const UPDATED_SYNC_STATUS_SECOND_BATCH = await syncArbimonSpeciesCallBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS_SECOND_BATCH)

      // Assert

      // - Assert write species bio is returning sync status of the new batch
      expect(UPDATED_SYNC_STATUS_FIRST_BATCH).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS_SECOND_BATCH).toBeTypeOf('object')

      // - Assert valid species are in Bio taxon species table of the new batch
      const calls = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesCall.findAll({
        where: { idArbimon: { [Op.in]: IDS_ARBIMON_FULL_BATCH } }
      })
      expect(calls.length).toBe(7)

      // - Assert update sync status of the new batch
      await expectLastSyncIdInSyncStatusToBe(IDS_ARBIMON_FULL_BATCH[IDS_ARBIMON_FULL_BATCH.length - 1])
    })

    test.todo('sync status is updated', async () => {
      // Arrange
      const SYNC_STATUS = getDefaultSyncStatus(SYNC_CONFIG)

      // Act
      const UPDATED_SYNC_STATUS = await syncArbimonSpeciesCallBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)

      const SEARCHED_SYNC_STATUS = await ModelRepository.getInstance(biodiversitySequelize)
        .SyncStatus
        .findOne({
          where: { syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
          raw: true
        })

      // Assert
      expect(SEARCHED_SYNC_STATUS?.syncUntilId).toBe(UPDATED_SYNC_STATUS.syncUntilId)
    })

    test.todo('species calls sync log is created', async () => {
      // Arrange
      const SYNC_STATUS = getDefaultSyncStatus(SYNC_CONFIG)
      await syncArbimonSpeciesCallBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)

      // Act
      const SYNC_LOG = await ModelRepository.getInstance(biodiversitySequelize).SyncLogByProject.findOne({
        where: { syncDataTypeId: SYNC_CONFIG.syncDataTypeId, syncSourceId: SYNC_CONFIG.syncSourceId },
        order: [['createdAt', 'DESC']],
        raw: true
      })

      // Assert
      expect(SYNC_LOG).toBeDefined()
      expect(SYNC_LOG?.delta).toBe(IDS_ARBIMON_FIRST_BATCH.length)
    })
  })
})
