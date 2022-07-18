import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, Site, SyncStatus, TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { writeProjectsToBio } from '../outputs/projects'
import { syncArbimonDetectionBySiteSpeciesHourBatch } from './sync-arbimon-x-detection-by-site-species-hour'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Detection.id,
  syncBatchLimit: 2
}
const SQL_INSERT_REC_VALIDATIONS = `
  INSERT INTO recording_validations (recording_validation_id,recording_id,project_id,user_id,species_id,songtype_id,present,present_review, present_aed, created_at, updated_at)
  VALUES ($recordingValidationId, $recordingId, $projectId, $userId, $speciesId, $songtypeId, $present, $presentReview, $presentAed, $createdAt, $updatedAt);
`
const DEFAULT_REC_VALIDATIONS = { recordingValidationId: 2391041, recordingId: 7048796, projectId: 1920, userId: 1017, speciesId: 1051, songtypeId: 4, present: 0, presentReview: 5, presentAed: 0, createdAt: '2022-07-15 17:00:00', updatedAt: '2022-07-15 17:00:00' }

const getSyncStatus = async (): Promise<SyncStatus> => {
  const syncStatus = await ModelRepository.getInstance(biodiversitySequelize)
    .SyncStatus
    .findOne({
      where: { syncSourceId: SYNC_CONFIG.syncSourceId, syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
      raw: true
    }) ?? getDefaultSyncStatus(SYNC_CONFIG)
  return syncStatus
}

describe('ingest > sync', () => {
  beforeAll(async () => {
    // Remove and batch test species before testing
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (501, 1050, 1051, 3842, 2755, 9620, 12675, 74)')
    const SPECIES_INPUT: Array<Omit<TaxonSpecies, 'id'>> = [{
      idArbimon: 501,
      slug: 'nettapus-coromandelianus',
      taxonClassId: 300,
      scientificName: 'Nettapus coromandelianus'
    },
    {
      idArbimon: 3842,
      slug: 'merops-orientalis',
      taxonClassId: 300,
      scientificName: 'Merops orientalis'
    },
    {
      idArbimon: 2755,
      slug: 'eudynamys-scolopaceus',
      taxonClassId: 300,
      scientificName: 'Eudynamys scolopaceus'
    },
    {
      idArbimon: 9620,
      slug: 'carpodacus-erythrinus',
      taxonClassId: 300,
      scientificName: 'Carpodacus erythrinus'
    },
    {
      idArbimon: 1050,
      slug: 'falco-amurensis',
      taxonClassId: 300,
      scientificName: 'Falco amurensis'
    },
    {
      idArbimon: 1051,
      slug: 'falco-eleonorae',
      taxonClassId: 300,
      scientificName: 'Falco eleonorae'
    },
    {
      idArbimon: 12675,
      slug: 'hemidactylium-scutatum',
      taxonClassId: 300,
      scientificName: 'Hemidactylium scutatum'
    },
    {
      idArbimon: 74,
      slug: 'crypturellus-boucardi',
      taxonClassId: 300,
      scientificName: 'Crypturellus boucardi'
    }
    ]

    await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate(SPECIES_INPUT)
  })
  beforeEach(async () => {
    // Delete project level data
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
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
    const SITE_INPUT: Array<Omit<Site, 'id'>> = [{
      idCore: 'cydwrzz91cbz',
      idArbimon: 88526,
      locationProjectId: ID_PROJECT,
      name: 'Site 3',
      latitude: 16.742010693566815,
      longitude: 100.1923308193772,
      altitude: 0.0
    },
    {
      idCore: 'cydwrzz91cbx',
      idArbimon: 88528,
      locationProjectId: ID_PROJECT,
      name: 'Site 4',
      latitude: 16.742010693566815,
      longitude: 100.1923308193772,
      altitude: 0.0
    }]

    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate(SITE_INPUT)
  })
  afterAll(async () => {
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (501, 1050, 1051, 3842, 2755, 9620, 12675, 74)')
  })

  describe('syncArbimonDetectionBySiteSpeciesHour', () => {
    test('can sync first detection batch', async () => {
      // Arrange
      const SYNC_STATUS = await getSyncStatus()

      // Act
      const UPDATED_SYNC_STATUS = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)

      // Assert

      // - Assert write detections bio is returning sync status of a first batch
      expect(UPDATED_SYNC_STATUS).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS.syncBatchLimit).toBe(2)
      expect(UPDATED_SYNC_STATUS.syncUntilId).toBe('2391016')
      expect(new Date(UPDATED_SYNC_STATUS.syncUntilDate)).greaterThan(new Date('1980-01-01T00:00:00.000Z'))

      // - Assert valid detections count in Bio taxon species table of the first batch
      const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()
      expect(detections.length).toBe(2)
    })

    test('where syncUntilId = latest id of a new batch', async () => {
      // Arrange
      const expectedIds = [2391015, 2391016, 2391017, 2391018]
      const SYNC_STATUS = await getSyncStatus()

      // Act
      const UPDATED_SYNC_STATUS_FIRST_BATCH = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)
      const SYNC_STATUS_SECOND_BATCH = await getSyncStatus()
      const UPDATED_SYNC_STATUS_SECOND_BATCH = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS_SECOND_BATCH)

      // Assert

      // - Assert write species bio is returning sync status of the new batch
      expect(UPDATED_SYNC_STATUS_FIRST_BATCH).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS_SECOND_BATCH).toBeTypeOf('object')

      // - Assert valid detections are in Bio table of the new batch
      const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()
      expect(detections.length).toBe(4)

      // - Assert update sync status of the new batch
      expect(UPDATED_SYNC_STATUS_SECOND_BATCH.syncUntilId).toBe(expectedIds[expectedIds.length - 1].toString())
    })

    test('where sync is up-to-date', async () => {
      // Arrange
      const SYNC_STATUS = getDefaultSyncStatus({ ...SYNC_CONFIG, syncBatchLimit: 100 })

      // Act
      const UPDATED_SYNC_STATUS_FIRST_BATCH = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)
      const SYNC_STATUS_SECOND_BATCH = await getSyncStatus()
      const UPDATED_SYNC_STATUS_SECOND_BATCH = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS_SECOND_BATCH)

      // Assert

      // - Assert write species bio is returning sync status of the new batch
      expect(UPDATED_SYNC_STATUS_FIRST_BATCH).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS_SECOND_BATCH).toBeTypeOf('object')

      // - Assert valid species are in Bio taxon species table of the new batch
      const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()
      expect(detections.length).toBe(14)
    })

    test('can sync next detection batch', async () => {
      // Arrange
      const SYNC_STATUS = getDefaultSyncStatus({ ...SYNC_CONFIG, syncBatchLimit: 100 })

      // Act
      const UPDATED_SYNC_STATUS = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)
      await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingValidationId: 2391042, speciesId: 1051 } })
      const SYNC_STATUS_SECOND_BATCH = await getSyncStatus()
      const UPDATED_SYNC_STATUS_SECOND_BATCH = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS_SECOND_BATCH)
      const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

      // Assert
      expect(UPDATED_SYNC_STATUS).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS_SECOND_BATCH).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS.syncBatchLimit).toBe(100)
      expect(UPDATED_SYNC_STATUS.syncUntilId).toBe('2391040')
      expect(detections.length).toBe(15)
    })
  })
})
