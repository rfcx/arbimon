import type { AxiosInstance } from 'axios'

// Request types
export interface SiteParams {
  count?: Exclude<boolean, false>
  deployment?: Exclude<boolean, false>
  logs?: Exclude<boolean, false>
}

// Response types
export type SitesResponse = SiteResponse[]

export interface AssetItem {
  id: string
  createdAt: string
  deletedAt: string | null
  meta: any
  mimeType: string
}

export interface SiteResponse {
  alt: number
  country_code: string
  deployment: string
  external_id: string
  hidden: number
  id: number
  imported: number
  lat: number
  lon: number
  name: string
  published: number
  rec_count: number
  timezone: string
  timezone_locked: number
  updated_at: string
  utc: string
}

// Service
export const apiArbimonGetSites = async (apiClient: AxiosInstance, slug: string, params: SiteParams): Promise<SitesResponse | undefined> => {
  if (slug !== undefined) {
    const response = await apiClient.request<SitesResponse>({
      method: 'GET',
      url: `/legacy-api/project/${slug}/sites`,
      params
    })
    return response.data
  } else return []
}

export const apiArbimonGetAssets = async (apiClient: AxiosInstance, siteId: string): Promise<AssetItem[] | undefined> => {
  const response = await apiClient.request<AssetItem[]>({
    method: 'GET',
    url: `/streams/${siteId}/assets`
  })
  return response.data
}

export interface CreateSiteBody {
  name: string
  lat?: string | number
  lon?: string | number
  alt?: string | number
  project_id: string
  hidden: number
}

export const apiCorePostCreateSite = async (apiClient: AxiosInstance, payload: CreateSiteBody): Promise<string | undefined> =>
  await apiClient.post('/streams', payload, { headers: { 'Content-Type': 'application/json' } }).then(res => res.data)

export interface EditSiteBody {
  site_id: number
  name: string
  lat: string | number
  lon: string | number
  alt: string | number
  external_id: string
  hidden: number
  project?: ProjectBody
}
export interface ProjectBody {
  project_id: number
  name: string
  url: string
  external_id: string
}

export interface ResponseData {
  data: string
}
export interface TextResponse {
  message: string
}

export const apiBioUpdateDashboardContent = async (apiClient: AxiosInstance, externalId: number, value: EditSiteBody): Promise<CreateSiteBody> => {
  return await apiClient.patch(`/internal/arbimon/streams/${externalId}`, value)
}

export const apiLegacySiteUpdate = async (apiClient: AxiosInstance, slug: string, value: EditSiteBody): Promise<CreateSiteBody> => {
  return await apiClient.post(`/legacy-api/project/${slug}/sites/update`, { site: value })
}

export const apiLegacySiteCreate = async (apiClient: AxiosInstance, slug: string, payload: CreateSiteBody): Promise<ResponseData> => {
  return await apiClient.post(`/legacy-api/project/${slug}/sites/create`, { site: payload })
}

export const apiLegacySiteDelete = async (apiClient: AxiosInstance, slug: string, sites: number[]): Promise<TextResponse> => {
  return await apiClient.post(`/legacy-api/project/${slug}/sites/delete`, { sites })
}
