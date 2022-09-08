import { detectRecordingRoute } from '@rfcx-bio/common/api-bio/detect/detect-recording'
import { detectValidationRoute } from '@rfcx-bio/common/api-bio/detect/detect-validation'

import { setIsProjectMember } from '@/_middleware/get-is-project-member'
import { GET, POST, RouteRegistration } from '~/api-helpers/types'
import { detectRecordingHandler } from './jobs/detect-recording-handler'
import { detectValidationHandler } from './validations/detect-validation-handler'

export const routesDetect: RouteRegistration[] = [
  {
    method: GET,
    url: detectRecordingRoute,
    preHandler: [setIsProjectMember],
    handler: detectRecordingHandler
  },
  {
    method: POST,
    url: detectValidationRoute,
    preHandler: [setIsProjectMember],
    handler: detectValidationHandler
  }
]
