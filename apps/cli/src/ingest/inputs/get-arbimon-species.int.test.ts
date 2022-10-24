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
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(params.syncBatchLimit)
    expect(actual[0].idArbimon).toBe(42251)
    expect(actual[1].idArbimon).toBe(16729)
  })

  test('can get next batch when updated_at is greater', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-06-20T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(2)
    expect(actual[0].idArbimon).toBe(501)
    expect(actual[1].idArbimon).toBe(1050)
  })

  test('can get next batch when updated_at is equal and id is greater', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-06-22T11:00:00.000Z').toDate(),
      syncUntilId: '501',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(2)
    expect(actual[0].idArbimon).toBe(1050)
    expect(actual[1].idArbimon).toBe(2755)
  })

  test('can get last incomplete batch of species', async () => {
     // Arrange
     const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-06-22T11:00:00.000Z').toDate(),
      syncUntilId: '2755',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(1)
    expect(actual[0].idArbimon).toBe(74)
  })

  test('can gets no species when nothing left to sync', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('2022-06-23T15:40:00.000Z').toDate(),
      syncUntilId: '74',
      syncBatchLimit: 2
    }

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    expect(actual).toHaveLength(0)
  })

  test('includes expected props (& no more)', async () => {
    // Arrange
    const params: SyncQueryParams = {
      syncUntilDate: dayjs.utc('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: '0',
      syncBatchLimit: 1
    }
    const expectedProps = ['idArbimon', 'scientificName', 'taxonClassId', 'updatedAt']

    // Act
    const actual = await getArbimonSpecies(arbimonSequelize, params)

    // Assert
    const item = actual[0]
    expect(item).toBeDefined()
    expectedProps.forEach(prop => expect(item).toHaveProperty(prop))
    expect(Object.keys(item)).toHaveLength(expectedProps.length)
  })
})
