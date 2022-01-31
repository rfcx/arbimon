import axios from 'axios'

import { CoreProject } from '@rfcx-bio/common/api-bio/common/permission'

import { unpackAxiosError } from '../api-helpers/axios-errors'
import { env } from '../env'

const CORE_API_BASE_URL = env.CORE_API_BASE_URL

// Responsibility: calling API & returning domain errors
export async function getProject (id: string, token: string): Promise<CoreProject> {
  return await axios.request<CoreProject>({
    method: 'GET',
    url: `${CORE_API_BASE_URL}/projects/${id}`
  })
    .then(r => r.data)
    .catch(unpackAxiosError)
  }
