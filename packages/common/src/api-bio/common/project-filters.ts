import { Datasource, Site, TaxonClass } from '../../dao/types'

// Request
export interface ProjectFiltersParams {
  projectId: string
}

export const projectFiltersRoute = '/projects/:projectId/filters'

export const projectFiltersUrl = (params: ProjectFiltersParams): string =>
  `/projects/${params.projectId}/filters`

// Response
export interface ProjectFiltersResponse {
  locationSites: Site[]
  taxonClasses: TaxonClass[]
  dateStartInclusiveUtc?: string
  dateEndInclusiveUtc?: string
  latestUpdated: Datasource[]
}
