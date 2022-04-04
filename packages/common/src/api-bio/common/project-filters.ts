import { DataSource, Site, TaxonClass } from '../../dao/types-table'
import { ProjectSpecificRouteParams } from '../common/project-specific-route'

// Request
export type ProjectFiltersParams = ProjectSpecificRouteParams

export const projectFiltersRoute = '/projects/:projectId/filters'

export const projectFiltersUrl = (params: ProjectFiltersParams): string =>
  `/projects/${params.projectId}/filters`

// Response
export interface ProjectFiltersResponse {
  locationSites: Site[]
  taxonClasses: TaxonClass[]
  dateStartInclusiveUtc?: string
  dateEndInclusiveUtc?: string
  updatedList: DataSource[]
}
