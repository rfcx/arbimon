export interface Datasource {
  id: string
  locationProjectId: number
  summaryText?: string
  updatedAt: Date
}

export type DatasourceLight = Omit<Datasource, 'updatedAt'>

export const ATTRIBUTES_DATASOURCE: Record<string, Array<keyof Datasource>> = {
  light: ['id', 'locationProjectId', 'summaryText', 'updatedAt']
}
