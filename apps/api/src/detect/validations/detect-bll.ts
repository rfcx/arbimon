import { DetectDetectionResponse } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { DetectValidation, DetectValidationResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation'
import { DetectValidationStatusResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-status'
import { SpeciesDetection } from '@rfcx-bio/common/api-bio/detect/types'

import { getInMemoryDetectValidationStatus, getInMemorySpeciesDetectionSummary, updateInMemoryDetectValidation } from './detect-dao'
import { mockDetections } from './mock-detections'
import { DetectionFilter } from './types'

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

export const getDetectionSummary = async (): Promise<DetectSummaryResponse> => {
  return {
    speciesSummary: await getInMemorySpeciesDetectionSummary(mockData)
  }
}

export const getValidationStatus = async (): Promise<DetectValidationStatusResponse> => {
  return await getInMemoryDetectValidationStatus(mockData)
}

export const validateDetections = async (validationList: DetectValidation[]): Promise<DetectValidationResponse> => {
  return await updateInMemoryDetectValidation(mockData, validationList)
}
