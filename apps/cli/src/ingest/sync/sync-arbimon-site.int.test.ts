import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { syncArbimonSitesBatch } from './sync-arbimon-site'
import { getDefaultSyncStatus, SyncConfig } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()
const { LocationProject, LocationSite, SyncStatus } = ModelRepository.getInstance(biodiversitySequelize)

const SYNC_CONFIG: SyncConfig = {
  syncSourceId: masterSources.Arbimon.id,
  syncDataTypeId: masterSyncDataTypes.Site.id,
  syncBatchLimit: 2
}
const syncStatus = getDefaultSyncStatus(SYNC_CONFIG)

const SQL_INSERT_PROJECT = `
  INSERT INTO projects (project_id, name, url, description, project_type_id, is_private, is_enabled, current_plan, storage_usage, processing_usage, pattern_matching_enabled, citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled, external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled)
  VALUES ($projectId, $name, $url, $description, $projectTypeId, $isPrivate, $isEnabled, $currentPlan, $storageUsage, $processingUsage, $patternMatchingEnabled, $citizenScientistEnabled, $cnnEnabled, $aedEnabled, $clusteringEnabled, $externalId, $featured, $createdAt, $updatedAt, $deletedAt, $image, $reportsEnabled);
`

const SQL_INSERT_SITE = `
  INSERT INTO sites (project_id, site_id, created_at, updated_at, name, site_type_id, lat, lon, alt, published, token_created_on, external_id, timezone)
  VALUES ($projectId, $siteId, $createdAt, $updatedAt, $name, $siteTypeId, $lat, $lon, $alt, $published, $tokenCreatedOn, $externalId, $timezone);
`
const DEFAULT_BIO_PROJECT = { id: 1, idCore: '807cuoi3cvwx', idArbimon: 1920, name: 'RFCx 1', slug: 'rfcx-1', latitudeNorth: 1, latitudeSouth: 1, longitudeEast: 1, longitudeWest: 1, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z' }
const DEFAULT_ARB_PROJECT = { projectId: 1920, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw0', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_SITE = { projectId: 1920, siteId: 88528, createdAt: '2022-01-03 01:00:00', updatedAt: '2022-01-04 01:00:00', name: 'Site 3', siteTypeId: 2, lat: 16.742010693566815, lon: 100.1923308193772, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cydwrzz91cbz', timezone: 'Asia/Bangkok' }
const DEFAULT_SITES = [DEFAULT_SITE, { ...DEFAULT_SITE, siteId: 88527, name: 'Site 2', externalId: 'cydwrzz91cba' }]

describe('ingest > sync > site', () => {
  beforeEach(async () => {
    await deleteOutputProjects(biodiversitySequelize)
    await arbimonSequelize.query('DELETE FROM projects')
    await biodiversitySequelize.query('DELETE FROM sync_status')
    await biodiversitySequelize.query('DELETE FROM sync_error')

    // write mock data to arbimon database
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_ARB_PROJECT })
    await Promise.all(DEFAULT_SITES.map(async (site) => {
      await arbimonSequelize.query(SQL_INSERT_SITE, { bind: site })
    }))

    // write project in bio
    await LocationProject.create(DEFAULT_BIO_PROJECT)
  })

  test('can sync multiple sites', async () => {
    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

    // Assert
    const sitesInDB = await LocationSite.findAll({ where: { idArbimon: { [Op.in]: DEFAULT_SITES.map(s => s.siteId) } } })
    expect(sitesInDB).toHaveLength(DEFAULT_SITES.length)
  })

  test('sync status is updated', async () => {
    // Act
    const updatedSyncStatus = await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, syncStatus)

    // Assert
    const syncStatusInDB = await SyncStatus.findOne({ where: { syncDataTypeId: SYNC_CONFIG.syncDataTypeId }, raw: true })
    expect(syncStatusInDB?.syncUntilId).toBe(updatedSyncStatus.syncUntilId)
    const syncLogInDB = await ModelRepository.getInstance(biodiversitySequelize).SyncLogByProject.findOne({
      where: { locationProjectId: DEFAULT_BIO_PROJECT.id, syncDataTypeId: SYNC_CONFIG.syncDataTypeId, syncSourceId: SYNC_CONFIG.syncSourceId },
      order: [['createdAt', 'DESC']],
      raw: true
    })
    expect(syncLogInDB).toBeDefined()
    expect(syncLogInDB?.delta).toBe(DEFAULT_SITES.length)
  })

  test('can sync sites for multiple projects', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_ARB_PROJECT, projectId: 1940, createdAt: '2022-03-20T11:00:00.000Z', updatedAt: '2022-03-20T11:00:00.000Z', externalId: '807cuoi3cvw5', reportsEnabled: 1 } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1940, siteId: 88540, createdAt: '2022-03-23 01:00:00', updatedAt: '2022-03-23 01:00:00', name: 'Site 40', externalId: 'cydwrzz91c40' } })
    await ModelRepository.getInstance(biodiversitySequelize).LocationProject.create({ ...DEFAULT_BIO_PROJECT, id: 2, idArbimon: 1940, idCore: '807cuoi3cvw5', slug: 'rfcx-2' })
    const syncStatus = getDefaultSyncStatus(SYNC_CONFIG)

    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, { ...syncStatus, syncBatchLimit: 10 })

    // Assert
    const actual = await ModelRepository.getInstance(biodiversitySequelize).LocationSite.findOne({
      where: { idArbimon: 88540 },
      raw: true
    })
    expect(actual).toBeDefined()
    expect(actual?.idArbimon).toBe(88540)
  })
})
