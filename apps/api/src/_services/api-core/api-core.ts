import axios from 'axios'
import { FastifyLoggerInstance } from 'fastify'

import { CoreProject, CoreProjectLight } from '@rfcx-bio/common/api-bio/common/permission'

import { ApiClient } from '../api-helpers/api-client'
import { unpackAxiosError } from '../api-helpers/axios-errors'
import { env } from '../env'

const CORE_API_BASE_URL = env.CORE_API_BASE_URL

// Responsibility: calling API & returning domain errors
export async function getIsProjectMember (projectId: string, token: string): Promise<CoreProject> {
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

export async function getMemberProjectCoreIdsFromApi (token: string, limit: number = 1000, offset: number = 0): Promise<string[]> {
  try {
    const resp = await axios.request<CoreProjectLight[]>({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/projects?fields=id&limit=${limit} &offset=${offset}`,
      headers: { authorization: token }
    })

    return resp.data?.map(({ id }) => id) ?? []
  } catch (e) {
    return unpackAxiosError(e)
  }
}
