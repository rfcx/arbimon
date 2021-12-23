import { AxiosRequestConfig } from 'axios'

import { Project } from '@rfcx-bio/common/api-bio/common/projects'

import { apiClient } from '..'

/* eslint-disable camelcase */
interface CoreApiProject {
  id: string
  name: string
  is_public: boolean
  external_id: number
}
/* eslint-enable camelcase */

const CORE_API_HOST: string = import.meta.env.VITE_CORE_API_HOST // TODO ??? - Fix @typescript/eslint so it picks up vite-env.d.ts

const toProject = (data: CoreApiProject): Project => {
  return {
    id: data.id,
    name: data.name,
    isPublic: data.is_public,
    externalId: data.external_id,
    geoBounds: [
      { lon: -65.24505, lat: 18.51375 },
      { lon: -67.94469784, lat: 17.93168 }
    ]
  }
}

const endpointProjects: AxiosRequestConfig = {
  method: 'GET',
  url: `${CORE_API_HOST}/projects`
}

export const getProjects = async (): Promise<Project[]> => {
  try {
    const resp = await apiClient.request<CoreApiProject[]>(endpointProjects)
    return Array.isArray(resp) ? resp.map(toProject) : []
  } catch (error) {
    return await Promise.reject(error)
  }
}
