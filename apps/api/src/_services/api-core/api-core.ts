import axios from 'axios'
import { type FastifyLoggerInstance } from 'fastify'

import { type ClassifierQueryParams, type ClassifierResponse } from '@rfcx-bio/common/api-bio/classifiers/classifier'
import { type Classifier } from '@rfcx-bio/common/api-bio/classifiers/classifiers'
import { type UpdateClassifierJobBody } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type DetectSummaryQueryParams, type DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { type DetectValidationResultsQueryParams, type DetectValidationResultsResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-results'
import { type DetectReviewDetectionBody, type DetectReviewDetectionResponse } from '@rfcx-bio/common/api-bio/detect/review-detections'
import { type CoreProject, type CoreProjectLight } from '@rfcx-bio/common/api-core/project/permission'
import { type CoreUser } from '@rfcx-bio/common/api-core/project/users'
import { type WithTotalCount, formatTotalCount } from '@rfcx-bio/common/total-count'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { ApiClient } from '../api-helpers/api-client'
import { unpackAxiosError } from '../api-helpers/axios-errors'
import { env } from '../env'
import { type CoreBestDetection, type CoreBestDetectionQueryParams, type CoreClassificationLite, type CoreClassifierJob, type CoreClassifierJobClassificationSummary, type CoreClassifierJobInformation, type CoreClassifierJobSummary, type CoreClassifierJobTotalDetections, type CoreCreateClassifierJobBody, type CoreDetection, type CoreDetectionsSummary, type CoreGetBestDetectionsSummaryQueryParams, type CoreGetClassifiersQueryParams, type CoreGetDetectionsQueryParams, type CoreGetDetectionsSummaryQueryParams, type CoreUpdateDetectionsStatusResponse, type CoreUpdateDetectionStatusBody, type CoreUpdateDetectionStatusParams, type DetectDetectionsQueryParamsCore, type DetectDetectionsResponseCore, type GetClassifierJobClassificationSummaryQueryParams } from './types'

const CORE_API_BASE_URL = env.CORE_API_BASE_URL

export async function getMedia (logger: FastifyLoggerInstance, url: string): Promise<ArrayBuffer | undefined> {
  // ! `blob` is a "browser only" option. read more here: https://stackoverflow.com/a/60461828
  return await ApiClient.getInstance(logger).getOrUndefined<ArrayBuffer>(url, { responseType: 'arraybuffer' })
}

export async function getDetections (token: string, params: CoreGetDetectionsQueryParams): Promise<WithTotalCount<CoreDetection[]>> {
  try {
    const response = await axios.request<CoreDetection[]>({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/detections`,
      headers: {
        authorization: token
      },
      params
    })

    return {
      total: formatTotalCount(response.headers?.['total-items']),
      data: response.data
    }
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getBestDetections (token: string, classifierJobId: number, params: CoreBestDetectionQueryParams): Promise<WithTotalCount<CoreBestDetection[]>> {
  try {
    const response = await axios.request({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifier-jobs/${classifierJobId}/best-detections`,
      headers: {
        authorization: token
      },
      params
    })

    return {
      total: formatTotalCount(response.headers?.['total-items']),
      data: response.data
    }
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getBestDetectionsSummary (token: string, classifierJobId: number, params: CoreGetBestDetectionsSummaryQueryParams): Promise<CoreDetectionsSummary> {
  try {
    const response = await axios.request<CoreDetectionsSummary>({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifier-jobs/${classifierJobId}/best-detections/summary`,
      headers: {
        authorization: token
      },
      params
    })

    return response.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getDetectionsSummary (token: string, params: CoreGetDetectionsSummaryQueryParams): Promise<CoreDetectionsSummary> {
  try {
    const response = await axios.request<CoreDetectionsSummary>({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/detections/summary`,
      headers: {
        authorization: token
      },
      params
    })

    return response.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

/**
 * @deprecated this is being deprecated because the route is being deprecated. Please use `getDetections`.
 */
export async function getDetectionsFromApi (token: string, params: DetectDetectionsQueryParamsCore): Promise<DetectDetectionsResponseCore> {
  if (params.start === '' || params.end === '') throw new Error('Start and end are required parameters for getting detections')
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

export async function editProject (id: string, project: Pick<CoreProject, 'name'>, token: string): Promise<boolean> {
  if (project.name === undefined) {
    throw new Error('Edit project failed: no name')
  }
  const response = await axios.request({
    method: 'PATCH',
    url: `${CORE_API_BASE_URL}/projects/${id}`,
    headers: { authorization: token, source: 'arbimon' },
    data: project
  }).catch(unpackAxiosError)
  return response.status >= 200 && response.status <= 205
}

export async function deleteProject (id: string, token: string): Promise<void> {
  const response = await axios.request({
    method: 'DELETE',
    url: `${CORE_API_BASE_URL}/projects/${id}`,
    headers: { authorization: token }
  }).catch(unpackAxiosError)
  if (response.status !== 204) throw new Error('Delete project failed: expected 204 status from Core')
}

export async function updateDetectionStatus (token: string, data: CoreUpdateDetectionStatusBody, params: CoreUpdateDetectionStatusParams): Promise<CoreUpdateDetectionsStatusResponse> {
  try {
    const response = await axios.request({
      method: 'POST',
      url: `${CORE_API_BASE_URL}/streams/${params.stream_id}/detections/${params.start}/review`,
      headers: {
        authorization: token
      },
      data
    })

    return response.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

/**
 * @deprecated because the endpoint is being deprecated.
 */
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

export async function getClassifierJobs (token: string, query: { projects: string[], createdBy?: 'me' | 'all' }): Promise<CoreClassifierJob[]> {
  try {
    const response = await axios.request<CoreClassifierJob[]>({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifier-jobs`,
      headers: {
        authorization: token
      },
      params: {
        projects: query.projects,
        created_by: query.createdBy,
        fields: [
          'id',
          'classifier_id',
          'project_id',
          'query_streams',
          'query_start',
          'query_end',
          'query_hours',
          'minutes_total',
          'minutes_completed',
          'status',
          'created_by_id',
          'created_at',
          'completed_at',
          'classifier'
        ]
      }
    })

    return response.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getClassifierJobInformation (token: string, jobId: number): Promise<CoreClassifierJobInformation> {
  try {
    const resp = await axios.request<CoreClassifierJobInformation>({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifier-jobs/${jobId}`,
      headers: {
        authorization: token
      },
      params: {
        fields: [
          'id',
          'classifier_id',
          'project_id',
          'minutes_completed',
          'minutes_total',
          'created_by_id',
          'created_at',
          'completed_at',
          'status',
          'query_start',
          'query_end',
          'query_hours',
          'query_streams',
          'classifier',
          'streams'
        ]
      }
    })

    return resp.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getClassifierJobTotalDetectionsCount (token: string, jobId: number): Promise<CoreClassifierJobTotalDetections> {
  try {
    const resp = await axios.request({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifier-jobs/${jobId}/validation`,
      headers: {
        authorization: token
      }
    })

    return resp.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getClassifierJobSummaries (token: string, jobId: number, params: GetClassifierJobClassificationSummaryQueryParams): Promise<{ total: number, data: CoreClassifierJobClassificationSummary }> {
  try {
    const resp = await axios.request({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifier-jobs/${jobId}/summary`,
      headers: {
        authorization: token
      },
      params
    })

    let total = 0
    const rawHeader = resp.headers?.['total-items']
    if (rawHeader !== undefined && rawHeader !== null && rawHeader !== '' && !Number.isNaN(Number(rawHeader))) {
      total = Number(rawHeader)
    }

    return {
      total,
      data: resp.data
    }
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getClassifierJobSummaryByClassification (token: string, jobId: number, value: string): Promise<CoreClassifierJobSummary & CoreClassificationLite> {
  try {
    const resp = await axios.request({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifier-jobs/${jobId}/summary/${value}`,
      headers: {
        authorization: token
      }
    })

    return resp.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

/**
 * @deprecated because the bll from the route that calls this function will be deprecated
 */
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

/**
 * @deprecated because the bll that calls this function will be deprecated
 */
export async function getClassifierJobResultsFromApi (token: string, jobId: number, query: DetectValidationResultsQueryParams): Promise<DetectValidationResultsResponse> {
  try {
    const resp = await axios.request({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifier-jobs/${jobId}/summary`,
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

export async function getClassifiers (token: string, params: CoreGetClassifiersQueryParams): Promise<Classifier[]> {
  try {
    const resp = await axios.request({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/classifiers`,
      params: {
        ...params,
        fields: [
          'id',
          'name',
          'version'
        ]
      },
      headers: {
        authorization: token
      }
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

/**
 * Query user permissions to edit the content by using PATCH `/projects/:projectId route` and just send the same name through.
 *
 * Returns `false` for when token is missing. And when any errors are caused on the end.
 * Returns `true` if the API returns `204`.
 */
export async function checkUserPermissionForEditingDashboardContent (token: string | undefined, coreProjectId: string, projectName: string): Promise<boolean> {
  if (token == null || !isValidToken(token)) {
    return false
  }

  try {
    const response = await axios.request({
      method: 'PATCH',
      url: `${CORE_API_BASE_URL}/projects/${coreProjectId}`,
      headers: {
        authorization: token
      },
      data: {
        name: projectName
      }
    })

    if (response.status >= 200 && response.status <= 205) {
      return true
    }

    return false
  } catch (e) {
    return false
  }
}

export async function updateClassifierJob (token: string, classifierJobId: number, data: UpdateClassifierJobBody): Promise<void> {
  try {
    await axios.request({
      method: 'PATCH',
      url: `${CORE_API_BASE_URL}/classifier-jobs/${classifierJobId}`,
      headers: {
        authorization: token
      },
      data
    })
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function getProjectMembersFromApi (token: string, coreProjectId: string): Promise<CoreUser[]> {
  try {
    const response = await axios.request({
      method: 'GET',
      url: `${CORE_API_BASE_URL}/projects/${coreProjectId}/users`,
      headers: {
        authorization: token
      }
    })

    return response.data
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function patchUserProfileOnCore (token: string, email: string, data: Pick<CoreUser, 'firstname' | 'lastname' | 'picture'>): Promise<void> {
  try {
    await axios.request({
      method: 'PATCH',
      url: `${CORE_API_BASE_URL}/users/${email}`,
      headers: {
        authorization: token
      },
      data
    })
  } catch (e) {
    return unpackAxiosError(e)
  }
}

export async function createClassifierJob (token: string, data: CoreCreateClassifierJobBody): Promise<string | undefined> {
  try {
    const response = await axios.request({
      method: 'POST',
      url: `${CORE_API_BASE_URL}/classifier-jobs`,
      headers: {
        authorization: token
      },
      data
    })

    return response.headers?.location
  } catch (e) {
    return unpackAxiosError(e)
  }
}
