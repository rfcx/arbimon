import { afterAll, beforeEach, describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getArbimonDetections } from './get-arbimon-detections'
import { SyncQueryParams } from './sync-query-params'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()

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

const SQL_INSERT_REC_VALIDATIONS = `
  INSERT INTO recording_validations (recording_validation_id,recording_id,project_id,user_id,species_id,songtype_id,present,present_review, present_aed, created_at, updated_at)
  VALUES ($recordingValidationId, $recordingId, $projectId, $userId, $speciesId, $songtypeId, $present, $presentReview, $presentAed, $createdAt, $updatedAt);
`

const DEFAULT_PROJECT = { projectId: 1920, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw0', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_SITE_1 = { projectId: 1920, siteId: 88528, createdAt: '2022-01-03 01:00:00', updatedAt: '2022-01-04 01:00:00', name: 'Site 3', siteTypeId: 2, lat: 16.742010693566815, lon: 100.1923308193772, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cydwrzz91cbz', timezone: 'Asia/Bangkok' }
const DEFAULT_SITE_2 = { projectId: 1920, siteId: 88529, createdAt: '2022-01-03 01:00:00', updatedAt: '2022-01-04 01:00:00', name: 'Site 3', siteTypeId: 2, lat: 16.742010693566815, lon: 100.1923308193772, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cydwrzz91cbf', timezone: 'Asia/Bangkok' }
const DEFAULT_RECORDING_SITE_1 = { recordingId: 7047505, siteId: 88528, uri: '2020/12/06/cydwrzz91cbz/dfd0cc07-856a-41b9-9bf2-b1a6efd4b1da.flac', datetime: '2020-12-06 10:06:19', mic: 'Unknown', recorder: 'Unknown', version: 'Unknown', sampleRate: 48000, precision: 0, duration: 90.24, samples: 4331520, fileSize: 1913060, bitRate: '170321', sampleEncoding: 'flac', uploadTime: '2022-03-22 06:31:32', meta: '{"artist":"AudioMoth 2495F303562DE118","comment":"Recorded at 10:06:19 06/12/2020 (UTC) during deployment EEC909D42565A5F0 at medium gain setting while battery state was 4.2V and temperature was 19.6C.","encoder":"Lavf58.24.101","filename":"20201206_100619.WAV"}', datetimeUtc: '2020-12-06 03:06:19' }
const DEFAULT_RECORDING_SITE_2 = { recordingId: 7047506, siteId: 88529, uri: '2020/12/06/cydwrzz91cbf/dfd0cc07-856a-41b9-9bf2-b1a6efd4b1df.flac', datetime: '2020-12-06 10:06:19', mic: 'Unknown', recorder: 'Unknown', version: 'Unknown', sampleRate: 48000, precision: 0, duration: 90.24, samples: 4331520, fileSize: 1913060, bitRate: '170321', sampleEncoding: 'flac', uploadTime: '2022-03-22 06:31:32', meta: '{"artist":"AudioMoth 2495F303562DE118","comment":"Recorded at 10:06:19 06/12/2020 (UTC) during deployment EEC909D42565A5F0 at medium gain setting while battery state was 4.2V and temperature was 19.6C.","encoder":"Lavf58.24.101","filename":"20201206_100619.WAV"}', datetimeUtc: '2020-12-06 03:06:19' }
const DEFAULT_REC_VALIDATIONS = { recordingValidationId: 2391041, recordingId: 7047505, projectId: 1920, userId: 1017, speciesId: 1050, songtypeId: 1, present: 0, presentReview: 1, presentAed: 0, createdAt: '2022-01-03 01:00:00', updatedAt: '2022-01-03 01:00:00' }

describe('ingest > inputs > getArbimonDetections', async () => {
  beforeEach(async () => {
    await arbimonSequelize.query('DELETE FROM recording_validations')
    await arbimonSequelize.query('DELETE FROM recordings')
    await arbimonSequelize.query('DELETE FROM sites')
    await arbimonSequelize.query('DELETE FROM projects')
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: DEFAULT_SITE_1 })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: DEFAULT_SITE_2 })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: DEFAULT_RECORDING_SITE_1 })
    await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, present: 0, presentReview: 1 } })
    await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingValidationId: 2391042, speciesId: 74, present: 0, presentReview: 2 } })
  })
  afterAll(async () => {
    await arbimonSequelize.query('DELETE FROM recording_validations')
  })

  test.todo('can get oldest recording validations', async () => {
    // Arrange
    const IDS_DETECTION = [2391041, 2391042]

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonDetections(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(2)
    IDS_DETECTION.forEach(expectedProp => expect(actual.map((item: any) => item.idArbimon)).toContain(expectedProp))
  })

  test('can get batch when updated_at is greater', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING_SITE_1, recordingId: 7047506 } })
    await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingId: DEFAULT_RECORDING_SITE_2.recordingId, recordingValidationId: 2391043, speciesId: 3842, present: 1, presentReview: 2 } })
    await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingId: DEFAULT_RECORDING_SITE_2.recordingId, recordingValidationId: 2391044, speciesId: 42251, present: 1, presentReview: 0 } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-01-02 01:00:00').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2
    }

    const IDS_DETECTION = [2391041, 2391042]

    // Act
    const actual = await getArbimonDetections(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(2)
    IDS_DETECTION.forEach(expectedProp => expect(actual.map((item: any) => item.idArbimon)).toContain(expectedProp))
  })

  test('can get batch when updated_at and sync until id are greater', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: DEFAULT_RECORDING_SITE_2 })
    await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingValidationId: 2391043, recordingId: DEFAULT_RECORDING_SITE_2.recordingId, speciesId: 3842, present: 1, presentReview: 2, createdAt: '2022-01-04 01:10:00', updatedAt: '2022-01-03T01:10:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingValidationId: 2391044, recordingId: DEFAULT_RECORDING_SITE_2.recordingId, speciesId: 42251, present: 1, presentReview: 0, createdAt: '2022-01-04 01:00:00', updatedAt: '2022-01-04T01:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingValidationId: 2391045, recordingId: DEFAULT_RECORDING_SITE_1.recordingId, speciesId: 74, songtypeId: 2, present: 1, presentReview: 2, createdAt: '2022-01-05 01:00:00', updatedAt: '2022-01-05T01:00:00.00Z' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-01-03 01:00:00').toDate(),
      syncUntilId: '2391042',
      syncBatchLimit: 2
    }

    const IDS_DETECTION = [2391043, 2391044]

    // Act
    const actual = await getArbimonDetections(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(2)
    IDS_DETECTION.forEach(expectedProp => expect(actual.map((item: any) => item.idArbimon)).toContain(expectedProp))
  })

  test('does not miss recording validation with the same updated_at as previously synced', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: DEFAULT_RECORDING_SITE_2 })
    await arbimonSequelize.query(SQL_INSERT_REC_VALIDATIONS, { bind: { ...DEFAULT_REC_VALIDATIONS, recordingValidationId: 2391043, recordingId: DEFAULT_RECORDING_SITE_2.recordingId, speciesId: 3842, present: 1, presentReview: 2, createdAt: '2022-01-03T01:00:00.000Z', updatedAt: '2022-01-03T01:00:00.000Z' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-01-03 01:00:00').toDate(),
      syncUntilId: '2391042',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonDetections(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(1)
    expect((actual[0] as any).idArbimon).toBe(2391043)
  })

  test('can get no recording validations when nothing left to sync', async () => {
    // Arrange

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-01-03 01:00:00').toDate(),
      syncUntilId: '2391042',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonDetections(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(0)
  })

  test('includes expected props (& no more)', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 1
    }
    const EXPECTED_PROPS = [
      'idArbimon',
      'datetime',
      'date',
      'hour',
      'siteId',
      'recordingDuration',
      'speciesId',
      'present',
      'presentReview',
      'presentAed',
      'updatedAt'
    ]

    // Act
    const actual = await getArbimonDetections(arbimonSequelize, params)

    // Assert
    const item = actual[0]
    expect(item).toBeDefined()
    EXPECTED_PROPS.forEach(prop => expect(item).toHaveProperty(prop))
    expect(Object.keys(item as any).length).toBe(EXPECTED_PROPS.length)
  })
})
