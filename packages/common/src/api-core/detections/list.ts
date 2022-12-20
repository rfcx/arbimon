import { AxiosInstance } from 'axios'

import { CoreDetectionResponse, DetectionQueryParams, SpeciesDetection } from './types'

// Response types
export type CoreDetections = CoreDetectionResponse[]

export interface DetectionResponse {
  detections: SpeciesDetection[]
  total: number
}

// Service
export const apiCoreGetDetections = async (apiClient: AxiosInstance, params: DetectionQueryParams): Promise<DetectionResponse> => {
  const res = await apiClient.get<CoreDetections>('/detections', { params })
  if (!Array.isArray(res.data)) return { total: 0, detections: [] }

  const result: DetectionResponse = {
    total: res.headers?.['total-items'] ? Number(res.headers['total-items']) : 0,
    detections: res.data.map(item => {
      return {
        jobId: 123,
        siteId: item.stream_id,
        dateStart: item.start,
        dateEnd: item.end,
        classifierId: item.classifier_id,
        classificationId: item.classification_id,
        confidence: item.confidence,
        statusId: 0
      }
    })
  }
  return result
}
