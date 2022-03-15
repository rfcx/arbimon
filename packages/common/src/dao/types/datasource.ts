export interface Datasource {
  id: string
  locationProjectId: number
  summaryText?: string
}

export const ATTRIBUTES_DATASOURCE: Record<string, Array<keyof DataSource>> = {
  light: ['id', 'locationProjectId', 'summaryText']
}
