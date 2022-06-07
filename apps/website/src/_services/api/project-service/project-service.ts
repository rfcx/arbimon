import { AxiosInstance } from 'axios'

import { ProjectFiltersResponse, projectFiltersUrl } from '@rfcx-bio/common/api-bio/common/project-filters'
import { ProjectsResponse, projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'
import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

export const getProjects = async (apiClient: AxiosInstance): Promise<ProjectsResponse | undefined> =>
  await apiGetOrUndefined<ProjectsResponse>(apiClient, `${projectsRoute}`)

export const getProjectFilters = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectFiltersResponse | undefined> =>
  await apiGetOrUndefined<ProjectFiltersResponse>(apiClient, `${projectFiltersUrl({ projectId: projectId.toString() })}`)
