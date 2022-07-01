import { attributes, AttributeTypes } from '../type-helpers'

export interface SyncDataType {
  id: number
  name: string
}

export const ATTRIBUTES_SYNC_DATA_TYPE = attributes<SyncDataType>()({
})

export type SyncDataTypeTypes = AttributeTypes<SyncDataType, typeof ATTRIBUTES_SYNC_DATA_TYPE>
