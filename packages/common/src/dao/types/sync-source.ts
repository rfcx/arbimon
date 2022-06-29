import { attributes } from '../type-helpers'

export interface SyncSource {
  id: number
  name: string
}

export const ATTRIBUTES_SOURCE = attributes<SyncSource>()({
})
