import { beforeEach, describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { RecordingArbimon } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'
import { getArbimonRecording } from './get-arbimon-recording'
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

const DEFAULT_PROJECT = { projectId: 1920, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw0', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_SITE = { projectId: 1920, siteId: 88526, createdAt: '2022-03-22 05:50:30', updatedAt: '2022-03-22 05:50:30', name: 'NU - Eng', siteTypeId: 2, lat: 16.74431766767897, lon: 100.19638897131505, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cm1n9bvgn0jr', timezone: 'Asia/Bangkok' }
const DEFAULT_RECORDING = { recordingId: 1001, siteId: 88526, uri: 'rfcx_1/site_1/2022/07/m1e1-2022-07-06_07-50.wav', datetime: '2022-07-06 07:30:00', mic: 'ChinosMic', recorder: 'MotoG', version: '1.0.5b', sampleRate: 44100, precision: 16, duration: 60.25, samples: 2657025, fileSize: 5314094, bitRate: '706k', sampleEncoding: '16-bit Signed Integer PCM', uploadTime: '2022-07-06T14:00:00.000Z', meta: '{"artist":"AudioMoth 2495F303562DE118"}', datetimeUtc: '2022-07-06 00:30:00' }

beforeEach(async () => {
  await arbimonSequelize.query('DELETE FROM recordings')
  await arbimonSequelize.query('DELETE FROM sites')
  await arbimonSequelize.query('DELETE FROM projects')
  await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
  await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1921, name: 'RFCx 2', url: 'rfcx-2', externalId: '807cuoi3cvw1', updatedAt: '2021-03-19T11:00:00.000Z' } })
  await arbimonSequelize.query(SQL_INSERT_SITE, { bind: DEFAULT_SITE })
  await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: 88527, name: 'NU - Sci', lat: 16.74252666589018, lon: 100.19407545061581, externalId: 'wchdzd6327i4' } })
  await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: 88528, name: 'NU - Sci Park', lat: 16.742010693566815, lon: 100.1923308193772, externalId: 'cydwrzz91cbz' } })
  await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: DEFAULT_RECORDING })
  await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 1002, datetime: '2022-07-06 07:50:00', uri: 'rfcx_1/site_1/2022/07/m1e1-2022-07-06_08-50.wav', uploadTime: '2022-07-06T15:00:00.000Z' } })
  await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 1003, siteId: 88527, datetime: '2022-07-06 07:50:00', uri: 'rfcx_1/site_2/2022/07/m1e1-2022-07-06_07-50.wav', uploadTime: '2022-07-06T16:00:00.000Z' } })
  await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 1004, siteId: 88528, datetime: '2022-07-06 08:30:00', uri: 'rfcx_2/site_3/2022/07/m1e1-2022-07-06_08-30.wav', uploadTime: '2022-07-06T16:00:00.000Z' } })
  await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 1005, siteId: 88528, datetime: '2022-07-06 09:50:00', uri: 'rfcx_2/site_3/2022/07/m1e1-2022-07-06_09-50.wav', uploadTime: '2022-07-06T17:00:00.000Z' } })
  await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 1006, siteId: 88528, datetime: '2022-07-06 10:50:00', uri: 'rfcx_2/site_3/2022/07/m1e1-2022-07-06_10-50.wav', uploadTime: '2022-07-06T17:00:00.000Z' } })
})

describe('ingest > input > getArbimonRecordings', () => {
  test('includes expected props (& no more)', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 1,
      projectId: DEFAULT_PROJECT.projectId
    }

    const expectedProps = ['projectIdArbimon', 'siteIdArbimon', 'datetime', 'duration', 'idArbimon', 'updatedAt']

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    const recording = actual[0]
    expect(recording).toBeDefined()
    expectedProps.forEach(prop => expect(recording).toHaveProperty(prop))
    expect(Object.keys(recording as any).length).toBe(expectedProps.length)
  })

  test('can get first batch of recordings', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2,
      projectId: DEFAULT_PROJECT.projectId
    }

    const expectIds = [1001, 1002]

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(params.syncBatchLimit)

    expectIds.forEach(id => expect(actual.map(item => (item as any).idArbimon).includes(id)).toBeTruthy())
  })

  test('can get next batch of recordings', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-07-06 15:00:00').toDate(),
      syncUntilId: '1002',
      syncBatchLimit: 2,
      projectId: DEFAULT_PROJECT.projectId
    }

    const expectIds = [1003, 1004]

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(params.syncBatchLimit)

    expectIds.forEach(id => expect(actual.map(item => (item as any).idArbimon).includes(id)).toBeTruthy())
  })

  test('can get last incomplete batch of recordings', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-07-06 17:00:00').toDate(),
      syncUntilId: '1005',
      syncBatchLimit: 2,
      projectId: DEFAULT_PROJECT.projectId
    }

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params) as unknown as RecordingArbimon[]

    // Assert
    expect(actual).toHaveLength(1)

    expect(actual[0].idArbimon).toBe(1006)
  })

  test('can gets no recording when nothing left to sync', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-07-06 17:00:00').toDate(),
      syncUntilId: '1006',
      syncBatchLimit: 2,
      projectId: DEFAULT_PROJECT.projectId
    }

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(0)
  })

  test('does not miss recordings with the same upload_time as previously synced', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 1007, siteId: 88528, datetime: '2022-07-06 10:55:00', uri: 'rfcx_2/site_3/2022/07/m1e1-2022-07-06_10-55.wav', uploadTime: '2022-07-06T17:00:00.000Z' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-07-06T17:00:00.000Z').toDate(),
      syncUntilId: '1006',
      syncBatchLimit: 2,
      projectId: DEFAULT_PROJECT.projectId
    }

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params) as unknown as RecordingArbimon[]

    // Arrange
    expect(actual).toHaveLength(1)
    expect(actual[0].idArbimon).toBe(1007)
  })

  test.todo('can get first batch of recordings for the old project', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88500, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88501, createdAt: '2020-03-20 01:00:00', updatedAt: '2020-03-20 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 900, siteId: 88500, datetime: '2019-07-06 07:30:00', uploadTime: '2020-03-18 01:10:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 901, siteId: 88501, datetime: '2019-07-06 07:30:00', uploadTime: '2020-03-20 01:10:00' } })
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 10,
      projectId: 1910
    }

    const IDS_RECORDINGS = [900, 901]

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(2)
    IDS_RECORDINGS.forEach(expectedProp => expect(actual.map((item: any) => item.idArbimon)).toContain(expectedProp))
  })

  test('can get next batch of recordings for the old project', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88500, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88501, createdAt: '2020-03-20 01:00:00', updatedAt: '2020-03-20 01:00:00' } })
    // first batch of recordings
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 900, siteId: 88500, datetime: '2019-07-06 07:30:00', uploadTime: '2020-03-18 01:10:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 901, siteId: 88501, datetime: '2019-07-06 07:30:00', uploadTime: '2020-03-20 01:10:00' } })
    // second batch of recordings
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 902, siteId: 88500, datetime: '2019-07-08 07:30:00', uploadTime: '2020-03-22 01:10:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 903, siteId: 88501, datetime: '2019-07-09 07:30:00', uploadTime: '2020-03-22 01:10:00' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2020-03-20 01:10:00').toDate(),
      syncUntilId: '901',
      syncBatchLimit: 10,
      projectId: 1910
    }

    const IDS_RECORDINGS = [902, 903]

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(2)
    IDS_RECORDINGS.forEach(expectedProp => expect(actual.map((item: any) => item.idArbimon)).toContain(expectedProp))
  })

  test('can not get recordings if the project id is not valid', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88500, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 900, siteId: 88500, datetime: '2019-07-06 07:30:00', uploadTime: '2020-03-18 01:10:00' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 10,
      projectId: 19100
    }

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(0)
  })

  test('can not get recordings if the syncUntilDate is not valid', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88500, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 900, siteId: 88500, datetime: '2019-07-06 07:30:00', uploadTime: '2020-03-18 01:10:00' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('0000-00-00T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 10,
      projectId: 1910
    }

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(0)
  })
})
