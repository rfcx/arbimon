import { ProjectFiltersResponse, projectFiltersUrl } from '@rfcx-bio/common/api-bio/common/project-filters'
import { ProjectsResponse, projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'

import { apiClient } from '~/api'

export class ProjectService {
  constructor (private readonly baseUrl: string) {}

  async getProjects (): Promise<ProjectsResponse | undefined> {
    return await apiClient.getOrUndefined<ProjectsResponse>(`${this.baseUrl}${projectsRoute}`)
  }

  async getProjectFilters (projectId: number): Promise<ProjectFiltersResponse | undefined> {
    return await apiClient.getOrUndefined<ProjectFiltersResponse>(`${this.baseUrl}${projectFiltersUrl({ projectId: projectId.toString() })}`)
  }
}
