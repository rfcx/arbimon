import { DetectValidation, DetectValidationResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation'
import { SpeciesDetection } from '@rfcx-bio/common/api-bio/detect/types'

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
