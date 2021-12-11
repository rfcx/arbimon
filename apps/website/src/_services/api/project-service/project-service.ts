import { AxiosRequestConfig } from 'axios'

import { Project } from '@rfcx-bio/common/api-bio-types/projects'

import { apiClient } from '..'

/* eslint-disable camelcase */
interface CoreApiProject {
  id: string
  name: string
  is_public: boolean
  external_id: number
}
/* eslint-enable camelcase */

const toProject = (data: CoreApiProject): Project => {
  return {
    id: data.id,
    name: data.name,
    isPublic: data.is_public,
    externalId: data.external_id
  }
}

const endpointProjects: AxiosRequestConfig = {
  method: 'GET',
  url: `${import.meta.env.VITE_CORE_API_HOST}/projects`
}

export const getProjects = async (): Promise<Project[]> => {
  try {
    const resp = await apiClient.request<CoreApiProject[]>(endpointProjects)
    return Array.isArray(resp) ? resp.map(toProject) : []
  } catch (error) {
    return await Promise.reject(error)
  }
}
