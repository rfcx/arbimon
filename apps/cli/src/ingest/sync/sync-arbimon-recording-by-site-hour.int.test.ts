import { describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Site } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { syncArbimonRecordingBySiteHourBatch } from './sync-arbimon-recording-by-site-hour'
import { SyncConfig } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Recording.id,
  syncBatchLimit: 100
}

const BIO_PROJECT = { idCore: '807cuoi3cvw0', idArbimon: 1920, name: 'RFCx 1', slug: 'rfcx-1', latitudeNorth: 1, latitudeSouth: 1, longitudeEast: 1, longitudeWest: 1 }

const BIO_SITES = (locationProjectId: number): Array<Omit<Site, 'id'>> => {
  return [
    { idCore: 'cm1n9bvgn0jr', idArbimon: 88526, locationProjectId, name: 'NU - 1', latitude: 16.74, longitude: 100.17, altitude: 0 },
    { idCore: 'wchdzd6327i4', idArbimon: 88527, locationProjectId, name: 'NU - 2', latitude: 16.75, longitude: 100.18, altitude: 0 }
  ]
}

const config = async (): Promise<void> => {
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
      (1920, 'RFCx 1', 'rfcx-1', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvw0', 0, '2021-03-18T11:00:00.000Z', '2021-03-18T11:00:00.000Z', NULL, NULL, 1)
    ;
  `)
  await arbimonSequelize.query(`
    INSERT INTO sites (site_id,site_type_id,project_id,name,lat,lon,alt,published,token_created_on,external_id,created_at,timezone,updated_at)
    VALUES
      (88526, 2,1920,'NU - 1',16.74,100.17,0.0,0,NULL,'cm1n9bvgn0jr','2022-03-22 05:50:30','Asia/Bangkok','2022-03-22 05:50:30'),
      (88527, 2,1920,'NU - 2',16.75,100.18,0.0,0,NULL,'wchdzd6327i4','2022-03-22 05:50:30','Asia/Bangkok','2022-03-22 05:50:30')
    ;
  `)
  await arbimonSequelize.query(`
    INSERT INTO recordings (
      recording_id, site_id, uri, datetime, mic, recorder, version, sample_rate, precision,
      duration, samples, file_size, bit_rate, sample_encoding, upload_time, meta, datetime_utc
    )
    VALUES
      (1000001, 88526, 'rfcx_1/site_1/2022/04/m1e1-2022-04-06_07-50.wav', '2022-04-06 07:30:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', '2022-04-06 14:00:00', NULL, NULL),
      (1000002, 88526, 'rfcx_1/site_1/2022/04/m1e1-2022-04-06_08-50.wav', '2022-04-06 07:50:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', '2022-04-06 15:00:00', NULL, NULL),
      (1000003, 88527, 'rfcx_1/site_2/2022/04/m1e1-2022-04-06_07-50.wav', '2022-04-06 07:50:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', '2022-04-06 16:00:00', NULL, NULL),
      (1000004, 88527, 'rfcx_1/site_2/2022/04/m1e1-2022-04-06_08-50.wav', '2022-04-06 08:50:00', 'ChinosMic', 'MotoG', '1.0.5b', 44100, 16, 60.25, 2657025, 5314094, '706k', '16-bit Signed Integer PCM', '2022-04-06 16:00:00', NULL, NULL)
    ;
  `)
}

describe('ingest > sync > sync recording by site hour', async () => {
  await config()
  describe('sync recording by site hour (happy path)', async () => {
    // Arrange
    const syncStatus = { ...SYNC_CONFIG, syncUntilDate: dayjs('2022-04-01T00:00:00.000Z').toDate(), syncUntilId: '1000000' }

    // Act
    await deleteOutputProjects(biodiversitySequelize)
    await ModelRepository.getInstance(biodiversitySequelize).LocationProject.upsert(BIO_PROJECT)
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: BIO_PROJECT.idArbimon } })
    if (project) {
      await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate(BIO_SITES(project.id))
    }
    const updatedSyncStatus = await syncArbimonRecordingBySiteHourBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

    test('recording by site hour are store in bio db successfully', async () => {
      // Act
      const recordingBySiteHourInBioDB = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.findAll()

      // Assert
      expect(recordingBySiteHourInBioDB.length).toBe(3)
    })

    test('sync status is updated', async () => {
      const syncStatusInDB = await ModelRepository.getInstance(biodiversitySequelize)
        .SyncStatus
        .findOne({
          where: { syncDataTypeId: SYNC_CONFIG.syncDataTypeId },
          raw: true
        })
      expect(syncStatusInDB?.syncUntilId).toBe(updatedSyncStatus[1].syncUntilId)
    })

    test('project sync log is created', async () => {
      // Act
      const syncLogInDB = await ModelRepository.getInstance(biodiversitySequelize).SyncLogByProject.findOne({
        where: { syncDataTypeId: SYNC_CONFIG.syncDataTypeId, syncSourceId: SYNC_CONFIG.syncSourceId },
        order: [['createdAt', 'DESC']],
        raw: true
      })

      expect(syncLogInDB).toBeDefined()
      expect(syncLogInDB?.delta).toBe(3)
    })
  })
})
