import { detectDetectionsRoute } from '@rfcx-bio/common/api-bio/detect/detect-detections'
import { detectRecordingRoute } from '@rfcx-bio/common/api-bio/detect/detect-recording'
import { detectSummaryRoute } from '@rfcx-bio/common/api-bio/detect/detect-summary'
import { detectValidationRoute } from '@rfcx-bio/common/api-bio/detect/detect-validation'
import { detectValidationStatusRoute } from '@rfcx-bio/common/api-bio/detect/detect-validation-status'
import { detectReviewDetectionRoute } from '@rfcx-bio/common/api-bio/detect/review-detections'

import { setIsProjectMember } from '@/_middleware/get-is-project-member'
import { type RouteRegistration, GET, POST } from '~/api-helpers/types'
import { detectRecordingHandler } from './jobs/detect-recording-handler'
import { detectDetectionsHandler } from './validations/detect-detections-handler'
import { detectSummaryHandler } from './validations/detect-summary-handler'
import { detectValidationHandler } from './validations/detect-validation-handler'
import { detectValidationStatusHandler } from './validations/detect-validation-status-handler'
import { detectReviewDetectionHandler } from './validations/review-detections'

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
    url: detectValidationStatusRoute,
    handler: detectValidationStatusHandler
  },
  {
    method: POST,
    url: detectValidationRoute,
    handler: detectValidationHandler
  },
  {
    method: GET,
    url: detectDetectionsRoute,
    handler: detectDetectionsHandler
  },
  {
    method: POST,
    url: detectReviewDetectionRoute,
    handler: detectReviewDetectionHandler
  }
]
