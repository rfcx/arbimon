import { beforeAll, describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getArbimonRecordingBySiteHour } from './get-arbimon-recording-by-site-hour'
import { SyncQueryParams } from './sync-query-params'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()

beforeAll(async () => {
  // reset the recordings table
  await arbimonSequelize.query('DELETE FROM recordings')
  await arbimonSequelize.query('DELETE FROM sites')
  await arbimonSequelize.query('DELETE FROM projects')
  // insert test data into the table
  await arbimonSequelize.query(`
    INSERT INTO projects (
      project_id, name, url, description, project_type_id, is_private, is_enabled,
      current_plan, storage_usage, processing_usage, pattern_matching_enabled, citizen_scientist_enabled, cnn_enabled,
      aed_enabled, clustering_enabled, external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled
    )
    VALUES
      (1920, 'RFCx 1', 'rfcx-1', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvw0', 0, '2021-03-18T11:00:00.000Z', '2021-03-18T11:00:00.000Z', NULL, NULL, 1),
      (1921, 'RFCx 2', 'rfcx-2', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvw1', 0, '2021-03-19T11:00:00.000Z', '2021-03-19T11:00:00.000Z', NULL, NULL, 1)
    ;
  `)
  await arbimonSequelize.query(`
    INSERT INTO sites (site_id,site_type_id,project_id,name,lat,lon,alt,published,token_created_on,external_id,created_at,timezone,updated_at)
    VALUES
      (88526, 2,1920,'NU - Eng',16.74431766767897,100.19638897131505,0.0,0,NULL,'cm1n9bvgn0jr','2022-03-22 05:50:30','Asia/Bangkok','2022-03-22 05:50:30'),
      (88527, 2,1920,'NU - Sci',16.74252666589018,100.19407545061581,0.0,0,NULL,'wchdzd6327i4','2022-03-22 05:50:30','Asia/Bangkok','2022-03-22 05:50:30'),
      (88528, 2,1921,'NU - Sci Park',16.742010693566815,100.1923308193772,0.0,0,NULL,'cydwrzz91cbz','2022-03-22 05:50:30','Asia/Bangkok','2022-03-22 05:50:30')
    ;
  `)
  await arbimonSequelize.query(`
    INSERT INTO recordings (
      recording_id, site_id, uri, datetime, mic, recorder, version, sample_rate, precision,
      duration, samples, file_size, bit_rate, sample_encoding, upload_time, meta, datetime_utc
    )
    VALUES
      (1001, 88526, 'rfcx_1/site_1/2022/07/m1e1-2022-07-06_07-50.wav', '2022-07-06 07:30:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', '2022-07-06 14:00:00', NULL, NULL),
      (1002, 88526, 'rfcx_1/site_1/2022/07/m1e1-2022-07-06_08-50.wav', '2022-07-06 07:50:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', '2022-07-06 15:00:00', NULL, NULL),
      (1003, 88527, 'rfcx_1/site_2/2022/07/m1e1-2022-07-06_07-50.wav', '2022-07-06 07:50:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', '2022-07-06 16:00:00', NULL, NULL),
      (1004, 88528, 'rfcx_2/site_3/2022/07/m1e1-2022-07-06_08-30.wav', '2022-07-06 08:30:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', '2022-07-06 16:00:00', NULL, NULL),
      (1005, 88528, 'rfcx_2/site_3/2022/07/m1e1-2022-07-06_09-50.wav', '2022-07-06 09:50:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', '2022-07-06 17:00:00', NULL, NULL),
      (1006, 88528, 'rfcx_2/site_3/2022/07/m1e1-2022-07-06_10-50.wav', '2022-07-06 10:50:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', '2022-07-06 17:00:00', NULL, NULL)
    ;
  `)
})

const getMinutesFromSeconds = (second: number): number => {
  return second / 60
}

describe('ingest > input > getArbimonRecordings', () => {
  test('includes expected props (& no more)', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 1
    }
    const expectedProps = ['projectIdArbimon', 'siteIdArbimon', 'timePrecisionHourLocal', 'totalDurationInMinutes', 'recordedMinutes', 'firstRecordingIdArbimon', 'lastRecordingIdArbimon', 'lastUploaded']

    // Act
    const actual = await getArbimonRecordingBySiteHour(arbimonSequelize, params)

    // Assert
    const recording = actual[0]
    expect(recording).toBeDefined()
    expectedProps.forEach(prop => expect(recording).toHaveProperty(prop))
    expect(Object.keys(recording).length).toBe(expectedProps.length)
  })

  test('can get first batch of recordings', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonRecordingBySiteHour(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(params.syncBatchLimit)

    expect(actual[0].projectIdArbimon).toBe(1920)
    expect(actual[0].siteIdArbimon).toBe(88526)
    expect(actual[0].timePrecisionHourLocal).toBe('2022-07-06 07:00:00')
    expect(actual[0].totalDurationInMinutes).toBe(getMinutesFromSeconds(120.5))
    expect(actual[0].recordedMinutes).toBe('30,50')
    expect(actual[0].firstRecordingIdArbimon).toBe(1001)
    expect(actual[0].lastRecordingIdArbimon).toBe(1002)
    expect(actual[0].lastUploaded).toBe('2022-07-06 15:00:00')

    expect(actual[1].projectIdArbimon).toBe(1920)
    expect(actual[1].siteIdArbimon).toBe(88527)
    expect(actual[1].timePrecisionHourLocal).toBe('2022-07-06 07:00:00')
    expect(actual[1].totalDurationInMinutes).toBe(getMinutesFromSeconds(60.25))
    expect(actual[1].recordedMinutes).toBe('50')
    expect(actual[1].firstRecordingIdArbimon).toBe(1003)
    expect(actual[1].lastRecordingIdArbimon).toBe(1003)
    expect(actual[1].lastUploaded).toBe('2022-07-06 16:00:00')
  })

  test('can get next batch of recordings', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-07-06 16:00:00').toDate(),
      syncUntilId: '1003',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonRecordingBySiteHour(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(params.syncBatchLimit)

    expect(actual[0].projectIdArbimon).toBe(1921)
    expect(actual[0].siteIdArbimon).toBe(88528)
    expect(actual[0].timePrecisionHourLocal).toBe('2022-07-06 08:00:00')
    expect(actual[0].totalDurationInMinutes).toBe(getMinutesFromSeconds(60.25))
    expect(actual[0].recordedMinutes).toBe('30')
    expect(actual[0].firstRecordingIdArbimon).toBe(1004)
    expect(actual[0].lastRecordingIdArbimon).toBe(1004)
    expect(actual[0].lastUploaded).toBe('2022-07-06 16:00:00')

    expect(actual[1].projectIdArbimon).toBe(1921)
    expect(actual[1].siteIdArbimon).toBe(88528)
    expect(actual[1].timePrecisionHourLocal).toBe('2022-07-06 09:00:00')
    expect(actual[1].totalDurationInMinutes).toBe(getMinutesFromSeconds(60.25))
    expect(actual[1].recordedMinutes).toBe('50')
    expect(actual[1].firstRecordingIdArbimon).toBe(1005)
    expect(actual[1].lastRecordingIdArbimon).toBe(1005)
    expect(actual[1].lastUploaded).toBe('2022-07-06 17:00:00')
  })

  test('can get last incomplete batch of projects', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-07-06 17:00:00').toDate(),
      syncUntilId: '1005',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonRecordingBySiteHour(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(1)

    expect(actual[0].projectIdArbimon).toBe(1921)
    expect(actual[0].siteIdArbimon).toBe(88528)
    expect(actual[0].timePrecisionHourLocal).toBe('2022-07-06 10:00:00')
    expect(actual[0].totalDurationInMinutes).toBe(getMinutesFromSeconds(60.25))
    expect(actual[0].recordedMinutes).toBe('50')
    expect(actual[0].firstRecordingIdArbimon).toBe(1006)
    expect(actual[0].lastRecordingIdArbimon).toBe(1006)
    expect(actual[0].lastUploaded).toBe('2022-07-06 17:00:00')
  })

  test('can gets no recording by site hour when nothing left to sync', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-07-06 17:00:00').toDate(),
      syncUntilId: '1006',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonRecordingBySiteHour(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(0)
  })

  test('does not miss projects with the same upload_tine as previously synced', async () => {
    // Arrange
    const uploadTime = '2022-07-06 17:00:00'

    const insertNewRowSQLStatement = `
      INSERT INTO recordings (
        recording_id, site_id, uri, datetime, mic, recorder, version, sample_rate, precision,
        duration, samples, file_size, bit_rate, sample_encoding, upload_time, meta, datetime_utc
      )
      VALUES
        (1007, 88528, 'rfcx_2/site_3/2022/07/m1e1-2022-07-06_10-55.wav', '2022-07-06 10:55:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', $uploadTime , NULL, NULL)
      ;
    `
    await arbimonSequelize.query(insertNewRowSQLStatement, { bind: { uploadTime } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc(uploadTime).toDate(),
      syncUntilId: '1006',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonRecordingBySiteHour(arbimonSequelize, params)

    // Arrange
    expect(actual.length).toBe(1)
    expect(actual[0].firstRecordingIdArbimon).toBe(1007)
    expect(actual[0].lastRecordingIdArbimon).toBe(1007)
  })
})
