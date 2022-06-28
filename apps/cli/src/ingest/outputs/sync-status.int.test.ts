import { describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { writeSyncResult } from './sync-status'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > sync status', () => {
  test('can add a new status', async () => {
    // Arrange
    const STATUS_LOG = {
      syncSourceId: masterSources.ArbimonValidated.id,
      syncDataTypeId: masterSyncDataTypes.Project.id,
      syncUntilDate: dayjs('1980-01-01T00:00:00.000Z').toDate(),
      syncUntilId: 0,
      syncBatchLimit: 1
    }

    const where = { syncSourceId: STATUS_LOG.syncSourceId, syncDataTypeId: STATUS_LOG.syncDataTypeId }

    // Act
    await writeSyncResult(STATUS_LOG, biodiversitySequelize)

    // Assert
    const result = await ModelRepository.getInstance(biodiversitySequelize).SyncStatus.findOne({ where })
    expect(result).toBeDefined()
    expect(result?.syncUntilDate).toEqual(STATUS_LOG.syncUntilDate)
  })
  test('can update existing status in the database', async () => {
     // Arrange
     const STATUS_LOG = {
      syncSourceId: masterSources.ArbimonValidated.id,
      syncDataTypeId: masterSyncDataTypes.Project.id,
      syncUntilDate: dayjs.utc('2021-03-19T11:00:00.000Z').toDate(),
      syncUntilId: 1921,
      syncBatchLimit: 2
    }

    const where = { syncSourceId: STATUS_LOG.syncSourceId, syncDataTypeId: STATUS_LOG.syncDataTypeId, syncUntilId: STATUS_LOG.syncUntilId }

    // Act
    await writeSyncResult(STATUS_LOG, biodiversitySequelize)

    // Assert
    const result = await ModelRepository.getInstance(biodiversitySequelize).SyncStatus.findAll({ where })

    expect(result.length).toEqual(1)
    expect(result[0].syncUntilId).toBe(STATUS_LOG.syncUntilId)
  })
})
