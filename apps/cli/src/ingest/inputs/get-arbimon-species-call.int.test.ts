import { beforeEach, describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getArbimonSpeciesCalls } from '@/ingest/inputs/get-arbimon-species-call'
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

const SQL_INSERT_TEMPLATE = `
  INSERT INTO templates (template_id, project_id, recording_id, species_id, songtype_id, name, uri, x1, y1, x2, y2, date_created, deleted, source_project_id, user_id)
  VALUES ($templateId, $projectId, $recordingId, $speciesId, $songtypeId, $name, $uri, $x1, $y1, $x2, $y2, $dateCreated, $deleted, $sourceProjectId, $userId);
`

const DEFAULT_PROJECT = { projectId: 1920, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw0', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_SITE = { projectId: 1920, siteId: 88528, createdAt: '2022-01-03 01:00:00', updatedAt: '2022-01-04 01:00:00', name: 'Site 3', siteTypeId: 2, lat: 16.742010693566815, lon: 100.1923308193772, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cydwrzz91cbz', timezone: 'Asia/Bangkok' }
const DEFAULT_RECORDING = { recordingId: 7047505, siteId: 88528, uri: '2020/12/06/cm1n9bvgn0jr/dfd0cc07-856a-41b9-9bf2-b1a6efd4b1da.flac', datetime: '2020-12-06 10:06:19', mic: 'Unknown', recorder: 'Unknown', version: 'Unknown', sampleRate: 48000, precision: 0, duration: 90.24, samples: 4331520, fileSize: 1913060, bitRate: '170321', sampleEncoding: 'flac', uploadTime: '2022-03-22 06:31:32', meta: '{"artist":"AudioMoth 2495F303562DE118","comment":"Recorded at 10:06:19 06/12/2020 (UTC) during deployment EEC909D42565A5F0 at medium gain setting while battery state was 4.2V and temperature was 19.6C.","encoder":"Lavf58.24.101","filename":"20201206_100619.WAV"}', datetimeUtc: '2020-12-06 03:06:19' }
const DEFAULT_TEMPLATE = { templateId: 980, projectId: DEFAULT_PROJECT.projectId, recordingId: DEFAULT_RECORDING.recordingId, speciesId: 1050, songtypeId: 1, name: 'Falco', uri: 'project_1920/templates/970.png', x1: 75.24309455587392, y1: 469.36114732724906, x2: 80.86693409742121, y2: 2252.9335071707956, dateCreated: '2022-03-22 07:31:11', deleted: 0, sourceProjectId: null, userId: 1017 }

describe('ingest > inputs > getArbimonSpeciesCalls', () => {
  beforeEach(async () => {
    await arbimonSequelize.query('DELETE FROM templates')
    await arbimonSequelize.query('DELETE FROM recordings')
    await arbimonSequelize.query('DELETE FROM sites')
    await arbimonSequelize.query('DELETE FROM projects')
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: DEFAULT_SITE })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: DEFAULT_RECORDING })
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: DEFAULT_TEMPLATE })
  })

  test('can get oldest project species calls', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, speciesId: 3842, name: 'Merops orientalis Common Song', dateCreated: '2022-03-23 03:05:37' } })
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, speciesId: 42251, name: 'Aepyceros melampus Common Song', dateCreated: '2022-03-23 03:05:50' } })
    const IDS_SPECIES = [1050, 3842]
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpeciesCalls(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(2)
    IDS_SPECIES.forEach(expectedProp => expect(actual.map((item: any) => item.taxonSpeciesId)).toContain(expectedProp))
  })

  test('can get next batch when date_created is greater', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, speciesId: 3842, name: 'Merops orientalis Common Song', dateCreated: '2022-03-23 03:05:37' } })
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, speciesId: 42251, name: 'Aepyceros melampus Common Song', dateCreated: '2022-03-23 03:05:50' } })
    const IDS_SPECIES = [3842, 42251]
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-03-22T07:31:11.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpeciesCalls(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(2)
    IDS_SPECIES.forEach(expectedProp => expect(actual.map((item: any) => item.taxonSpeciesId)).toContain(expectedProp))
  })

  test.todo('can get next batch when date_created is equal and id is greater', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, speciesId: 3842, name: 'Merops orientalis Common Song', dateCreated: '2022-03-23 03:05:37' } })
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, speciesId: 42251, name: 'Aepyceros melampus Common Song', dateCreated: '2022-03-23 03:05:50' } })
    const ID_SPECIES = 42251
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-03-23T03:05:37.000Z').toDate(),
      syncUntilId: '3842',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpeciesCalls(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(1)
    expect((actual[0] as any).taxonSpeciesId).toBe(ID_SPECIES)
  })

  test('can gets no species when nothing left to sync', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, speciesId: 3842, name: 'Merops orientalis Common Song', dateCreated: '2022-03-23 03:05:37' } })
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-03-23T03:05:37.000Z').toDate(),
      syncUntilId: '3842',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpeciesCalls(arbimonSequelize, params)

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
      'taxonSpeciesId',
      'callProjectId',
      'projectSlugArbimon',
      'callSiteId',
      'callRecordedAt',
      'start',
      'end',
      'siteIdCore',
      'callType',
      'recordingId',
      'callTimezone',
      'updatedAt',
      'idArbimon'
    ]

    // Act
    const actual = await getArbimonSpeciesCalls(arbimonSequelize, params)

    // Assert
    const item = actual[0]
    expect(item).toBeDefined()
    EXPECTED_PROPS.forEach(prop => expect(item).toHaveProperty(prop))
    expect(Object.keys(item as any).length).toBe(EXPECTED_PROPS.length)
  })

  test('can not get species calls which are not enabled', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1921, reportsEnabled: 0 } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1921, siteId: 88529, createdAt: '2022-01-01 01:00:00', updatedAt: '2022-01-06 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1921, siteId: 88530, createdAt: '2022-01-02 01:00:00', updatedAt: '2022-01-05 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 7047506, siteId: 88529 } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 7047507, siteId: 88530 } })
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, templateId: 990, projectId: 1921, recordingId: 7047506, dateCreated: '2022-08-23 03:05:37' } })
    await arbimonSequelize.query(SQL_INSERT_TEMPLATE, { bind: { ...DEFAULT_TEMPLATE, templateId: 991, projectId: 1921, recordingId: 7047507, dateCreated: '2022-08-23 03:05:37' } })
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 10
    }

    // Act
    const actual = await getArbimonSpeciesCalls(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(1)
  })
})
