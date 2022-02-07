import axios from 'axios'

import { CoreProject } from '@rfcx-bio/common/api-bio/common/permission'

import { apiClient } from '~/api-helpers/api-client'
import { unpackAxiosError } from '../api-helpers/axios-errors'
import { env } from '../env'

const CORE_API_BASE_URL = env.CORE_API_BASE_URL

// Responsibility: calling API & returning domain errors
export async function getProjectPermission (projectId: string, token: string): Promise<CoreProject> {
  return await axios.request<CoreProject>({
    method: 'GET',
    url: `${CORE_API_BASE_URL}/projects/${projectId}/users`,
    headers: { authorization: token }
  })
    .then(r => r.data)
    .catch(unpackAxiosError)
  }

export async function getMedia (url: string): Promise<Blob | undefined> {
  return await apiClient.getOrUndefined<Blob>(url, { responseType: 'blob' })
}
