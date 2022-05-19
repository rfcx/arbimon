import { AttributeConstants } from '../../type-helpers'

export interface SyncStatus {
  sourceId: number
  syncDataTypeId: number
  syncUntilDate: Date
}

export const ATTRIBUTES_SYNC_STATUS: AttributeConstants<SyncStatus> = {
}
