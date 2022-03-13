export interface Datasource {
  id: string
  locationProjectId: number
  summaryText?: string
  createdAt: Date
  updatedAt: Date
}

export type DatasourceLight = Omit<Datasource, 'createdAt' | 'updatedAt'>

export const ATTRIBUTES_DATASOURCE: Record<string, Array<keyof Datasource>> = {
  light: ['id', 'locationProjectId', 'summaryText']
}
