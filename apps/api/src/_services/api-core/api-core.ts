import axios from 'axios'
import { type FastifyLoggerInstance } from 'fastify'

import { type DetectCnnDetectionsQueryParams, type DetectCnnDetectionsResponse } from '@rfcx-bio/common/api-bio/detect/detect-cnn-detections'
import { type CoreProject, type CoreProjectLight } from '@rfcx-bio/common/api-core/project/permission'

import { ApiClient } from '../api-helpers/api-client'
import { unpackAxiosError } from '../api-helpers/axios-errors'
import { env } from '../env'

const CORE_API_BASE_URL = env.CORE_API_BASE_URL
const DEFAULT_MEMBER_PROJECT_LIMIT = 1000
const DEFAULT_MEMBER_PROJECT_OFFSET = 0

export async function getIsProjectMemberFromApi (projectId: string, token: string): Promise<CoreProject> {
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

export async function getDetectionsFromApi (token: string, params: DetectCnnDetectionsQueryParams): Promise<DetectCnnDetectionsResponse[]> {
  return await axios.request<DetectCnnDetectionsResponse[]>({
    method: 'GET',
    url: `${CORE_API_BASE_URL}/detections`,
    headers: {
      authorization: token
    },
    params
  })
  .then(r => r.data)
  .catch(unpackAxiosError)
}

export async function getMemberProjectCoreIdsFromApi (token: string): Promise<string[]> {
  const results: string[][] = []
  let offset = DEFAULT_MEMBER_PROJECT_OFFSET

  while (true) {
    // Get 1 "page" of IDs
    const ids = await getMemberProjectCoreIdsFromApiPaged(token, DEFAULT_MEMBER_PROJECT_LIMIT, offset)

    // Store new IDs & increment offset
    results.push(ids)
    offset = offset + DEFAULT_MEMBER_PROJECT_LIMIT

    // Stop if the last request wasn't a complete "page"
    if (ids.length < DEFAULT_MEMBER_PROJECT_LIMIT) break
  }

  return results.flat()
}

async function getMemberProjectCoreIdsFromApiPaged (token: string, limit: number = DEFAULT_MEMBER_PROJECT_LIMIT, offset: number = DEFAULT_MEMBER_PROJECT_OFFSET): Promise<string[]> {
  try {
    const resp = await axios.request<CoreProjectLight[]>({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/projects?fields=id&limit=${limit}&offset=${offset}`,
      headers: { authorization: token }
    })

    return resp.data?.map(({ id }) => id) ?? []
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function createProject (project: Pick<CoreProject, 'name' | 'is_public'>, token: string): Promise<string> {
  const response = await axios.request<unknown>({
    method: 'POST',
    url: `${CORE_API_BASE_URL}/projects`,
    headers: { authorization: token },
    data: project
  }).catch(unpackAxiosError)
  const id = response.headers.location.split('/').pop()
  if (id === undefined) throw new Error('Create project failed: no core id')
  return id
}

export async function getProject (id: string, token: string): Promise<Pick<CoreProjectLight, 'external_id'>> {
  const response = await axios.request<Pick<CoreProjectLight, 'external_id'>>({
    method: 'GET',
    url: `${CORE_API_BASE_URL}/projects/${id}?fields=external_id`,
    headers: { authorization: token }
  }).catch(unpackAxiosError)
  return response.data
}
