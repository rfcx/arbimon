import { attributes, AttributeTypes } from '../type-helpers'

export interface SyncStatus {
  syncSourceId: number
  syncDataTypeId: number
  syncUntilDate: Date
  syncUntilId: string
  syncBatchLimit: number
}

export const ATTRIBUTES_SYNC_STATUS = attributes<SyncStatus>()({
})

export type SyncStatusTypes = AttributeTypes<SyncStatus, typeof ATTRIBUTES_SYNC_STATUS>
