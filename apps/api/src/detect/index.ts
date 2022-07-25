import { detectRecordingRoute } from '@rfcx-bio/common/api-bio/detect/detect-recording'

import { setIsProjectMember } from '@/_middleware/get-is-project-member'
import { GET, RouteRegistration } from '~/api-helpers/types'
import { detectRecordingHandler } from './detect-recording-handler'

export const routesDetectRecording: RouteRegistration[] = [
  {
    method: GET,
    url: detectRecordingRoute,
    preHandler: [setIsProjectMember],
    handler: detectRecordingHandler
  }
]
