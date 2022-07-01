import { describe, expect, test } from 'vitest'

import { masterSources, masterSyncDataTypes } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { writeSyncError } from './sync-error'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > sync error', () => {
  const ERROR_LOG = {
    syncSourceId: masterSources.Arbimon.id,
    syncDataTypeId: masterSyncDataTypes.Project.id,
    externalId: '807cuoi3cvw1',
    error: 'Batch insert failed'
  }

  const { error, ...where } = ERROR_LOG

  test('can log a new error when the sync fails', async () => {
    // Act
    await writeSyncError(ERROR_LOG, biodiversitySequelize)

    // Assert
    const result = await ModelRepository.getInstance(biodiversitySequelize).SyncError.findOne({ where })
    expect(result).toBeDefined()
    expect(result?.error).toBe(ERROR_LOG.error)
  })

  test('can log a new error log for an empty error message', async () => {
    // Act
    await writeSyncError({ ...ERROR_LOG, error: '' }, biodiversitySequelize)
    // Assert
    const result = await ModelRepository.getInstance(biodiversitySequelize).SyncError.findOne({ where })
    expect(result).toBeDefined()
    expect(result?.error).toBe('')
  })

  test('can update existing error in the database', async () => {
    // Act
    await writeSyncError(ERROR_LOG, biodiversitySequelize)

    // Assert
    const result = await ModelRepository.getInstance(biodiversitySequelize).SyncError.findAll({ where })

    expect(result.length).toEqual(1)
    expect(result[0].externalId).toBe(ERROR_LOG.externalId)
  })

  test('fail for a project with invalid external id', async () => {
    // Act & Assert
    try {
      await writeSyncError({ ...ERROR_LOG, externalId: '807cuoi3cvw11' }, biodiversitySequelize)
    } catch (e) {
      expect(e).toMatch(/SequelizeDatabaseError/)
    }
  })

  test('fail for incorrect syncDataTypeId', async () => {
    // Act & Assert
    try {
      await writeSyncError({ ...ERROR_LOG, syncDataTypeId: 10 }, biodiversitySequelize)
    } catch (e) {
      expect(e).includes(/violates foreign key constraint/)
    }
  })
})
