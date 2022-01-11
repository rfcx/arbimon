import { Project, ProjectsResponse, projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'
import { Site, SitesResponse, sitesUrl } from '@rfcx-bio/common/api-bio/common/sites'

import { apiClient } from '~/api'

export class ProjectService {
  constructor (private readonly baseUrl: string) {}

  async getProjects (): Promise<Project[] | undefined> {
    return await apiClient.getOrUndefined<ProjectsResponse>(`${this.baseUrl}${projectsRoute}`)
  }

  async getSites (projectId: string): Promise<Site[] | undefined> {
    return await apiClient.getOrUndefined<SitesResponse>(`${this.baseUrl}${sitesUrl({ projectId })}`)
  }
}
