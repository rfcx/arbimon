// Handler for fake detections
import { DetectDetectionParams, DetectDetectionQueryParams, DetectDetectionResponse } from '@rfcx-bio/common/api-bio/detect/detect-detections'

import { Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioInvalidQueryParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { DetectionFilter, getDetections } from './detect-validation-bll'

export const detectDetectionHandler: Handler<DetectDetectionResponse, DetectDetectionParams, DetectDetectionQueryParams> = async (req) => {
  // Inputs & validation
  const { jobId } = req.params
  assertPathParamsExist({ jobId })

  const jobIdInteger = parseInt(jobId)
  if (Number.isNaN(jobIdInteger)) throw BioInvalidPathParamError({ jobId })

  const siteIds = req.query.siteIds
  const statusId = req.query.statusId
  const classifierId = req.query.classifierId
  const confidence = req.query.confidence
  if (statusId && isNaN(parseInt(statusId))) throw BioInvalidQueryParamError({ statusId })
  if (classifierId && isNaN(parseInt(classifierId))) throw BioInvalidQueryParamError({ classifierId })
  if (confidence && isNaN(parseFloat(confidence))) throw BioInvalidQueryParamError({ confidence })

  // Query
  const detectionFilter: DetectionFilter = {
    jobId: jobIdInteger,
    siteIds: Array.isArray(siteIds) ? siteIds : [],
    statusId: req.query.statusId,
    classifierId: req.query.classifierId,
    confidence: req.query.confidence
  }

  return await getDetections(detectionFilter)
}
