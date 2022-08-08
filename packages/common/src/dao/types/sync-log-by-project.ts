import { attributes, AttributeTypes, WithDates } from '../type-helpers'

export interface SyncLogByProject extends WithDates {
  id: number
  locationProjectId: number
  syncSourceId: number
  syncDataTypeId: number
  delta: number
}

export const ATTRIBUTES_SYNC_LOG_BY_PROJECT = attributes<SyncLogByProject>()({
})

export type SyncLogByProjectTypes = AttributeTypes<SyncLogByProject, typeof ATTRIBUTES_SYNC_LOG_BY_PROJECT>
