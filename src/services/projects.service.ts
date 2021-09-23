import * as Endpoints from '@/api/endpoints'
import { ProjectModels } from '@/models'
import ApiClient from './api.service'

interface ProjectRequest {
  limit?: number
  offset?: number
  keyword?: string
}

function mapProjectList (data: ProjectModels.RawProjectListItem): ProjectModels.ProjectListItem {
  return {
    id: data.id,
    name: data.name,
    isPublic: data.is_public,
    externalId: data.external_id
  }
}

export async function getProjects (options?: ProjectRequest): Promise<ProjectModels.ProjectListItem[]> {
  try {
    const resp = await ApiClient.request<ProjectModels.RawProjectListItem[]>({
      ...Endpoints.getProjects
    })
    return Array.isArray(resp) ? resp.map(d => mapProjectList(d)) : []
  } catch (error) {
    return await Promise.reject(error)
  }
}
