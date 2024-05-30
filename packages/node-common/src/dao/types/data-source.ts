import { type AttributeTypes, type WithDates, attributes } from '../type-helpers'

export interface DataSource extends WithDates {
  id: string
  locationProjectId: number
  summaryText: string
}

export const ATTRIBUTES_DATA_SOURCE = attributes<DataSource>()({
  light: ['id', 'locationProjectId', 'summaryText']
})

export type DataSourceTypes = AttributeTypes<DataSource, typeof ATTRIBUTES_DATA_SOURCE>
