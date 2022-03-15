export interface Datasource {
  id: string
  locationProjectId: number
  summaryText?: string
}

export const ATTRIBUTES_DATASOURCE: Record<string, Array<keyof Datasource>> = {
  light: ['id', 'locationProjectId', 'summaryText']
}
