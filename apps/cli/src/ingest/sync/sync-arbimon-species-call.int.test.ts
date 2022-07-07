import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, Site, SyncStatus } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { writeProjectsToBio } from '../outputs/projects'
import { syncArbimonSpeciesCallBatch } from './sync-arbimon-species-call'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'
import { deleteOutputProjects } from '../_testing/helper'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.SpeciesCall.id,
  syncBatchLimit: 2
}

const SQL_INSERT_TEMPLATE = `
  INSERT INTO templates (template_id, project_id, recording_id, species_id, songtype_id, name, uri, x1, y1, x2, y2, date_created, deleted, source_project_id, user_id)
  VALUES ($templateId, $projectId, $recordingId, $speciesId, $songtypeId, $name, $uri, $x1, $y1, $x2, $y2, $dateCreated, $deleted, $sourceProjectId, $userId);
`
const DEFAULT_TEMPLATE = { templateId: 970, projectId: 1920, recordingId: 7047505, speciesId: 1050, songtypeId: 1, name: 'Falco', uri: 'project_1920/templates/970.png', x1: 75.24309455587392, y1: 469.36114732724906, x2: 80.86693409742121, y2: 2252.9335071707956, dateCreated: '2022-03-22 07:31:11', deleted: 0, sourceProjectId: null, userId: 1017 }

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

  describe('syncArbimonSpeciesCallBatch', () => {
    test('can sync species calls of a first batch', async () => {
      // Arrange
      await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: DEFAULT_TEMPLATE })
      const ID_ARBIMON_FIRST_BATCH = 970
      const SYNC_STATUS = await getSyncStatus()

      // Act
      const UPDATED_SYNC_STATUS = await syncArbimonSpeciesCallBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)

      // Assert

      // - Assert write species calls bio is returning sync status of a first batch
      expect(UPDATED_SYNC_STATUS).toBeTypeOf('object')

      // - Assert valid species are in Bio taxon species table of the first batch
      const speciesCalls = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesCall.findAll({
        where: { idArbimon: ID_ARBIMON_FIRST_BATCH }
      })

      expect(speciesCalls.length).toBe(1)

      // - Assert update sync status of the first batch
      await expectLastSyncIdInSyncStatusToBe(ID_ARBIMON_FIRST_BATCH)
    })

    test.todo('where syncUntilId = latest id of a new batch', async () => {
      // Arrange
      await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: DEFAULT_TEMPLATE })
      await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, templateId: 971, speciesId: 3842, name: 'Merops orientalis Common Song', dateCreated: '2022-03-23 03:05:37' } })
      await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, templateId: 972, speciesId: 42251, name: 'Aepyceros melampus Common Song', dateCreated: '2022-03-23 03:05:50' } })
      const SYNC_STATUS = await getSyncStatus()
      const IDS_ARBIMON_SECOND_BATCH = [972]

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
      expect(calls.length).toBe(1)

      // - Assert update sync status of the new batch
      await expectLastSyncIdInSyncStatusToBe(IDS_ARBIMON_SECOND_BATCH[IDS_ARBIMON_SECOND_BATCH.length - 1])
    })

    test.todo('where sync is up-to-date', async () => {
     // todo
    })
  })
})
