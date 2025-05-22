import { type AxiosInstance } from 'axios'

// Request types
export interface SiteParams {
  count?: Exclude<boolean, false>
  deployment?: Exclude<boolean, false>
  logs?: Exclude<boolean, false>
}

// Response types
export type SitesResponse = SiteResponse[]

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

export interface CreateSiteBody {
  name: string
  latitude: string
  longitude: string
  altitude: string
  project_id: string
  is_public: boolean
}

export const apiCorePostCreateSite = async (apiClient: AxiosInstance, payload: CreateSiteBody): Promise<string | undefined> =>
  await apiClient.post('/streams', payload, { headers: { 'Content-Type': 'application/json' } }).then(res => res.data)

export interface EditSiteBody {
  site_id: number
  name: string
  lat: string
  lon: string
  alt: string
  external_id: string
  project: ProjectBody
}
export interface ProjectBody {
  project_id: number
  name: string
  url: string
  external_id: string
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

export const apiLegacySiteDelete = async (apiClient: AxiosInstance, slug: string, sites: number[]): Promise<TextResponse> => {
  return await apiClient.post(`/legacy-api/project/${slug}/sites/delete`, { sites })
}
