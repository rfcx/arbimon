import { type AttributeTypes, attributes } from '../type-helpers'

export interface SyncDataType {
  id: number
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_SYNC_DATA_TYPE = attributes<SyncDataType>()({
})

export type SyncDataTypeTypes = AttributeTypes<SyncDataType, typeof ATTRIBUTES_SYNC_DATA_TYPE>
