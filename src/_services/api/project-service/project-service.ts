import ApiClient from '@/_services/api-helpers/rest/api-service'
import { endpointProjects } from '@/_services/api-helpers/rest/endpoints'
import { RawProjectListItem } from '@/_services/api-helpers/rest/types'
import { Project } from '../types'

const mapProjectList = (data: RawProjectListItem): Project => {
  return {
    id: data.id,
    name: data.name,
    isPublic: data.is_public,
    externalId: data.external_id
  }
}

export const getProjects = async (): Promise<Project[]> => {
  try {
    const resp = await ApiClient.request<RawProjectListItem[]>({
      ...endpointProjects
    })
    return Array.isArray(resp) ? resp.map(d => mapProjectList(d)) : []
  } catch (error) {
    return await Promise.reject(error)
  }
}
