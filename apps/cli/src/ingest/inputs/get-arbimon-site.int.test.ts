import { beforeEach, describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getArbimonProjectSites, getArbimonSites } from '@/ingest/inputs/get-arbimon-site'
import { type SiteArbimon } from '../parsers/parse-site-arbimon-to-bio'
import { type SyncQueryParams } from './sync-query-params'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()

const SQL_INSERT_PROJECT = `
  INSERT INTO projects (project_id, name, url, description, project_type_id, is_private, is_enabled, current_plan, storage_usage, processing_usage, pattern_matching_enabled, citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled, external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled)
  VALUES ($projectId, $name, $url, $description, $projectTypeId, $isPrivate, $isEnabled, $currentPlan, $storageUsage, $processingUsage, $patternMatchingEnabled, $citizenScientistEnabled, $cnnEnabled, $aedEnabled, $clusteringEnabled, $externalId, $featured, $createdAt, $updatedAt, $deletedAt, $image, $reportsEnabled);
`

const SQL_INSERT_SITE = `
  INSERT INTO sites (project_id, site_id, created_at, updated_at, name, site_type_id, lat, lon, alt, published, token_created_on, external_id, timezone, deleted_at)
  VALUES ($projectId, $siteId, $createdAt, $updatedAt, $name, $siteTypeId, $lat, $lon, $alt, $published, $tokenCreatedOn, $externalId, $timezone, $deletedAt);
`

const DEFAULT_PROJECT = { projectId: 1920, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw0', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_SITE = { projectId: 1920, siteId: 123, createdAt: '2022-01-01 01:00:00', updatedAt: '2022-01-06 01:00:00', name: 'Site 3', siteTypeId: 2, lat: 16.742010693566815, lon: 100.1923308193772, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cydwrzz91cbz', timezone: 'Asia/Bangkok', deletedAt: null }

const deleteProjectData = async (): Promise<void> => {
  await arbimonSequelize.query('DELETE FROM projects')
  await arbimonSequelize.query('DELETE FROM sites')
}

describe('ingest > inputs > getArbimonSites', async () => {
  beforeEach(async () => {
    await deleteProjectData()
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: DEFAULT_SITE })
  })

  test('can get oldest sites', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: 124, createdAt: '2022-01-02 01:00:00', updatedAt: '2022-01-05 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: 125, createdAt: '2022-01-03 01:00:00', updatedAt: '2022-01-04 01:00:00' } })
    const leastRecentlyUpdatedId = 125
    const secondLeastRecentlyUpdatedId = 124

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSites(arbimonSequelize, params) as unknown as SiteArbimon[]

    // Assert
    expect(actual).toHaveLength(params.syncBatchLimit)
    expect(actual[0].idArbimon).toBe(leastRecentlyUpdatedId)
    expect(actual[1].idArbimon).toBe(secondLeastRecentlyUpdatedId)
  })

  test('can get next sites', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: 124, createdAt: '2022-01-02 01:00:00', updatedAt: '2022-01-05 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: 125, createdAt: '2022-01-03 01:00:00', updatedAt: '2022-01-04 01:00:00' } })
    const leastRecentlyUpdatedId = 125
    const secondLeastRecentlyUpdatedId = 124

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSites(arbimonSequelize, params) as unknown as SiteArbimon[]

    // Assert
    expect(actual).toHaveLength(params.syncBatchLimit)
    expect(actual[0].idArbimon).toBe(leastRecentlyUpdatedId)
    expect(actual[1].idArbimon).toBe(secondLeastRecentlyUpdatedId)
  })

  test('can get sites for multiple projects', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 120, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 121, createdAt: '2020-03-20 01:00:00', updatedAt: '2020-03-20 01:00:00' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 100
    }

    const IDS_SITES = [120, 121, 123]

    // Act
    const actual = await getArbimonSites(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(3)
    IDS_SITES.forEach(expectedProp => { expect(actual.map((item: any) => item.idArbimon)).toContain(expectedProp) })
  })

  test('can get next batch of sites for multiple projects', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    // first batch of sites
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 119, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 120, createdAt: '2020-03-20 01:00:00', updatedAt: '2020-03-20 01:00:00' } })
    // second batch of sites
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 121, createdAt: '2020-03-21 01:00:00', updatedAt: '2020-03-21 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 122, createdAt: '2020-03-22 01:00:00', updatedAt: '2020-03-22 01:00:00' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2020-03-20 01:00:00').toDate(),
      syncUntilId: '121',
      syncBatchLimit: 10
    }

    const IDS_SITES = [121, 122, 123]

    // Act
    const actual = await getArbimonSites(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(3)
    IDS_SITES.forEach(expectedProp => { expect(actual.map((item: any) => item.idArbimon)).toContain(expectedProp) })
  })

  test('can not get sites if sites updated at date is not valid', async () => {
    // Arrange
    await deleteProjectData()
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: -1, createdAt: '2020-03-18 01:00:00', updatedAt: '0000-00-00T00:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 'asd', createdAt: '2020-03-20 01:00:00', updatedAt: '0000-00-00 00:00:00' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 10
    }

    // Act
    const actual = await getArbimonSites(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(0)
  })

  test('can not get sites if the syncUntilDate is not valid', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 120, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 121, createdAt: '2020-03-20 01:00:00', updatedAt: '2020-03-20 01:00:00' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('0000-00-00T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 10
    }

    // Act
    const actual = await getArbimonSites(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(0)
  })

  // test('can get deleted sites', async () => {
  //   // Arrange
  //   await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1910, createdAt: '2020-03-18T11:00:00.000Z', updatedAt: '2020-03-18T11:00:00.000Z' } })
  //   await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, projectId: 1910, siteId: 120, createdAt: '2020-03-18 01:00:00', updatedAt: '2020-03-18 01:00:00', deletedAt: '2022-08-29T16:00:00.000Z' } })

  //   const params: SyncQueryParams = {
  //     syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
  //     syncUntilId: '0',
  //     syncBatchLimit: 100
  //   }

  //   // Act
  //   const actual = await getArbimonSites(arbimonSequelize, params) as SiteArbimon[]
  //   const [site] = actual.filter(s => s.idArbimon === 120)

  //   // Assert
  //   expect(site).toBeDefined()
  //   expect(site.deletedAt).toBe('2022-08-29T16:00:00.000Z')
  // })
})

describe('ingest > inputs > getArbimonProjectSites', async () => {
  beforeEach(async () => {
    await deleteProjectData()
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: DEFAULT_SITE })
  })

  test('can get all project sites', async () => {
    // Arrange
    const TEST_SITE_ID = [123, 124, 125]
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: TEST_SITE_ID[1], createdAt: '2022-01-02 01:00:00', updatedAt: '2022-01-05 01:00:00' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: TEST_SITE_ID[2], createdAt: '2022-01-03 01:00:00', updatedAt: '2022-01-04 01:00:00' } })

    // Act
    const actual = await getArbimonProjectSites(arbimonSequelize, DEFAULT_PROJECT.projectId) as unknown as SiteArbimon[]

    // Assert
    expect(actual).toHaveLength(3)
    actual.forEach(site => { expect(TEST_SITE_ID).includes(site.idArbimon) })
  })

  test('can get zero project sites', async () => {
    // Arrange
    await arbimonSequelize.query('DELETE FROM sites')
    // Act
    const actual = await getArbimonProjectSites(arbimonSequelize, DEFAULT_PROJECT.projectId) as unknown as SiteArbimon[]

    // Assert
    expect(actual).toHaveLength(0)
  })
})
