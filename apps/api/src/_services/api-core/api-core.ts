import axios from 'axios'

import { CoreProject } from '@rfcx-bio/common/api-bio/common/permission'

import { env } from '../env'
import { Forbidden, NotFound, Unauthorized } from '../errors/data-access-errors'

const CORE_API_BASE_URL = env.CORE_API_BASE_URL

// Responsibility: interpret API response
export async function hasAccessToProject (id: string, token: string): Promise<boolean> {
  return await getProject(id, token)
    .then(() => true)
    .catch(err => {
      if (err instanceof Unauthorized) console.error(err) // TODO: Make this work
      return false
    })
}

// Responsibility: calling API & returning domain errors
export async function getProject (id: string, token: string): Promise<CoreProject> {
  return await axios.request<CoreProject>({
    method: 'GET',
    url: `${CORE_API_BASE_URL}/projects/${id}`
  })
    .then(r => r.data)
    .catch(err => { // TODO: Extract as `unpackAxiosError`
      const status = err.response?.status ?? 0
      switch (status) {
        // Convert from Axios error to our error
        case 401: throw new Unauthorized()
        case 403: throw new Forbidden()
        case 404: throw new NotFound()
        default: throw err
      }
    })
  }
