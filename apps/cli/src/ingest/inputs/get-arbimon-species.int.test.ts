import { describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getArbimonSpecies } from '@/ingest/inputs/get-arbimon-species'
import { SyncQueryParams } from './sync-query-params'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()

describe('ingest > inputs > getArbimonSpecies', () => {
  test('can get oldest species', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2021-03-18T11:00:00.000Z').toDate(),
      syncUntilId: 0,
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(params.syncBatchLimit)
    expect(actual[0].idArbimon).toBe(3842)
    expect(actual[1].idArbimon).toBe(9620)
  })

  test('can get next batch of species without species id', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-06-20T00:00:00.000Z').toDate(),
      syncUntilId: 0,
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(2)
    expect(actual[0].idArbimon).toBe(501)
    expect(actual[1].idArbimon).toBe(1050)
  })

  test('can get next batch of species include species id', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-06-22T11:00:00.000Z').toDate(),
      syncUntilId: 501,
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(2)
    expect(actual[0].idArbimon).toBe(1050)
    expect(actual[1].idArbimon).toBe(2755)
  })

  test('can get last incomplete batch of species', async () => {
     // Arrange
     const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-06-22T11:00:00.000Z').toDate(),
      syncUntilId: 2755,
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(1)
    expect(actual[0].idArbimon).toBe(74)
  })

  test('can gets no species when nothing left to sync', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-06-23T15:40:00.000Z').toDate(),
      syncUntilId: 74,
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(0)
  })

  test('includes expected props (& no more)', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: 0,
      syncBatchLimit: 1
    }
    const expectedProps = ['idArbimon', 'slug', 'scientificName', 'taxonClassId', 'updatedAt']

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    const item = actual[0]
    expect(item).toBeDefined()
    expectedProps.forEach(prop => expect(item).toHaveProperty(prop))
    expect(Object.keys(item).length).toBe(expectedProps.length)
  })

  test('does not miss species with the same updated_at as previously synced', async () => {
    // Arrange
    const updatedAt = '2022-06-23T16:00:00.000Z'

    const insertNewRowSQLStatement = `
      INSERT INTO species (
          species_id, scientific_name, code_name, taxon_id, family_id, image, description,
          biotab_id, defined_by, created_at, updated_at
      )
      VALUES (2756, 'Eudynamys scolopacea', 'EUDSCO', 1, 70, NULL, NULL, NULL, NULL, $updatedAt, $updatedAt);
      `
    await arbimonSequelize.query(insertNewRowSQLStatement, { bind: { updatedAt } })

    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc(updatedAt).toDate(),
      syncUntilId: 2755,
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual.length).toBe(1)
    expect(actual[0].idArbimon).toBe(2756)
  })
})
