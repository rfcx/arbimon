import { beforeAll, describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getArbimonProjects } from '@/ingest/inputs/get-arbimon-projects'
import { SyncQueryParams } from './sync-query-params'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()

describe('ingest > inputs > getArbimonProjects', () => {
  beforeAll(async () => {
    // reset the project table
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
        (1921, 'RFCx 2', 'rfcx-2', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvw1', 0, '2021-03-19T11:00:00.000Z', '2021-03-19T11:00:00.000Z', NULL, NULL, 1),
        (1922, 'RFCx 3', 'rfcx-3', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvw2', 0, '2021-03-20T02:00:00.000Z', '2021-03-20T02:00:00.000Z', NULL, NULL, 1),
        (1923, 'RFCx 4', 'rfcx-4', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvw3', 0, '2021-03-20T11:00:00.000Z', '2021-03-20T11:00:00.000Z', NULL, NULL, 1),
        (1924, 'RFCx 5', 'rfcx-5', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvw4', 0, '2021-03-20T12:00:00.000Z', '2021-03-20T12:00:00.000Z', NULL, NULL, 1)
      ;
    `)
    await arbimonSequelize.query(`
      INSERT INTO sites (site_id,site_type_id,project_id,name,lat,lon,alt,published,token_created_on,external_id,created_at,timezone,updated_at) 
      VALUES 
        (88526, 2,1920,'NU - Eng',16.74431766767897,100.19638897131505,0.0,0,NULL,'cm1n9bvgn0jr','2022-03-22 05:50:30','Asia/Bangkok','2022-03-22 05:50:30'), 
        (88527, 2,1920,'NU - Sci',16.74252666589018,100.19407545061581,0.0,0,NULL,'wchdzd6327i4','2022-03-22 05:50:30','Asia/Bangkok','2022-03-22 05:50:30'), 
        (88528, 2,1920,'NU - Sci Park',16.742010693566815,100.1923308193772,0.0,0,NULL,'cydwrzz91cbz','2022-03-22 05:50:30','Asia/Bangkok','2022-03-22 05:50:30')
      ;
      `)
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
    const updatedAt = '2021-03-20T12:00:00.000Z'

    const insertNewRowSQLStatement = `
    INSERT INTO projects (
        project_id, name, url, description, project_type_id, is_private, is_enabled,
        current_plan, storage_usage, processing_usage, pattern_matching_enabled,
        citizen_scientist_enabled, cnn_enabled, aed_enabled, clustering_enabled,
        external_id, featured, created_at, updated_at, deleted_at, image, reports_enabled
    )
    VALUES (1925, 'RFCx 6', 'rfcx-6', 'A test project for testing', 1, 1, 1, 846, 0.0, 0.0, 1, 0, 0, 0, 0, '807cuoi3cvwi5', 0, $updatedAt, $updatedAt, NULL, NULL, 1)
    ;
    `
    await arbimonSequelize.query(insertNewRowSQLStatement, { bind: { updatedAt } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc(updatedAt).toDate(),
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
    const expectedProps = ['idArbimon', 'idCore', 'slug', 'name', 'updatedAt', 'latitudeNorth', 'latitudeSouth', 'longitudeEast', 'longitudeWest']

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
})
