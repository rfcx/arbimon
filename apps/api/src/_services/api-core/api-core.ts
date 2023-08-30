import axios from 'axios'
import { type FastifyLoggerInstance } from 'fastify'

import { type ClassifierQueryParams, type ClassifierResponse } from '@rfcx-bio/common/api-bio/classifiers/classifier'
import { type DetectSummaryQueryParams, type DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { type DetectValidationResultsQueryParams, type DetectValidationResultsResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-results'
import { type DetectReviewDetectionBody, type DetectReviewDetectionResponse } from '@rfcx-bio/common/api-bio/detect/review-detections'
import { type CoreProject, type CoreProjectLight } from '@rfcx-bio/common/api-core/project/permission'

import { ApiClient } from '../api-helpers/api-client'
import { unpackAxiosError } from '../api-helpers/axios-errors'
import { env } from '../env'
import { type DetectDetectionsQueryParamsCore, type DetectDetectionsResponseCore } from './types'

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

export async function getDetectionsFromApi (token: string, params: DetectDetectionsQueryParamsCore): Promise<DetectDetectionsResponseCore> {
  return await axios.request<DetectDetectionsResponseCore>({
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

export async function updateDetectionReviewFromApi (token: string, classifierJobId: number, data: DetectReviewDetectionBody): Promise<DetectReviewDetectionResponse> {
  try {
    const resp = await axios.request<DetectReviewDetectionResponse>({
      method: 'POST',
      url: `${CORE_API_BASE_URL}/streams/${data.streamId}/detections/${data.start}/review`,
      headers: {
        authorization: token
      },
      data: {
        status: data.status,
        classifier: data.classifier,
        classification: data.classification,
        classifier_job: classifierJobId
      }
    })

    return resp.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getDetectionsStatusFromApi (token: string, jobId: number, query: DetectSummaryQueryParams): Promise<DetectSummaryResponse> {
  try {
    const resp = await axios.request<DetectSummaryResponse>({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifier-jobs/${jobId}`,
      headers: {
        authorization: token
      },
      params: query
    })

    return resp.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getClassifierJobResultsFromApi (token: string, jobId: number, query: DetectValidationResultsQueryParams): Promise<DetectValidationResultsResponse> {
  try {
    const resp = await axios.request({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifier-jobs/${jobId}/results`,
      headers: {
        authorization: token
      },
      params: query
    })

    return resp.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getClassifierFromApi (token: string, classifierId: number, query: ClassifierQueryParams): Promise<ClassifierResponse> {
  try {
    const resp = await axios.request<ClassifierResponse>({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifiers/${classifierId}`,
      headers: {
        authorization: token
      },
      params: query
    })

    return resp.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}
