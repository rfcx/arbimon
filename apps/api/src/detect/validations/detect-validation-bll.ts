import { DetectDetectionResponse } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { DetectValidation, DetectValidationResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation'
import { SpeciesDetection } from '@rfcx-bio/common/api-bio/detect/types'

import { env } from '~/env'
import { updateInMemoryDetectValidation } from './detect-validation-dao'
import { mockDetections } from './mock-detections'

export interface DetectionFilter {
  jobId: number
  siteIds: string[]
  statusId?: string
  classifierId?: string
  confidence?: string
}

const mockData = mockDetections

export const getDetections = async (filter: DetectionFilter): Promise<DetectDetectionResponse> => {
  let filteredMockData: SpeciesDetection[] = []
  filteredMockData = mockData.filter(d => d.jobId === filter.jobId)

  const siteIds = filter.siteIds
  if (siteIds.length > 0) {
    filteredMockData = filteredMockData.filter(d => siteIds.includes(d.siteId))
  }

  const statusId = filter.statusId
  if (statusId !== undefined) {
    filteredMockData = filteredMockData.filter(d => d.statusId === parseInt(statusId))
  }

  const classifierId = filter.classifierId
  if (classifierId !== undefined) {
    filteredMockData = filteredMockData.filter(d => d.classifierId === parseInt(classifierId))
  }

  const confidence = filter.confidence
  if (confidence !== undefined) {
    filteredMockData = filteredMockData.filter(d => d.confidence >= parseFloat(confidence))
  }

  return {
    detections: filteredMockData
  }
}

export const validateDetections = async (validationList: DetectValidation[]): Promise<DetectValidationResponse> => {
  if (env.IN_DEVELOP) {
    return await updateInMemoryDetectValidation(mockData, validationList)
  }

  // TODO: Connect to core API
  return { message: 'ok' }
}
