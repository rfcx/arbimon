import dayjs from 'dayjs'
import { sum } from 'lodash-es'
import { beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Site } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { resyncArbimonRecordingBySiteHourBatch } from './sync-arbimon-recording-by-site-hour'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = getSequelize()

const BIO_PROJECT = { idCore: '807cuoi3cvw0', idArbimon: 1920, name: 'RFCx 1', slug: 'rfcx-1', latitudeNorth: 1, latitudeSouth: 1, longitudeEast: 1, longitudeWest: 1 }

const BIO_SITES = (locationProjectId: number): Array<Omit<Site, 'id'>> => {
  return [
    { idCore: 'cm1n9bvgn0jr', idArbimon: 88526, locationProjectId, name: 'NU - 1', latitude: 16.74, longitude: 100.17, altitude: 0 },
    { idCore: 'wchdzd6327i4', idArbimon: 88527, locationProjectId, name: 'NU - 2', latitude: 16.75, longitude: 100.18, altitude: 0 }
  ]
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

const DEFAULT_PROJECT = { projectId: 1920, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw0', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_SITE = { projectId: 1920, siteId: 88526, createdAt: '2022-03-22 05:50:30', updatedAt: '2022-03-22 05:50:30', name: 'NU - 1', siteTypeId: 2, lat: 16.74431766767897, lon: 100.19638897131505, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cm1n9bvgn0jr', timezone: 'Asia/Bangkok' }
const DEFAULT_RECORDING = { recordingId: 1000001, siteId: 88526, uri: 'rfcx_1/site_1/2022/04/m1e1-2022-04-06_07-50.wav', datetime: '2022-04-06 07:30:00', mic: 'ChinosMic', recorder: 'MotoG', version: '1.0.5b', sampleRate: 44100, precision: 16, duration: 60, samples: 2657025, fileSize: 5314094, bitRate: '706k', sampleEncoding: '16-bit Signed Integer PCM', uploadTime: '2022-04-06 14:00:00', meta: '{"artist":"AudioMoth 2495F303562DE118"}', datetimeUtc: null }

describe('ingest > sync > sync recording by site hour batch', async () => {
  beforeEach(async () => {
    // Reset Arbimon tables
    await arbimonSequelize.query('DELETE FROM recordings')
    await arbimonSequelize.query('DELETE FROM sites')
    await arbimonSequelize.query('DELETE FROM projects')

    // Insert Arbimon test data
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: DEFAULT_SITE })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: 88527, name: 'NU - 2', externalId: 'wchdzd6327i4' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: DEFAULT_RECORDING })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 1000002, siteId: 88526, duration: 30, datetime: '2022-04-06 07:50:00', uploadTime: '2022-04-06 15:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 1000002, siteId: 88526, duration: 30, datetime: '2022-04-06 07:50:00', uploadTime: '2022-04-06 15:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 1000003, siteId: 88527, datetime: '2022-04-06 07:50:00', uploadTime: '2022-04-06 15:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_RECORDING, { bind: { ...DEFAULT_RECORDING, recordingId: 1000004, siteId: 88527, datetime: '2022-04-06 08:20:00', uploadTime: '2022-04-06 16:00:00' } })
  })

  test('sync recording by site hour (happy path)', async () => {
    // Arrange
    await deleteOutputProjects(biodiversitySequelize)
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.upsert(BIO_PROJECT).then(result => result[0])
    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate(BIO_SITES(project.id))

    // Act
    await resyncArbimonRecordingBySiteHourBatch(DEFAULT_PROJECT.projectId, arbimonSequelize, biodiversitySequelize)

    // Assert
    const recordingBySiteHourBio = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.findAll()
    expect(recordingBySiteHourBio).toHaveLength(3)
    expect(dayjs(recordingBySiteHourBio[0].timePrecisionHourLocal)).toEqual(dayjs('2022-04-06T07:00:00.000Z'))
    expect(dayjs(recordingBySiteHourBio[1].timePrecisionHourLocal)).toEqual(dayjs('2022-04-06T07:00:00.000Z'))
    expect(dayjs(recordingBySiteHourBio[2].timePrecisionHourLocal)).toEqual(dayjs('2022-04-06T08:00:00.000Z'))
    expect(recordingBySiteHourBio[0].totalDurationInMinutes).toBe(2)
    expect(recordingBySiteHourBio[1].totalDurationInMinutes).toBe(1)
    expect(recordingBySiteHourBio[2].totalDurationInMinutes).toBe(1)
    expect(recordingBySiteHourBio[0].countsByMinute).toEqual([[30, 1], [50, 2]])
    expect(recordingBySiteHourBio[1].countsByMinute).toEqual([[50, 1]])
    expect(recordingBySiteHourBio[2].countsByMinute).toEqual([[20, 1]])
    expect(sum(recordingBySiteHourBio.map(item => item.count))).toBe(4)
  })
})
