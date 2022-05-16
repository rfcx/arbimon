import { AttributeConstants, WithDates } from '../../type-helpers'

export interface SourceSync extends WithDates {
  id: number
  hash: string
  projectId: number
  sourceId: number
  changesJson: Record<string, any> // { species: 3, sites: -2 }
}

export const ATTRIBUTES_SOURCE_SYNC: AttributeConstants<SourceSync> = {
}
