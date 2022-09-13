import { Op } from 'sequelize'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Site, SyncStatus, TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { writeProjectsToBio } from '../outputs/projects'
import { ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'
import { syncArbimonSpeciesCallBatch } from './sync-arbimon-species-call'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.SpeciesCall.id,
  syncBatchLimit: 4
}

const SQL_INSERT_PROJECT = `
  INSERT INTO projects (project_id, name, url, description, project_type_id, is_private, is_enabled, current_plan, storage_usage, processing_usage, pattern_matching_enabled, citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled, external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled)
  VALUES ($projectId, $name, $url, $description, $projectTypeId, $isPrivate, $isEnabled, $currentPlan, $storageUsage, $processingUsage, $patternMatchingEnabled, $citizenScientistEnabled, $cnnEnabled, $aedEnabled, $clusteringEnabled, $externalId, $featured, $createdAt, $updatedAt, $deletedAt, $image, $reportsEnabled);
`

const SQL_INSERT_SITE = `
  INSERT INTO sites (project_id, site_id, created_at, updated_at, name, site_type_id, lat, lon, alt, published, token_created_on, external_id, timezone)
  VALUES ($projectId, $siteId, $createdAt, $updatedAt, $name, $siteTypeId, $lat, $lon, $alt, $published, $tokenCreatedOn, $externalId, $timezone);
`

const SQL_INSERT_RECORDING = `
  INSERT INTO recordings (recording_id, site_id, uri, datetime, mic, recorder, version, sample_rate, precision, duration, samples, file_size, bit_rate, sample_encoding, upload_time, meta, datetime_utc)
  VALUES ($recordingId, $siteId, $uri, $datetime, $mic, $recorder, $version, $sampleRate, $precision, $duration, $samples, $fileSize, $bitRate, $sampleEncoding, $uploadTime, $meta, $datetimeUtc);
`

const SQL_INSERT_TEMPLATE = `
  INSERT INTO templates (template_id, project_id, recording_id, species_id, songtype_id, name, uri, x1, y1, x2, y2, date_created, deleted, source_project_id, user_id)
  VALUES ($templateId, $projectId, $recordingId, $speciesId, $songtypeId, $name, $uri, $x1, $y1, $x2, $y2, $dateCreated, $deleted, $sourceProjectId, $userId);
`
const PROJECT_INPUT: ProjectArbimon = {
  idArbimon: 1920,
  idCore: '807cuoi3cvw0',
  slug: 'rfcx-1',
  name: 'rfcx 1',
  latitudeNorth: 0,
  latitudeSouth: 0,
  longitudeEast: 0,
  longitudeWest: 0,
  deletedAt: null
}

const SITE_INPUT: Omit<Site, 'id'> = {
  idCore: 'cydwrzz91cbz',
  idArbimon: 88528,
  locationProjectId: 123,
  name: 'Site 3',
  latitude: 16.742010693566815,
  longitude: 100.1923308193772,
  altitude: 0.0
}

const DEFAULT_PROJECT = { projectId: 1940, createdAt: '2022-08-28 07:31:11', updatedAt: '2022-08-28 07:31:11', deletedAt: null, name: 'RFCx 2', url: 'rfcx-2', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw5', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_SITE = { projectId: 1940, siteId: 88529, createdAt: '2022-08-28 07:31:11', updatedAt: '2022-08-28 07:31:11', name: 'NU - Eng', siteTypeId: 2, lat: 16.74431766767897, lon: 100.19638897131505, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cydwrzz91cby', timezone: 'Asia/Bangkok' }
const DEFAULT_RECORDING = { recordingId: 7047506, siteId: 88529, uri: 'rfcx_1/site_1/2022/07/m1e1-2022-07-06_07-50.wav', datetime: '2022-07-06 07:30:00', mic: 'ChinosMic', recorder: 'MotoG', version: '1.0.5b', sampleRate: 44100, precision: 16, duration: 60.25, samples: 2657025, fileSize: 5314094, bitRate: '706k', sampleEncoding: '16-bit Signed Integer PCM', uploadTime: '2022-08-28 07:30:11', meta: '{"artist":"AudioMoth 2495F303562DE118"}', datetimeUtc: '2022-07-06 00:30:00' }
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

describe('ingest > sync', () => {
  beforeAll(async () => {
    // Remove and batch test species before testing
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (74, 3842, 12675, 42251, 1050)')
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
      },
      {
        idArbimon: 42251,
        slug: 'aepyceros-melampus',
        taxonClassId: 300,
        scientificName: 'Aepyceros melampus'
      },
      {
        idArbimon: 12675,
        slug: 'hemidactylium-scutatum',
        taxonClassId: 300,
        scientificName: 'Hemidactylium scutatum'
      },
      {
        idArbimon: 1050,
        slug: 'falco-amurensis',
        taxonClassId: 300,
        scientificName: 'Falco amurensis'
      }
    ]

    await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate(SPECIES_INPUT)

    // Batch species calls
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: DEFAULT_TEMPLATE })
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, templateId: 976, dateCreated: '2022-03-28 07:31:11' } })
  })
  beforeEach(async () => {
    // Delete project level data
    await biodiversitySequelize.query('DELETE FROM taxon_species_call')
    await deleteOutputProjects(biodiversitySequelize)
    await biodiversitySequelize.query('DELETE FROM sync_status')
    await biodiversitySequelize.query('DELETE FROM sync_error')
    // Batch project data
    await writeProjectsToBio([PROJECT_INPUT], biodiversitySequelize)
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: PROJECT_INPUT.idArbimon } })

    if (!project) return

    const ID_PROJECT = project.id

    // Batch site data
    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([{ ...SITE_INPUT, locationProjectId: ID_PROJECT }])
  })
  afterAll(async () => {
    await biodiversitySequelize.query('DELETE FROM taxon_species_call')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon in (74, 3842, 12675, 42251, 1050)')
  })

  describe('syncArbimonSpeciesCallBatch', () => {
    const IDS_ARBIMON_FIRST_BATCH = [970, 971, 972, 973]
    const IDS_ARBIMON_SECOND_BATCH = [974, 975, 976]

    test('can sync species calls of a first batch', async () => {
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

    test('where syncUntilId = latest id of a new batch', async () => {
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

    test('where sync is up-to-date', async () => {
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

    test('sync status is updated', async () => {
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

    test('species calls sync log is created', async () => {
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

    test('can sync species calls for multiple projects', async () => {
      // Act
      // Batch the arbimon data
      await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
      await arbimonSequelize.query(SQL_INSERT_SITE, { bind: DEFAULT_SITE })
      await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: DEFAULT_RECORDING })
      await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 7047507 } })
      await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, projectId: 1940, templateId: 980, recordingId: 7047506, dateCreated: '2022-08-28 07:31:11' } })
      await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, projectId: 1940, templateId: 981, recordingId: 7047507, dateCreated: '2022-08-28 07:31:11' } })
      // Batch the bio data
      await writeProjectsToBio([{ ...PROJECT_INPUT, idArbimon: 1940, slug: 'rfcx-2', idCore: '807cuoi3cvw5' }], biodiversitySequelize)
      const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: 1940 } })

      if (!project) return

      const ID_PROJECT = project.id

      // Batch site, species calls
      await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([{ ...SITE_INPUT, locationProjectId: ID_PROJECT, idCore: 'cydwrzz91cby', idArbimon: 88529 }])

      const syncStatus = getDefaultSyncStatus(SYNC_CONFIG)

      // Act
      const UPDATED_SYNC_STATUS = await syncArbimonSpeciesCallBatch(arbimonSequelize, biodiversitySequelize, { ...syncStatus, syncBatchLimit: 10 })

      // Assert
      // - Assert write species calls bio is returning sync status of a first batch
      expect(UPDATED_SYNC_STATUS).toBeTypeOf('object')

      // - Assert valid species are in Bio taxon species table of the first batch
      const speciesCalls = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesCall.findAll({
        where: { idArbimon: { [Op.in]: [980, 981] } }
      })
      expect(speciesCalls).toHaveLength(2)
    })
  })
})
