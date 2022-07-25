import { DetectRecordingParams, DetectRecordingQueryParams, DetectRecordingResponse } from '@rfcx-bio/common/api-bio/detect/detect-recording'
import { isValidQueryHours } from '@rfcx-bio/utils/query-hour'

import { Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioInvalidQueryParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { isValidDate } from '~/validation/query-validation'
import { getDetectRecording } from './detect-recording-bll'

export const detectRecordingHandler: Handler<DetectRecordingResponse, DetectRecordingParams, DetectRecordingQueryParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  const { dateStartLocal, dateEndLocal, queryHours } = req.query
  if (!isValidDate(dateStartLocal)) throw BioInvalidQueryParamError({ dateStartLocal })
  if (!isValidDate(dateEndLocal)) throw BioInvalidQueryParamError({ dateEndLocal })

  if (queryHours && !isValidQueryHours(queryHours)) throw BioInvalidQueryParamError({ queryHours })

  // Query & Response
  return await getDetectRecording(projectIdInteger, req.query)
}
