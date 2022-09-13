import { groupBy, mapValues } from 'lodash-es'

import { SpeciesDetectionSummary } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { DetectValidation, DetectValidationResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation'
import { DetectValidationStatusResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation-status'
import { SpeciesDetection } from '@rfcx-bio/common/api-bio/detect/types'

export const getInMemorySpeciesDetectionSummary = async (mockData: SpeciesDetection[]): Promise<SpeciesDetectionSummary[]> => {
  const detectionsBySpecies = groupBy(mockData, 'classificationId')
  const detectionsBySpeciesValues = Object.values(
    mapValues(detectionsBySpecies, (value, key) => ({ classificationId: parseInt(key), classificationName: key, numberOfDetections: value.length })))

  return detectionsBySpeciesValues
}

export const getInMemoryDetectValidationStatus = async (mockData: SpeciesDetection[]): Promise<DetectValidationStatusResponse> => {
  const summary = { 0: 0, 1: 0, 2: 0, 3: 0 }

  /**
   * WARNING: Validation status IDs must match the Core API Database IDs
   */
  for (const data of mockData) {
    if (data.statusId === 0) {
      summary[0] += 1
    } else if (data.statusId === 1) {
      summary[1] += 1
    } else if (data.statusId === 2) {
      summary[2] += 1
    } else {
      summary[3] += 1
    }
  }

  return summary
}

export const updateInMemoryDetectValidation = async (mockData: SpeciesDetection[], validationList: DetectValidation[]): Promise<DetectValidationResponse> => {
  for (const item of validationList) {
    const matchedDetection = mockData.find(d => d.dateStart === item.dateStart && d.siteId === item.siteId && d.classificationId === item.classificationId)
    if (matchedDetection) {
      matchedDetection.statusId = item.statusId
    }
  }
  return {
    message: 'ok'
  }
}
