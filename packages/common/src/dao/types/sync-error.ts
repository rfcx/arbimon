import { attributes, AttributeTypes } from '../type-helpers'

export interface SyncError {
  syncSourceId: number
  syncDataTypeId: number
  externalId: string
  error: string
}

export const ATTRIBUTES_SYNC_ERROR = attributes<SyncError>()({
})

export type SyncErrorTypes = AttributeTypes<SyncError, typeof ATTRIBUTES_SYNC_ERROR>
