import type { AxiosInstance } from 'axios'

export interface SpeciesResponse {
  count?: number
  list?: SpeciesType[]
}

export interface SpeciesType {
  id: number
  project: number
  songtype: number
  songtype_name: string
  species: number
  species_name: string
  taxon: string
}

export interface SpeciesClassesParams {
  limit: number
  offset: number
  q: string
}

export const apiArbimonGetSpeciesClasses = async (apiClient: AxiosInstance, slug: string, params: SpeciesClassesParams): Promise<SpeciesResponse[] | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<SpeciesResponse[]>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/classes`,
      params
    })
    return response.data
  } else return undefined
}

export interface ProjectTemplatesResponse {
  id: number
  project: number
  recording: number
  species: number
  songtype: number
  name: string
  uri?: string
  x1: number
  y1: number
  x2: number
  y2: number
  date_created: string
  user_id: number
  disabled: number
  species_name: string
  songtype_name: string
  author: string
  project_name: string
  project_url: string
  source_project_id?: number
  source_project_name?: string
}

export const apiArbimonGetProjectTemplates = async (apiClient: AxiosInstance, slug: string): Promise<ProjectTemplatesResponse[] | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<ProjectTemplatesResponse[]>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/templates?projectTemplates=true`
    })
    return response.data
  } else return undefined
}

export interface PublicTemplatesParams {
  classIds: number[] | undefined
}
export interface PublicTemplateResponse {
  date_created: string
  disabled: number
  id: number
  name: string
  project: number
  project_name: string
  project_url: string
  recording: number
  songtype: number
  species: number
  uri: string
  user_id: number
  x1: number
  x2: number
  y1: number
  y2: number
}

export const apiArbimonGetPublicTemplates = async (apiClient: AxiosInstance, slug: string, params: PublicTemplatesParams): Promise<PublicTemplateResponse[] | undefined> => {
  if (slug !== undefined && params !== undefined) {
    const response = await apiClient.request<PublicTemplateResponse[]>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/templates/class`,
      params
    })
    return response.data
  } else return undefined
}

export interface TemplateRequest {
  name: string
  recording: number
  roi: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
  songtype: number
  source_project_id: number
  species: number
}
export interface TemplateResponse {
  id: number
  name: string
  project: number
  recording: number
  songtype: number
  source_project_id: number
  species: number
  uri: string
  user_id: number
  x1: number
  x2: number
  y1: number
  y2: number
}

export const apiLegacyAddTemplates = async (apiClient: AxiosInstance, slug: string, params: TemplateRequest): Promise<TemplateResponse> => {
  const res = await apiClient.post(`/legacy-api/project/${slug}/templates/add`, params)
  return res.data
}

export interface DeleteSpeciesRequest {
  project_classes: number[]
}
export interface DeleteSpeciesResponse {
  deleted: string[]
  success: boolean
}

export const apiLegacyDeleteSpecies = async (apiClient: AxiosInstance, slug: string, params: DeleteSpeciesRequest): Promise<DeleteSpeciesResponse> => {
  const res = await apiClient.post(`/legacy-api/project/${slug}/class/del`, params)
  return res.data
}
