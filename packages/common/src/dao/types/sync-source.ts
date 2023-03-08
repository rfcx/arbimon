import { type AttributeTypes, attributes } from '../type-helpers'

export interface SyncSource {
  id: number
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export const ATTRIBUTES_SOURCE = attributes<SyncSource>()({
})

export type SyncSourceTypes = AttributeTypes<SyncSource, typeof ATTRIBUTES_SOURCE>
