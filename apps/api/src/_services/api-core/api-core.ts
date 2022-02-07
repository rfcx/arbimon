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

export async function getMedia (url: string): Promise<ArrayBuffer | undefined> {
  // ! `blob` is a "browser only" option. read more here: https://stackoverflow.com/a/60461828
  return await apiClient.getOrUndefined<ArrayBuffer>(url, { responseType: 'arraybuffer' })
}
