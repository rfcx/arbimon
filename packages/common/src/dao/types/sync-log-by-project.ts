import { AttributeConstants } from '../type-helpers'

export interface SyncLogByProject {
  id: number
  projectId: number
  syncSourceId: number
  syncDataTypeId: number
  delta: number
}

export const ATTRIBUTES_SYNC_LOG_BY_PROJECT: AttributeConstants<SyncLogByProject> = {
}
