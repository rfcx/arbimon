import { WithDates } from '../../type-helpers/with-dates'

export interface DataSource extends WithDates {
  id: string
  projectId: number
  summaryText: string
}

export const ATTRIBUTES_DATA_SOURCE: Record<string, Array<keyof DataSource>> = {
  light: ['id', 'projectId', 'summaryText']
}
