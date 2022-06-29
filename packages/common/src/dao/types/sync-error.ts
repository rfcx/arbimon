import { attributes } from '../type-helpers'

export interface SyncError {
  syncSourceId: number
  syncDataTypeId: number
  externalId: string
  error: string
}

export const ATTRIBUTES_SYNC_ERROR = attributes<SyncError>()({
})
