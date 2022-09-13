import { detectDetectionRoute } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { detectRecordingRoute } from '@rfcx-bio/common/api-bio/detect/detect-recording'
import { detectSummaryRoute } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { detectValidationRoute } from '@rfcx-bio/common/api-bio/detect/detect-validation'
import { detectValidationStatusRoute } from '@rfcx-bio/common/api-bio/detect/detect-validation-status'

import { setIsProjectMember } from '@/_middleware/get-is-project-member'
import { GET, POST, RouteRegistration } from '~/api-helpers/types'
import { detectRecordingHandler } from './jobs/detect-recording-handler'
import { detectDetectionHandler } from './validations/detect-detection-handler'
import { detectSummaryHandler } from './validations/detect-summary-handler'
import { detectValidationHandler } from './validations/detect-validation-handler'
import { detectValidationStatusHandler } from './validations/detect-validation-status-handler'

export const routesDetect: RouteRegistration[] = [
  {
    method: GET,
    url: detectRecordingRoute,
    preHandler: [setIsProjectMember],
    handler: detectRecordingHandler
  },
  {
    method: GET,
    url: detectSummaryRoute,
    handler: detectSummaryHandler
  },
  {
    method: GET,
    url: detectDetectionRoute,
    handler: detectDetectionHandler
  },
  {
    method: GET,
    url: detectValidationStatusRoute,
    handler: detectValidationStatusHandler
  },
  {
    method: POST,
    url: detectValidationRoute,
    handler: detectValidationHandler
  }
]
