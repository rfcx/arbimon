import { ProjectsResponse, projectsRoute } from '@rfcx-bio/common/api-bio/common/projects'
import { SitesResponse, sitesUrl } from '@rfcx-bio/common/api-bio/common/sites'
import { Project, Site } from '@rfcx-bio/common/dao/types'

import { apiClient } from '~/api'

export class ProjectService {
  constructor (private readonly baseUrl: string) {}

  async getProjects (): Promise<Project[] | undefined> {
    return await apiClient.getOrUndefined<ProjectsResponse>(`${this.baseUrl}${projectsRoute}`)
  }

  async getSites (projectId: number): Promise<Site[] | undefined> {
    return await apiClient.getOrUndefined<SitesResponse>(`${this.baseUrl}${sitesUrl({ projectId: projectId.toString() })}`)
  }
}
