import { describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getArbimonProjects } from '@/ingest/inputs/get-arbimon-projects'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()

describe('ingest > inputs > getArbimonProjects', () => {
  test('can get oldest projects', async () => {
    // Arrange
    const batchLimit = 2

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, dayjs.utc('1980-01-01T00:00:00.000Z').toDate(), 0, batchLimit)

    // Assert
    expect(actual.length).toBe(batchLimit)
    expect(actual[0].idArbimon).toBe(1920)
    expect(actual[1].idArbimon).toBe(1921)
  })

  test('can get next batch of projects', async () => {
    // Arrange
    const batchLimit = 2

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, dayjs.utc('2021-03-18T11:00:00.000Z').toDate(), 1920, batchLimit)

    // Assert
    expect(actual.length).toBe(batchLimit)
    expect(actual[0].idArbimon).toBe(1921)
    expect(actual[1].idArbimon).toBe(1922)
  })

  test('can get last incomplete batch of projects', async () => {
    // Arrange
    const batchLimit = 2

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, dayjs.utc('2021-03-20T02:00:00.000Z').toDate(), 1922, batchLimit)

    // Assert
    expect(actual.length).toBe(batchLimit)
    expect(actual[0].idArbimon).toBe(1923)
    expect(actual[1].idArbimon).toBe(1924)
  })

  test('can gets no projects when nothing left to sync', async () => {
    // Arrange
    const batchLimit = 2

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, dayjs.utc('2021-03-20T12:00:00.000Z').toDate(), 1924, batchLimit)

    // Assert
    expect(actual.length).toBe(0)
  })

  test('includes expected props (& no more)', async () => {
    // Arrange
    const expectedProps = ['idArbimon', 'idCore', 'slug', 'name']

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, dayjs.utc('1980-01-01T00:00:00.000Z').toDate(), 0, 1)

    // Assert
    const item = actual[0]
    expect(item).toBeDefined()
    expectedProps.forEach(prop => expect(item).toHaveProperty(prop))
    expect(Object.keys(item).length).toBe(expectedProps.length)
  })

  test('does not miss projects with the same updated_at as previously synced', async () => {
    // Arrange
    const batchLimit = 2
    const updatedAtDate = '2021-03-20T12:00:00.000Z'
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
    await arbimonSequelize.query(insertNewRowSQLStatement, { bind: { updatedAt: updatedAtDate } })

    // Act
    const actual = await getArbimonProjects(arbimonSequelize, dayjs.utc(updatedAtDate).toDate(), 1924, batchLimit)

    // Assert
    expect(actual.length).toBe(1)
    expect(actual[0].idArbimon).toBe(1925)
  })
})
