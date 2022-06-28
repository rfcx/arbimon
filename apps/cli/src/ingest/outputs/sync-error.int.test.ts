import { describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { writeSyncError } from './sync-error'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > sync error', () => {
  const ERROR_LOG = {
    syncSourceId: masterSources.ArbimonValidated.id,
    syncDataTypeId: masterSyncDataTypes.Project.id,
    externalId: '807cuoi3cvw1',
    error: 'Batch insert failed'
  }

  const where = { syncSourceId: ERROR_LOG.syncSourceId, syncDataTypeId: ERROR_LOG.syncDataTypeId, externalId: ERROR_LOG.externalId }

  test('can log a new error when the sync fails', async () => {
    // Act
    await writeSyncError(ERROR_LOG, biodiversitySequelize)

    // Assert
    const result = await ModelRepository.getInstance(biodiversitySequelize).SyncError.findOne({ where })
    expect(result).toBeDefined()
    expect(result?.error).toBe(ERROR_LOG.error)
  })
  test('can update existing error in the database', async () => {
    // Act
    await writeSyncError(ERROR_LOG, biodiversitySequelize)

    // Assert
    const result = await ModelRepository.getInstance(biodiversitySequelize).SyncError.findAll({ where })

    expect(result.length).toEqual(1)
    expect(result[0].externalId).toBe(ERROR_LOG.externalId)
  })
})
