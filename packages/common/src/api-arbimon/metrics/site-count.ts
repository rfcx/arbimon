import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

// Request types
export interface SiteCountParams {
  slug?: string
}

// Service
export const apiArbimonGetSiteCount = async (apiClient: AxiosInstance, params: SiteCountParams = {}): Promise<number | undefined> =>
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  await apiGetOrUndefined(apiClient, `/api/project/${params?.slug}/sites-count`)
