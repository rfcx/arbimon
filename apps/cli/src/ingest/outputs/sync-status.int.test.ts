import { describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { writeSyncResult } from './sync-status'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > sync status', () => {
  const STATUS_LOG = {
    syncSourceId: masterSources.Arbimon.id,
    syncDataTypeId: masterSyncDataTypes.Project.id,
    syncUntilDate: dayjs.utc('2021-03-19T11:00:00.000Z').toDate(),
    syncUntilId: '1921',
    syncBatchLimit: 2
  }

  const where = { syncSourceId: STATUS_LOG.syncSourceId, syncDataTypeId: STATUS_LOG.syncDataTypeId }

  test('can add a new status', async () => {
    // Arrange
    const syncUntilDate = dayjs('1980-01-01T00:00:00.000Z').toDate()
    // Act
    await writeSyncResult({ ...STATUS_LOG, syncUntilDate }, biodiversitySequelize)

    // Assert
    const result = await ModelRepository.getInstance(biodiversitySequelize).SyncStatus.findOne({ where })
    expect(result).toBeDefined()
    expect(result?.syncUntilDate).toEqual(syncUntilDate)
  })

  test('can update existing status in the database', async () => {
    // Arrange
    const syncUntilDate = dayjs('1980-01-01T00:00:00.000Z').toDate()

    // Act
    await writeSyncResult({ ...STATUS_LOG, syncUntilDate }, biodiversitySequelize)
    await writeSyncResult(STATUS_LOG, biodiversitySequelize)

    // Assert
    const result = await ModelRepository.getInstance(biodiversitySequelize).SyncStatus.findAll({ where: { ...where, syncUntilId: STATUS_LOG.syncUntilId } })

    expect(result.length).toEqual(1)
    expect(result[0].syncUntilId).toBe(STATUS_LOG.syncUntilId)
  })

  test('can update existing status when syncBatchLimit is empty', async () => {
    // Act
    await writeSyncResult({ ...STATUS_LOG, syncBatchLimit: 0 }, biodiversitySequelize)

    // Assert
    const result = await ModelRepository.getInstance(biodiversitySequelize).SyncStatus.findAll({ where: { ...where, syncUntilId: STATUS_LOG.syncUntilId } })

    expect(result.length).toEqual(1)
    expect(result[0].syncUntilId).toBe(STATUS_LOG.syncUntilId)
  })

  test('fail for a project with incorrect id', async () => {
    // Act & Assert
    try {
      await writeSyncResult({ ...STATUS_LOG, syncUntilId: '1821' }, biodiversitySequelize)
    } catch (e) {
      expect(e).toMatch(/Batch insert failed/)
    }
  })

  test('fail for incorrect syncDataTypeId', async () => {
    // Act & Assert
    try {
      await writeSyncResult({ ...STATUS_LOG, syncDataTypeId: 10 }, biodiversitySequelize)
    } catch (e) {
      expect(e).includes(/violates foreign key constraint/)
    }
  })

  test('fail for invalid date', async () => {
    // Act & Assert
    try {
      await writeSyncResult({ ...STATUS_LOG, syncUntilDate: dayjs('').toDate() }, biodiversitySequelize)
    } catch (e) {
      expect(e).includes(/invalid input syntax for type timestamp with time zone/)
    }
  })
})
