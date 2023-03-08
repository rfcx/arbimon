import { type AxiosResponse } from 'axios'

import { type ApiCoreClient } from '~/api-core/api-core-client'

export interface CoreProjectNew {
  id?: string // this is ignored by core (overidden)
  name: string
  description?: string
  is_public?: boolean
  organization_id?: string
  external_id?: number
}

export const createProjectInCore = async (apiClient: ApiCoreClient, coreBaseUrl: string, project: CoreProjectNew): Promise<string> => {
  const response = await apiClient.requestRaw({
    url: `${coreBaseUrl}/projects`,
    method: 'POST',
    headers: { source: 'arbimon' }, // Specifying this prevents the Core API from creating the project again in Arbimon
    data: project
  })

  return getCoreIdFromResponse(response)
}

const HEADER_LOCATION_PREFIX = '/projects/'

const getCoreIdFromResponse = (response: AxiosResponse<unknown, CoreProjectNew>): string =>
  response.headers.location.slice(HEADER_LOCATION_PREFIX.length)
