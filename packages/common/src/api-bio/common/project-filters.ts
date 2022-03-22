import { ProjectSpecificRouteParams } from '@/api-bio/common/project-specific-route'
import { DataSource, Site, TaxonClass } from '../../dao/types'

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
