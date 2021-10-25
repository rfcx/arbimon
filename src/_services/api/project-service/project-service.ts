import { apiClient } from '~/api-helpers/rest/api-service'
import { endpointProjects } from '~/api-helpers/rest/endpoints'
import { RawProjectListItem } from '~/api-helpers/rest/types'
import { Project } from '../types'

const toProject = (data: RawProjectListItem): Project => {
  return {
    id: data.id,
    name: data.name,
    isPublic: data.is_public,
    externalId: data.external_id
  }
}

export const getProjects = async (): Promise<Project[]> => {
  try {
    const resp = await apiClient.request<RawProjectListItem[]>({
      ...endpointProjects
    })
    return Array.isArray(resp) ? resp.map(toProject) : []
  } catch (error) {
    return await Promise.reject(error)
  }
}
