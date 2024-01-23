import { type ProjectsGeoResponse, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'
import { type Project } from '@rfcx-bio/common/dao/types'

import { query } from '@/projects/dao/projects-dao'

export const getProjects = async (limit?: number, offset?: number): Promise<ProjectsResponse> => {
  return await query<Project>({}, { limit, offset })
}

export const getProjectsGeo = async (limit?: number, offset?: number): Promise<ProjectsGeoResponse> => {
  // TODO: add cache

  return await query<Project>({}, { limit, offset, attributesSet: 'geo' })
}
