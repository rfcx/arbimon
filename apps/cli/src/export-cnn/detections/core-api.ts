import { type ConsolaInstance } from 'consola'

import { type CoreRawReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type ClassifierJob } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

import { type ApiCoreClient } from '~/api-core/api-core-client'
import { requireEnv } from '~/env'
import { QUERY_LIMIT } from '../constants'

const { CORE_API_BASE_URL } = requireEnv('CORE_API_BASE_URL')

export const fetchClassifierJob = async (client: ApiCoreClient, jobId: number): Promise<Pick<ClassifierJob, 'id' | 'queryStart' | 'queryEnd' | 'projectId'>> => {
  return await client.request({
    method: 'GET',
    url: `${CORE_API_BASE_URL}/classifier-jobs/${jobId}`,
    params: {
      fields: [
        'id',
        'query_start',
        'query_end',
        'project_id'
      ]
    }
  })
}

export interface RawDetection {
  id: number
  start: string
  end: string
  confidence: number
  review_status: CoreRawReviewStatus
  stream: {
    id: string
    name: string
    start: string
    end: string
    latitude: number
    longitude: number
    altitude: number
    is_public: boolean
    hidden: boolean
  }
  classification: {
    title: string
    value: string
    image: string | null
  }
}

export const CSV_REVIEW_STATUS = ['-', 'not present', 'unknown', 'present'] as const
export type CSVReviewStatus = typeof CSV_REVIEW_STATUS[number]

export interface Detection {
  site_id: string
  site_name: string
  detection_start: string
  detection_end: string
  detection_class: string
  confidence: number
  validation_status: CSVReviewStatus
}

export const fetchDetections = async (
  client: ApiCoreClient,
  jobId: number,
  start: string,
  end: string,
  limit: number,
  offset: number
): Promise<RawDetection[]> => {
  return await client.request({
    method: 'get',
    url: `${CORE_API_BASE_URL}/detections`,
    params: {
      classifier_jobs: [jobId],
      start,
      end,
      limit,
      offset,
      fields: [
        'id',
        'start',
        'end',
        'confidence',
        'review_status',
        'stream',
        'classification'
      ],
      descending: false,
      min_confidence: 0
    }
  })
}

export const getDetections = async (
  client: ApiCoreClient,
  jobId: number,
  start: string,
  end: string,
  consola: ConsolaInstance
): Promise<Detection[]> => {
  const log = consola.withTag('getDetections')
  let offset = 0
  let totalCount = 0
  let responseCount = 1
  const allDetections: RawDetection[] = []

  log.info('Start querying detections between', start, 'and', end, 'inside job', jobId)
  while (responseCount !== 0) {
    log.info('Querying detections with limit', QUERY_LIMIT, 'and offset', offset)
    const detections = await fetchDetections(
      client,
      jobId,
      start,
      end,
      QUERY_LIMIT,
      offset
    )

    responseCount = detections.length
    totalCount += detections.length
    offset += QUERY_LIMIT

    log.info('Received', responseCount, 'detections')
    allDetections.push(...detections)
  }

  log.info('Found', totalCount, 'detections between', start, 'and', end)
  return allDetections.map(detection => ({
    site_id: detection.stream.id,
    site_name: detection.stream.name,
    detection_start: detection.start,
    detection_end: detection.end,
    detection_class: detection.classification.value,
    confidence: detection.confidence,
    validation_status: mapValidationStatus(detection.review_status)
  }))
}

export const mapValidationStatus = (status: CoreRawReviewStatus): CSVReviewStatus => {
  if (status === null) { return '-' }
  if (status === -1) { return 'not present' }
  if (status === 0) { return 'unknown' }
  if (status === 1) { return 'present' }

  return '-'
}
