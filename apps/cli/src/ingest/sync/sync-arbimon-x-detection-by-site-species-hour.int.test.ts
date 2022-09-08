import { afterAll, beforeEach, describe, expect, test } from 'vitest'

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

const SITE_INPUT: Omit<Site, 'id'> = {
  idCore: 'cydwrzz91cbz',
  idArbimon: 88526,
  locationProjectId: 123,
  name: 'Site 3',
  latitude: 16.742010693566815,
  longitude: 100.1923308193772,
  altitude: 0.0
}

const SQL_INSERT_PROJECT = `
  INSERT INTO projects (project_id, name, url, description, project_type_id, is_private, is_enabled, current_plan, storage_usage, processing_usage, pattern_matching_enabled, citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled, external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled)
  VALUES ($projectId, $name, $url, $description, $projectTypeId, $isPrivate, $isEnabled, $currentPlan, $storageUsage, $processingUsage, $patternMatchingEnabled, $citizenScientistEnabled, $cnnEnabled, $aedEnabled, $clusteringEnabled, $externalId, $featured, $createdAt, $updatedAt, $deletedAt, $image, $reportsEnabled);
`

const SQL_INSERT_SITE = `
  INSERT INTO sites (project_id, site_id, created_at, updated_at, name, site_type_id, lat, lon, alt, published, token_created_on, external_id, timezone)
  VALUES ($projectId, $siteId, $createdAt, $updatedAt, $name, $siteTypeId, $lat, $lon, $alt, $published, $tokenCreatedOn, $externalId, $timezone);
`

const SQL_INSERT_REC_VALIDATIONS = `
  INSERT INTO recording_validations (recording_validation_id,recording_id,project_id,user_id,species_id,songtype_id,present,present_review, present_aed, created_at, updated_at)
  VALUES ($recordingValidationId, $recordingId, $projectId, $userId, $speciesId, $songtypeId, $present, $presentReview, $presentAed, $createdAt, $updatedAt);
`

const SQL_UPDATE_REC_VALIDATIONS = `
  UPDATE recording_validations SET present=$present, present_review=$presentReview, updated_at=$updatedAt
  WHERE recording_validation_id=$recordingValidationId;
`
const SQL_INSERT_RECORDING = `
  INSERT INTO recordings (recording_id, site_id, uri, datetime, mic, recorder, version, sample_rate, precision, duration, samples, file_size, bit_rate, sample_encoding, upload_time, meta, datetime_utc)
  VALUES ($recordingId, $siteId, $uri, $datetime, $mic, $recorder, $version, $sampleRate, $precision, $duration, $samples, $fileSize, $bitRate, $sampleEncoding, $uploadTime, $meta, $datetimeUtc);
`

const DEFAULT_PROJECT = { projectId: 1940, createdAt: '2022-03-20T11:00:00.000Z', updatedAt: '2022-03-20T11:00:00.000Z', deletedAt: null, name: 'RFCx 2', url: 'rfcx-2', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw2', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_SITE = { projectId: 1940, siteId: 88540, createdAt: '2022-03-23 01:00:00', updatedAt: '2022-03-23 01:00:00', name: 'NU - 2', siteTypeId: 2, lat: 16.74431766767897, lon: 100.19638897131505, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cm1n9bvgn0jj', timezone: 'Asia/Bangkok' }
const DEFAULT_RECORDING = { recordingId: 1000001, siteId: 88540, uri: 'rfcx_1/site_1/2022/04/m1e1-2022-04-06_07-50.wav', datetime: '2022-04-06 07:30:00', mic: 'ChinosMic', recorder: 'MotoG', version: '1.0.5b', sampleRate: 44100, precision: 16, duration: 60.25, samples: 2657025, fileSize: 5314094, bitRate: '706k', sampleEncoding: '16-bit Signed Integer PCM', uploadTime: '2022-04-06 14:00:00', meta: '{"artist":"AudioMoth 2495F303562DE118"}', datetimeUtc: null }
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
  beforeEach(async () => {
    // Remove and batch test species before testing
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (501, 1050, 1051, 3842, 2755, 9620, 12675, 74, 42251, 16729, 12204)')
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
      },
      {
        idArbimon: 42251,
        slug: 'aepyceros-melampus',
        taxonClassId: 300,
        scientificName: 'Aepyceros melampus'
      },
      {
        idArbimon: 16729,
        slug: 'chiropotes-satanas',
        taxonClassId: 300,
        scientificName: 'Chiropotes satanas'
      },
      {
        idArbimon: 12204,
        slug: 'duttaphrynus-melanostictus',
        taxonClassId: 300,
        scientificName: 'Duttaphrynus melanostictus'
      }
    ]

    await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate(SPECIES_INPUT)

    // Delete project level data
    await deleteOutputProjects(biodiversitySequelize)
    await biodiversitySequelize.query('DELETE FROM sync_status')
    await biodiversitySequelize.query('DELETE FROM sync_error')
    // Batch project data
    await writeProjectsToBio([PROJECT_INPUT], biodiversitySequelize)
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: PROJECT_INPUT.idArbimon } })

    if (!project) return

    const ID_PROJECT = project.id

    // Batch site data
    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([
      { ...SITE_INPUT, locationProjectId: ID_PROJECT },
      { ...SITE_INPUT, locationProjectId: ID_PROJECT, idCore: 'cydwrzz91cbx', idArbimon: 88528, name: 'Site 4' }
    ])
  })
  afterAll(async () => {
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (501, 1050, 1051, 3842, 2755, 9620, 12675, 74, 42251, 16729, 12204)')
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
      const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll({ raw: true })
      expect(detections.length).toBe(14)
    })

    test('can sync next detection batch: update, insert and remove rows', async () => {
      // Arrange
      await arbimonSequelize.query('DELETE FROM recording_validations')

      // 1. Insert new detections
      await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingValidationId: 2391030, recordingId: 7048805, userId: 1017, speciesId: 501, songtypeId: 1, present: 1, presentReview: 0 } })
      await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingValidationId: 2391041, speciesId: 1051 } })
      await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingValidationId: 2391042, speciesId: 12675, updatedAt: '2022-07-17T11:10:00.000Z' } })
      // Get sync status
      const SYNC_STATUS = getDefaultSyncStatus({ ...SYNC_CONFIG, syncBatchLimit: 2 })

      // Act
      const UPDATED_SYNC_STATUS = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS)
      // 2. Update present review count in the synced detection
      await arbimonSequelize.query(SQL_UPDATE_REC_VALIDATIONS, { bind: { present: 0, presentReview: 2, updatedAt: '2022-07-18T14:30:00.000Z', recordingValidationId: 2391030 } })
      // Get last sync status
      const SYNC_STATUS_SECOND_BATCH = await getSyncStatus()
      // Sync updates
      const UPDATED_SYNC_STATUS_SECOND_BATCH = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS_SECOND_BATCH)
      const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()
      // 3. Reset just synced detection
      await arbimonSequelize.query(SQL_UPDATE_REC_VALIDATIONS, { bind: { present: null, presentReview: 0, updatedAt: '2022-07-19T11:25:00.000Z', recordingValidationId: 2391030 } })
      // Get last sync status
      const SYNC_STATUS_THIRD_BATCH = await getSyncStatus()
      // Sync updates
      const UPDATED_SYNC_STATUS_THIRD_BATCH = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, SYNC_STATUS_THIRD_BATCH)
      const detections2 = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

      // Assert
      expect(UPDATED_SYNC_STATUS).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS_SECOND_BATCH).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS_THIRD_BATCH).toBeTypeOf('object')
      expect(UPDATED_SYNC_STATUS.syncBatchLimit).toBe(2)
      // Check last sync id for the 1st batch
      expect(UPDATED_SYNC_STATUS.syncUntilId).toBe('2391041')
      // Check last sync id for the 2nd batch
      expect(UPDATED_SYNC_STATUS_SECOND_BATCH.syncUntilId).toBe('2391030')
      // Check last sync id for the 3d batch
      expect(UPDATED_SYNC_STATUS_THIRD_BATCH.syncUntilId).toBe('2391030')
      // Check count of updated detections after 2nd batch
      expect(detections.length).toBe(3)
      // Check count of updated detections after reseting detection on the 3d batch
      expect(detections2.length).toBe(2)
    })

    test('can sync detections for multiple projects', async () => {
      // Act
      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
      await arbimonSequelize.query(SQL_INSERT_SITE, { bind: DEFAULT_SITE })
      await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: DEFAULT_RECORDING })
      await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingValidationId: 2391000, recordingId: 1000001, projectId: 1940, userId: 1017, speciesId: 501, songtypeId: 1, present: 1, presentReview: 0, createdAt: '2022-05-17T11:10:00.000Z', updatedAt: '2022-05-17T11:10:00.000Z' } })
      await ModelRepository.getInstance(biodiversitySequelize).LocationProject.create({ ...PROJECT_INPUT, idArbimon: 1940, idCore: '807cuoi3cvw5', slug: 'rfcx-2' })
      const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: 1940 } })
      if (project) {
        await ModelRepository.getInstance(biodiversitySequelize).LocationSite.create({ ...SITE_INPUT, idCore: 'cydwrzz91c40', idArbimon: 88540, locationProjectId: project.id, name: 'Site test' })
      }

      const syncStatus = getDefaultSyncStatus(SYNC_CONFIG)

      // Act
      const updatedSyncStatus = await syncArbimonDetectionBySiteSpeciesHourBatch(arbimonSequelize, biodiversitySequelize, { ...syncStatus, syncBatchLimit: 100 })

      // Assert
      expect(updatedSyncStatus).toBeTypeOf('object')
      const actual = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll({ raw: true })
      expect(actual).toHaveLength(3)
    })
  })
})
