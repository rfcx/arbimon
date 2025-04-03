import { type AxiosInstance } from 'axios'

// Request types
export interface SiteParams {
  count?: Exclude<boolean, false>
  deployment?: Exclude<boolean, false>
  logs?: Exclude<boolean, false>
}

// Response types
export type SitesResponse = SiteResponse[]

interface SiteResponse {
  alt: number
  country_code: string
  deployment: number
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
