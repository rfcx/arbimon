import { groupBy, mapValues } from 'lodash-es'

import { DetectSummaryResponse } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { DetectValidation, DetectValidationResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation'
import { SpeciesDetection } from '@rfcx-bio/common/api-bio/detect/types'

import { BaseQuery } from '~/query/base'

export const getSummary = async (mockData: SpeciesDetection[], query: BaseQuery): Promise<DetectSummaryResponse> => {
  const limit = query.limit
  const offset = query.offset

  const detectionsBySpecies = groupBy(mockData, 'classificationId')
  const detectionsBySpeciesValues = Object.values(mapValues(detectionsBySpecies, (value, key) => ({ speciesSlug: key, speciesName: key, numberOfDetections: value.length })))

  return {
    total: Object.keys(detectionsBySpecies).length,
    currentPage: offset / limit,
    results: detectionsBySpeciesValues.slice(limit + offset, Math.min(limit, detectionsBySpeciesValues.length))
  }
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
