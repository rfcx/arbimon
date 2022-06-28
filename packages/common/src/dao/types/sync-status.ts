import { attributes } from '../type-helpers'

export interface SyncStatus {
  syncSourceId: number
  syncDataTypeId: number
  syncUntilDate: Date
  syncUntilId: number
  syncBatchLimit: number
}

export const ATTRIBUTES_SYNC_STATUS = attributes<SyncStatus>()({
})
