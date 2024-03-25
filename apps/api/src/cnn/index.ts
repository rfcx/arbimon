import { getClassifierJobInformationRoute } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { getClassifierJobSpeciesRoute } from '@rfcx-bio/common/api-bio/cnn/classifier-job-species'
import { getClassifierJobsRoute } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'
import { getDetectionsRoute } from '@rfcx-bio/common/api-bio/cnn/detections'

import { requireRfcxEmail } from '@/_hooks/require-rfcx-user'
import { type RouteRegistration, GET } from '~/api-helpers/types'
import { getClassifierJobInformationHandler } from './get-classifier-job-information-handler'
import { getClassifierJobSpeciesHandler } from './get-classifier-job-species-handler'
import { getClassifierJobsHandler } from './get-classifier-jobs-handler'
import { getDetectionsHandler } from './get-detections-handler'

export const routesCnn: RouteRegistration[] = [
  {
    method: GET,
    url: getClassifierJobsRoute,
    // TODO: Discuss with sudoers about how to add role checks when the route does not always provide projectId.
    preHandler: [/* requireProjectPermission('read-cnn'), */requireRfcxEmail],
    handler: getClassifierJobsHandler
  },
  {
    method: GET,
    url: getClassifierJobInformationRoute,
    preHandler: [requireRfcxEmail],
    handler: getClassifierJobInformationHandler
  },
  {
    method: GET,
    url: getClassifierJobSpeciesRoute,
    preHandler: [requireRfcxEmail],
    handler: getClassifierJobSpeciesHandler
  },
  {
    method: GET,
    url: getDetectionsRoute,
    preHandler: [requireRfcxEmail],
    handler: getDetectionsHandler
  }
]
