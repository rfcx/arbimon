import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/node-common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Project, type Site } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '../_testing/arbimon'
import { deleteOutputProjects } from '../_testing/helper'
import { syncArbimonSitesBatch } from './sync-arbimon-site'
import { type SyncConfig, getDefaultSyncStatus } from './sync-config'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = getSequelize()
const { LocationProject, LocationSite, SyncStatus, SyncLogByProject } = ModelRepository.getInstance(biodiversitySequelize)

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
  INSERT INTO sites (project_id, site_id, created_at, updated_at, name, site_type_id, lat, lon, alt, published, token_created_on, external_id, timezone, country_code, hidden)
  VALUES ($projectId, $siteId, $createdAt, $updatedAt, $name, $siteTypeId, $lat, $lon, $alt, $published, $tokenCreatedOn, $externalId, $timezone, $countryCode, $hidden);
`

const DEFAULT_ARB_PROJECT = { projectId: 1920, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw0', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_BIO_PROJECT: Project = { id: 1, idCore: '807cuoi3cvwx', idArbimon: DEFAULT_ARB_PROJECT.projectId, name: 'RFCx 1', slug: 'rfcx-1', status: 'published', statusUpdatedAt: new Date(), latitudeNorth: 1, latitudeSouth: 1, longitudeEast: 1, longitudeWest: 1, createdAt: new Date('2021-03-18T11:00:00.000Z'), updatedAt: new Date('2021-03-18T11:00:00.000Z') }
const DEFAULT_ARB_SITE = { projectId: DEFAULT_ARB_PROJECT.projectId, siteId: 88528, createdAt: '2022-01-03 01:00:00', updatedAt: '2022-01-04 01:00:00', name: 'Site 1', siteTypeId: 2, lat: 16.742010693566815, lon: 100.1923308193772, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cydwrzz91cbz', timezone: 'Asia/Bangkok', countryCode: 'TH', hidden: 0 }
const DEFAULT_ARB_SITES = [DEFAULT_ARB_SITE, { ...DEFAULT_ARB_SITE, siteId: 88527, name: 'Site 2', externalId: 'cydwrzz91cba' }]

describe('ingest > sync > site', () => {
  beforeEach(async () => {
    await arbimonSequelize.query('DELETE FROM sites')
    await arbimonSequelize.query('DELETE FROM projects')
    await biodiversitySequelize.query('DELETE FROM sync_status')
    await biodiversitySequelize.query('DELETE FROM sync_error')
    await deleteOutputProjects(biodiversitySequelize)

    // write mock data to arbimon database
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_ARB_PROJECT })
    await Promise.all(DEFAULT_ARB_SITES.map(async (site) => {
      await arbimonSequelize.query(SQL_INSERT_SITE, { bind: site })
    }))

    // write project in bio
    await LocationProject.create(DEFAULT_BIO_PROJECT)
  })

  test('can sync multiple sites', async () => {
    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, syncStatus, false)

    // Assert
    const sitesInDB = await LocationSite.findAll({ where: { idArbimon: { [Op.in]: DEFAULT_ARB_SITES.map(s => s.siteId) } } })
    expect(sitesInDB).toHaveLength(DEFAULT_ARB_SITES.length)
  })

  test('sync status is updated', async () => {
    // Act
    const updatedSyncStatus = await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, syncStatus, false)

    // Assert
    const syncStatusInDB = await SyncStatus.findOne({ where: { syncDataTypeId: SYNC_CONFIG.syncDataTypeId }, raw: true })
    expect(syncStatusInDB?.syncUntilId).toBe(updatedSyncStatus.syncUntilId)
    const syncLogInDB = await SyncLogByProject.findOne({
      where: { locationProjectId: DEFAULT_BIO_PROJECT.id, syncDataTypeId: SYNC_CONFIG.syncDataTypeId, syncSourceId: SYNC_CONFIG.syncSourceId },
      order: [['createdAt', 'DESC']],
      raw: true
    })
    expect(syncLogInDB).toBeDefined()
    expect(syncLogInDB?.delta).toBe(DEFAULT_ARB_SITES.length)
  })

  test('can sync sites for multiple projects', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_ARB_PROJECT, projectId: 1940, createdAt: '2022-03-20T11:00:00.000Z', updatedAt: '2022-03-20T11:00:00.000Z', externalId: '807cuoi3cvw5', reportsEnabled: 1 } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_ARB_SITE, projectId: 1940, siteId: 88540, createdAt: '2022-03-23 01:00:00', updatedAt: '2022-03-23 01:00:00', name: 'Site 40', externalId: 'cydwrzz91c40' } })
    await LocationProject.create({ ...DEFAULT_BIO_PROJECT, id: 2, idArbimon: 1940, idCore: '807cuoi3cvw5', slug: 'rfcx-2' })
    const syncStatus = getDefaultSyncStatus(SYNC_CONFIG)

    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, { ...syncStatus, syncBatchLimit: 10 }, false)

    // Assert
    const actual = await LocationSite.findOne({
      where: { idArbimon: 88540 },
      raw: true
    })
    expect(actual).toBeDefined()
    expect(actual?.idArbimon).toBe(88540)
  })

  test('site is removed when deleted from arbimon', async () => {
    // Arrange
    await arbimonSequelize.query('UPDATE sites SET deleted_at = datetime(\'now\') WHERE site_id = $siteId', { bind: { siteId: DEFAULT_ARB_SITE.siteId } })

    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, { ...syncStatus, syncBatchLimit: 10 }, false)

    // Assert
    const actual = await LocationSite.findOne({ where: { idArbimon: DEFAULT_ARB_SITE.siteId }, raw: true })
    expect(actual).toBeNull()
  })

  test('project latitude and longitude is updated on first new site', async () => {
    // Arrange

    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, syncStatus, false)

    // Assert
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: DEFAULT_ARB_PROJECT.projectId } })
    expect(project?.latitudeNorth).toBe(DEFAULT_ARB_SITE.lat)
    expect(project?.latitudeSouth).toBe(DEFAULT_ARB_SITE.lat)
    expect(project?.longitudeEast).toBe(DEFAULT_ARB_SITE.lon)
    expect(project?.longitudeWest).toBe(DEFAULT_ARB_SITE.lon)
  })

  test('project latitude and longitude is updated on second new site', async () => {
    // Arrange
    const currentSyncStatus = await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, syncStatus, false)
    const newSite = { ...DEFAULT_ARB_SITE, siteId: DEFAULT_ARB_SITE.siteId + 1, name: 'Site 3', externalId: 'cydwrzz91cby', lat: 16.245, lon: 100.981, createdAt: '2022-01-05 01:00:00', updatedAt: '2022-01-05 01:00:00' }
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: newSite })

    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, currentSyncStatus, false)

    // Assert
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: DEFAULT_ARB_PROJECT.projectId } })
    expect(project?.latitudeNorth).toBe(Math.min(DEFAULT_ARB_SITE.lat, newSite.lat))
    expect(project?.latitudeSouth).toBe(Math.max(DEFAULT_ARB_SITE.lat, newSite.lat))
    expect(project?.longitudeEast).toBe(Math.min(DEFAULT_ARB_SITE.lon, newSite.lon))
    expect(project?.longitudeWest).toBe(Math.max(DEFAULT_ARB_SITE.lon, newSite.lon))
  })

  test('project latitude and longitude is updated on deleted site', async () => {
    // Arrange
    const newSite = { ...DEFAULT_ARB_SITE, siteId: DEFAULT_ARB_SITE.siteId + 1, name: 'Site 3', externalId: 'cydwrzz91cby', lat: 16.245, lon: 100.981, createdAt: '2022-01-05 01:00:00', updatedAt: '2022-01-05 01:00:00' }
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: newSite })
    const currentSyncStatus = await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, { ...syncStatus, syncBatchLimit: 4 }, false)
    for (const site of DEFAULT_ARB_SITES) {
      await arbimonSequelize.query('UPDATE sites SET deleted_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE site_id = $siteId', { bind: { siteId: site.siteId } })
    }

    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, currentSyncStatus, false)

    // Assert
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: DEFAULT_ARB_PROJECT.projectId } })
    expect(project?.latitudeNorth).toBe(newSite.lat)
    expect(project?.latitudeSouth).toBe(newSite.lat)
    expect(project?.longitudeEast).toBe(newSite.lon)
    expect(project?.longitudeWest).toBe(newSite.lon)
  })

  test('project latitude and longitude is null after deleting all sites', async () => {
    // Arrange
    const currentSyncStatus = await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, { ...syncStatus, syncBatchLimit: 4 }, false)
    for (const site of DEFAULT_ARB_SITES) {
      await arbimonSequelize.query('UPDATE sites SET deleted_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE site_id = $siteId', { bind: { siteId: site.siteId } })
    }

    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, currentSyncStatus, false)

    // Assert
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: DEFAULT_ARB_PROJECT.projectId } })
    expect(project?.latitudeNorth).toBeNull()
    expect(project?.latitudeSouth).toBeNull()
    expect(project?.longitudeEast).toBeNull()
    expect(project?.longitudeWest).toBeNull()
  })

  test('project latitude and longitude is null after setting sites to 0,0', async () => {
    // Arrange
    const currentSyncStatus = await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, { ...syncStatus, syncBatchLimit: 4 }, false)
    for (const site of DEFAULT_ARB_SITES) {
      await arbimonSequelize.query('UPDATE sites SET lat = 0, lon = 0, updated_at = datetime(\'now\') WHERE site_id = $siteId', { bind: { siteId: site.siteId } })
    }

    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, currentSyncStatus, false)

    // Assert
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: DEFAULT_ARB_PROJECT.projectId } })
    expect(project?.latitudeNorth).toBeNull()
    expect(project?.latitudeSouth).toBeNull()
    expect(project?.longitudeEast).toBeNull()
    expect(project?.longitudeWest).toBeNull()
  })

  test('recordings updated when project id changes', async () => {
    // Arrange
    const currentSyncStatus = await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, syncStatus, false)
    const site = await LocationSite.findOne({ where: { idArbimon: DEFAULT_ARB_SITE.siteId } }) as Site
    await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.create({
      timePrecisionHourLocal: new Date(),
      locationProjectId: site.locationProjectId,
      locationSiteId: site.id,
      count: 1,
      countsByMinute: [],
      totalDurationInMinutes: 1
    })
    const newProject = await LocationProject.create({ ...DEFAULT_BIO_PROJECT, id: 2, idCore: '807cuoi3cvwy', idArbimon: 1921, name: 'RFCx 2', slug: 'rfcx-2' })
    await arbimonSequelize.query('UPDATE sites SET project_id = $projectId, updated_at = datetime(\'now\') WHERE site_id = $siteId', { bind: { siteId: site.idArbimon, projectId: newProject.idArbimon } })

    // Act
    await syncArbimonSitesBatch(arbimonSequelize, biodiversitySequelize, currentSyncStatus, false)

    // Assert
    const recordings = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.findAll({ where: { locationProjectId: newProject.id } })
    expect(recordings).toHaveLength(1)
  })
})
