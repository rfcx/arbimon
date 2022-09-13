import { beforeEach, describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getArbimonProjects } from '@/ingest/inputs/get-arbimon-project'
import { ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'
import { SyncQueryParams } from './sync-query-params'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()

const SQL_INSERT_PROJECT = `
  INSERT INTO projects (project_id, name, url, description, project_type_id, is_private, is_enabled, current_plan, storage_usage, processing_usage, pattern_matching_enabled, citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled, external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled)
  VALUES ($projectId, $name, $url, $description, $projectTypeId, $isPrivate, $isEnabled, $currentPlan, $storageUsage, $processingUsage, $patternMatchingEnabled, $citizenScientistEnabled, $cnnEnabled, $aedEnabled, $clusteringEnabled, $externalId, $featured, $createdAt, $updatedAt, $deletedAt, $image, $reportsEnabled);
`

const SQL_UPDATE_PROJECT = `
  UPDATE projects SET is_private = $isPrivate, updated_at = $updatedAt, deleted_at = $deletedAt
  WHERE project_id = $projectId
`

const SQL_INSERT_SITE = `
  INSERT INTO sites (project_id, site_id, created_at, updated_at, name, site_type_id, lat, lon, alt, published, token_created_on, external_id, timezone, deleted_at)
  VALUES ($projectId, $siteId, $createdAt, $updatedAt, $name, $siteTypeId, $lat, $lon, $alt, $published, $tokenCreatedOn, $externalId, $timezone, $deletedAt);
`

const DEFAULT_PROJECT = { projectId: 1920, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null, name: 'RFCx 1', url: 'rfcx-1', description: 'A test project for testing', projectTypeId: 1, isPrivate: 1, isEnabled: 1, currentPlan: 846, storageUsage: 0.0, processingUsage: 0.0, patternMatchingEnabled: 1, citizenScientistEnabled: 0, cnnEnabled: 0, aedEnabled: 0, clusteringEnabled: 0, externalId: '807cuoi3cvw0', featured: 0, image: null, reportsEnabled: 1 }
const DEFAULT_SITE = { projectId: 1920, siteId: 88526, createdAt: '2022-03-22 05:50:30', updatedAt: '2022-03-22 05:50:30', name: 'NU - Eng', siteTypeId: 2, lat: 16.74431766767897, lon: 100.19638897131505, alt: 0.0, published: 0, tokenCreatedOn: null, externalId: 'cm1n9bvgn0jr', timezone: 'Asia/Bangkok', deletedAt: null }

describe('ingest > inputs > getArbimonProjects', () => {
  beforeEach(async () => {
    await arbimonSequelize.query('DELETE FROM sites')
    await arbimonSequelize.query('DELETE FROM projects')
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1921, name: 'RFCx 2', url: 'rfcx-2', externalId: '807cuoi3cvw1', updatedAt: '2021-03-19T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1922, name: 'RFCx 3', url: 'rfcx-3', externalId: '807cuoi3cvw2', updatedAt: '2021-03-20T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1923, name: 'RFCx 4', url: 'rfcx-4', externalId: '807cuoi3cvw3', updatedAt: '2021-03-20T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1924, name: 'RFCx 5', url: 'rfcx-5', externalId: '807cuoi3cvw4', updatedAt: '2021-03-20T11:00:00.000Z' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: DEFAULT_SITE })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: 88527, name: 'NU - Sci', lat: 16.74252666589018, lon: 100.19407545061581, externalId: 'wchdzd6327i4' } })
    await arbimonSequelize.query(SQL_INSERT_SITE, { bind: { ...DEFAULT_SITE, siteId: 88528, name: 'NU - Sci Park', lat: 16.742010693566815, lon: 100.1923308193772, externalId: 'cydwrzz91cbz' } })
  })

  test('can get first batch of projects', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(params.syncBatchLimit)
    expect((actual[0] as any).idArbimon).toBe(1920)
    expect((actual[1] as any).idArbimon).toBe(1921)
  })

  test('can get next batch of projects', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2021-03-19T11:00:00.000Z').toDate(),
      syncUntilId: '1921',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(params.syncBatchLimit)
    expect((actual[0] as any).idArbimon).toBe(1922)
    expect((actual[1] as any).idArbimon).toBe(1923)
  })

  test('can get last incomplete batch of projects', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2021-03-20T11:00:00.000Z').toDate(),
      syncUntilId: '1923',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(1)
    expect((actual[0] as any).idArbimon).toBe(1924)
  })

  test('can gets no projects when nothing left to sync', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2021-03-20T12:00:00.000Z').toDate(),
      syncUntilId: '1924',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(0)
  })

  test('does not miss projects with the same updated_at as previously synced', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1925, name: 'RFCx 6', url: 'rfcx-6', externalId: '807cuoi3cvwi5', createdAt: '2021-03-20T12:00:00.000Z', updatedAt: '2021-03-20T12:00:00.000Z' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2021-03-20T12:00:00.000Z').toDate(),
      syncUntilId: '1924',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(1)
    expect((actual[0] as any).idArbimon).toBe(1925)
  })

  test('includes expected props (& no more)', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 1
    }
    const expectedProps = ['idArbimon', 'idCore', 'slug', 'name', 'updatedAt', 'latitudeNorth', 'latitudeSouth', 'longitudeEast', 'longitudeWest', 'deletedAt']

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, params)

    // Assert
    const item: any = actual[0]
    expect(item).toBeDefined()
    expectedProps.forEach(prop => expect(item).toHaveProperty(prop))
    expect(Object.keys(item).length).toBe(expectedProps.length)
  })

  test('can get project coordinates, even when there is no sites in the project', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 1
    }
    await arbimonSequelize.query('DELETE FROM sites')

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, params)

    // Assert
    const item: any = actual[0]
    expect(item.latitudeNorth).toBe(0)
    expect(item.latitudeSouth).toBe(0)
    expect(item.longitudeEast).toBe(0)
    expect(item.longitudeWest).toBe(0)
  })

  test('can get projects which are `reports_enabled = true`', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1926, name: 'RFCx 7', url: 'rfcx-6', externalId: '807cuoi3cvwi7', createdAt: '2022-08-23T12:00:00.000Z', updatedAt: '2022-08-23T12:00:00.000Z', reportsEnabled: 0 } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 100
    }

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(6)
  })

  test('can get deleted projects', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1927, name: 'RFCx 8', url: 'rfcx-8', externalId: '807cuoi3cvwi8', createdAt: '2022-08-28T12:00:00.000Z', updatedAt: '2022-08-29T12:00:00.000Z', deletedAt: null } })

    await arbimonSequelize.query(SQL_UPDATE_PROJECT, { bind: { projectId: 1927, isPrivate: 0, updatedAt: '2022-08-29T16:00:00.000Z', deletedAt: '2022-08-29T16:00:00.000Z' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 100
    }

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, params) as ProjectArbimon[]
    const [project] = actual.filter(project => project.idArbimon === 1927)

    // Assert
    expect(project).toBeDefined()
    expect(project.deletedAt).toBe('2022-08-29T16:00:00.000Z')
  })

  test('can get deleted projects again', async () => {
    // Arrange
    await arbimonSequelize.query(SQL_INSERT_PROJECT, { bind: { ...DEFAULT_PROJECT, projectId: 1927, name: 'RFCx 8', url: 'rfcx-8', externalId: '807cuoi3cvwi8', createdAt: '2022-08-28T12:00:00.000Z', updatedAt: '2022-08-29T12:00:00.000Z', deletedAt: null } })

    await arbimonSequelize.query(SQL_UPDATE_PROJECT, { bind: { projectId: 1927, isPrivate: 0, updatedAt: '2022-08-29T16:00:00.000Z', deletedAt: '2022-08-29T16:00:00.000Z' } })
    await arbimonSequelize.query(SQL_UPDATE_PROJECT, { bind: { projectId: 1927, isPrivate: 0, updatedAt: '2022-08-29T19:00:00.000Z', deletedAt: '2022-08-29T19:00:00.000Z' } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 100
    }

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, params) as ProjectArbimon[]
    const [project] = actual.filter(project => project.idArbimon === 1927)

    // Assert
    expect(project).toBeDefined()
    expect(project.deletedAt).toBe('2022-08-29T19:00:00.000Z')
  })
})
