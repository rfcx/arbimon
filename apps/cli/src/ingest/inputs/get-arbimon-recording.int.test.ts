import { beforeEach, describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { RecordingArbimon, RecordingDeletedArbimon } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'
import { getArbimonRecording, getArbimonRecordingDeleted } from './get-arbimon-recording'
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

const SQL_INSERT_RECORDING_DELETED = `
  INSERT INTO recordings_deleted (recording_id, site_id, datetime, duration, deleted_at)
  VALUES ($recordingId, $siteId, $datetime, $duration, $deletedAt);
`

const DEFAULT_PROJECT = { projectId: 1920, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw0', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_SITE = { projectId: 1920, siteId: 88526, createdAt: '2022-03-22 05:50:30', updatedAt: '2022-03-22 05:50:30', name: 'NU - Eng', siteTypeId: 2, lat: 16.74431766767897, lon: 100.19638897131505, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cm1n9bvgn0jr', timezone: 'Asia/Bangkok' }
const DEFAULT_RECORDING = { recordingId: 1001, siteId: 88526, uri: 'rfcx_1/site_1/2022/07/m1e1-2022-07-06_07-50.wav', datetime: '2022-07-06 07:30:00', mic: 'ChinosMic', recorder: 'MotoG', version: '1.0.5b', sampleRate: 44100, precision: 16, duration: 60.25, samples: 2657025, fileSize: 5314094, bitRate: '706k', sampleEncoding: '16-bit Signed Integer PCM', uploadTime: '2022-07-06T14:00:00.000Z', meta: '{"artist":"AudioMoth 2495F303562DE118"}', datetimeUtc: '2022-07-06 00:30:00' }
const DEFAULT_RECORDING_DELETED = { recordingId: 1001, siteId: 88526, datetime: '2022-07-06 07:30:00', duration: 60.25, deletedAt: '2022-09-06 00:30:00' }

const deleteProjectData = async (): Promise<void> => {
  await arbimonSequelize.query('DELETE FROM recordings')
  await arbimonSequelize.query('DELETE FROM sites')
  await arbimonSequelize.query('DELETE FROM projects')
}

beforeEach(async () => {
  await deleteProjectData()
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
      syncBatchLimit: 1

    }

    const expectedProps = ['siteIdArbimon', 'datetime', 'duration', 'idArbimon', 'updatedAt']

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
      syncBatchLimit: 2

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
      syncBatchLimit: 2

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
      syncBatchLimit: 2

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
      syncBatchLimit: 2

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
      syncBatchLimit: 2

    }

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params) as unknown as RecordingArbimon[]

    // Arrange
    expect(actual).toHaveLength(1)
    expect(actual[0].idArbimon).toBe(1007)
  })

  test('can get recordings for multiple projects', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88500, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88501, createdAt: '2020-03-20 01:00:00', updatedAt: '2020-03-20 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 900, siteId: 88500, datetime: '2019-07-06 07:30:00', uploadTime: '2020-03-18 01:10:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 901, siteId: 88501, datetime: '2019-07-06 07:30:00', uploadTime: '2020-03-20 01:10:00' } })
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 10
    }

    const IDS_RECORDINGS = [900, 901, 1001, 1002, 1003, 1004, 1005, 1006]

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(8)
    IDS_RECORDINGS.forEach(expectedProp => expect(actual.map((item: any) => item.idArbimon)).toContain(expectedProp))
  })

  test('can get next batch of recordings for multiple projects', async () => {
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
      syncBatchLimit: 10
    }

    const IDS_RECORDINGS = [902, 903, 1001, 1002, 1003, 1004, 1005, 1006]

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(8)
    IDS_RECORDINGS.forEach(expectedProp => expect(actual.map((item: any) => item.idArbimon)).toContain(expectedProp))
  })

  test('can not get recordings if recording upload time is not valid', async () => {
    // Arrange
    await deleteProjectData()
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88500, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 900, siteId: 88500, datetime: '2019-07-06 07:30:00', uploadTime: '0000-00-00 00:00:00' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 10
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
      syncBatchLimit: 10
    }

    // Act
    const actual = await getArbimonRecording(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(0)
  })

  test('can get deleted recordings; check syncUntilDate', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88500, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    // recording to delete
    await arbimonSequelize.query(SQL_INSERT_RECORDING_DELETED, { bind: { ...DEFAULT_RECORDING_DELETED, recordingId: 900, siteId: 88500, datetime: '2019-07-06 07:30:00', deletedAt: '2020-03-18 01:10:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING_DELETED, { bind: { ...DEFAULT_RECORDING_DELETED, recordingId: 901, siteId: 88500, datetime: '2019-07-06 07:30:00', deletedAt: '2022-03-18 01:00:00' } })
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 100
    }

    // Act
    const deletedRecordings = await getArbimonRecordingDeleted(arbimonSequelize, params) as unknown as RecordingDeletedArbimon[]

    // Assert
    expect(deletedRecordings).toHaveLength(2)
  })

  test('can get deleted recordings; check syncBatchLimit and syncUntilId', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 88500, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    // recording to delete
    await arbimonSequelize.query(SQL_INSERT_RECORDING_DELETED, { bind: { ...DEFAULT_RECORDING_DELETED, recordingId: 900, siteId: 88500, datetime: '2019-07-06 07:30:00', deletedAt: '2022-01-10 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING_DELETED, { bind: { ...DEFAULT_RECORDING_DELETED, recordingId: 901, siteId: 88500, datetime: '2019-07-06 07:30:00', deletedAt: '2022-01-12 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING_DELETED, { bind: { ...DEFAULT_RECORDING_DELETED, recordingId: 902, siteId: 88500, datetime: '2019-07-06 07:30:00', deletedAt: '2022-01-14 01:00:00' } })
    const syncStatus1: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 1
    }
    const syncStatus2: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-01-10 01:00:00').toDate(),
      syncUntilId: '900',
      syncBatchLimit: 1
    }
    const syncStatus3: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-01-12 01:00:00').toDate(),
      syncUntilId: '901',
      syncBatchLimit: 1
    }

    // Act
    const result1 = await getArbimonRecordingDeleted(arbimonSequelize, syncStatus1) as unknown as RecordingDeletedArbimon[]
    const result2 = await getArbimonRecordingDeleted(arbimonSequelize, syncStatus2) as unknown as RecordingDeletedArbimon[]
    const result3 = await getArbimonRecordingDeleted(arbimonSequelize, syncStatus3) as unknown as RecordingDeletedArbimon[]

    // Assert
    expect(result1).toHaveLength(1)
    expect(result2).toHaveLength(1)
    expect(result3).toHaveLength(1)
    expect(result1[0].idArbimon).toBe(900)
    expect(result2[0].idArbimon).toBe(901)
    expect(result3[0].idArbimon).toBe(902)
  })
})
