import { ProjectsResponse, projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'
import { SitesResponse, sitesUrl } from '@rfcx-bio/common/api-bio/common/sites'

import { apiClient } from '~/api'

export class ProjectService {
  constructor (private readonly baseUrl: string) {}

  async getProjects (): Promise<ProjectsResponse | undefined> {
    return await apiClient.getOrUndefined<ProjectsResponse>(`${this.baseUrl}${projectsRoute}`)
  }

  async getSites (projectId: number): Promise<SitesResponse | undefined> {
    return await apiClient.getOrUndefined<SitesResponse>(`${this.baseUrl}${sitesUrl({ projectId: projectId.toString() })}`)
  }
}
