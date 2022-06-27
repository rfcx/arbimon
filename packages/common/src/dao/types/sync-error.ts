import { AttributeConstants } from '../type-helpers'

export interface SyncError {
  sourceId: number
  syncDataTypeId: number
  externalId: string
  error: string
}

export const ATTRIBUTES_SYNC_ERROR: AttributeConstants<SyncError> = {
}
