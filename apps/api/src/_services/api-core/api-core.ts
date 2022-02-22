import axios from 'axios'
import { FastifyLoggerInstance } from 'fastify'

import { CoreProject } from '@rfcx-bio/common/api-bio/common/permission'

import { ApiClient } from '../api-helpers/api-client'
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

export async function getMedia (logger: FastifyLoggerInstance, url: string): Promise<ArrayBuffer | undefined> {
  // ! `blob` is a "browser only" option. read more here: https://stackoverflow.com/a/60461828
  return await ApiClient.getInstance(logger).getOrUndefined<ArrayBuffer>(url, { responseType: 'arraybuffer' })
}
