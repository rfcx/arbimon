import { AttributeConstants, WithDates } from '../../type-helpers'

export interface SourceSync extends WithDates {
  id: number
  hash: string
  projectId: number
  sourceId: number
  summaryText: string
}

export const ATTRIBUTES_SOURCE_SYNC: AttributeConstants<SourceSync> = {
  light: ['id', 'hash', 'projectId', 'summaryText']
}
