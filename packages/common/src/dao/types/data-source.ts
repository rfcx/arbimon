import { WithDates } from './_common'

export interface DataSource extends WithDates {
  id: string
  locationProjectId: number
  summaryText: string
}

export const ATTRIBUTES_DATA_SOURCE: Record<string, Array<keyof DataSource>> = {
  light: ['id', 'locationProjectId', 'summaryText']
}
