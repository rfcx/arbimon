import { getBestDetectionsRoute } from '@rfcx-bio/common/api-bio/cnn/best-detections'
import { getBestDetectionsSummaryRoute } from '@rfcx-bio/common/api-bio/cnn/best-detections-summary'
import { getClassifierJobInfoByClassificationRoute } from '@rfcx-bio/common/api-bio/cnn/classifier-job-classification'
import { getClassifierJobInformationRoute, updateClassifierJobRoute } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { getClassifierJobSpeciesRoute } from '@rfcx-bio/common/api-bio/cnn/classifier-job-species'
import { getClassifierJobsRoute } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'
import { createClassifierJobRoute } from '@rfcx-bio/common/api-bio/cnn/create-classifier-job'
import { getDetectionsRoute } from '@rfcx-bio/common/api-bio/cnn/detections'
import { getDetectionsSummaryRoute } from '@rfcx-bio/common/api-bio/cnn/detections-summary'
import { exportDetectionsRoute } from '@rfcx-bio/common/api-bio/cnn/export-detections'
import { getRecordedMinutesPerDayRoute } from '@rfcx-bio/common/api-bio/cnn/recorded-minutes-per-day'
import { updateDetectionStatusRoute } from '@rfcx-bio/common/api-bio/cnn/reviews'

import { requireAuthorized } from '@/_hooks/require-authenticated'
import { requireRfcxEmail } from '@/_hooks/require-rfcx-user'
import { type RouteRegistration, GET, PATCH, POST } from '~/api-helpers/types'
import { createClassifierJobHandler } from './create-classifier-job-handler'
import { exportDetectionsHandler } from './export-detections-handler'
import { getBestDetectionsHandler } from './get-best-detections-handler'
import { getBestDetectionsSummaryHandler } from './get-best-detections-summary-handler'
import { getClassifierJobInfoByClassificationHandler } from './get-classifier-job-info-by-classification-handler'
import { getClassifierJobInformationHandler } from './get-classifier-job-information-handler'
import { getClassifierJobSpeciesHandler } from './get-classifier-job-species-handler'
import { getClassifierJobsHandler } from './get-classifier-jobs-handler'
import { getDetectionsHandler } from './get-detections-handler'
import { getDetectionsSummaryHandler } from './get-detections-summary-handler'
import { getRecordedMinutesPerDayHandler } from './get-recorded-minutes-per-day-handler'
import { updateClassifierJobHandler } from './update-classifier-job-handler'
import { updateDetectionStatusHandler } from './update-detection-status-handler'

export const routesCnn: RouteRegistration[] = [
  {
    method: GET,
    url: getClassifierJobsRoute,
    // TODO: Discuss with sudoers about how to add role checks when the route does not always provide projectId.
    preHandler: [/* requireProjectPermission('read-cnn'), */requireRfcxEmail],
    handler: getClassifierJobsHandler
  },
  {
    method: POST,
    url: createClassifierJobRoute,
    preHandler: [requireRfcxEmail],
    handler: createClassifierJobHandler
  },
  {
    method: GET,
    url: getClassifierJobInformationRoute,
    preHandler: [requireRfcxEmail],
    handler: getClassifierJobInformationHandler
  },
  {
    method: GET,
    url: getClassifierJobInfoByClassificationRoute,
    preHandler: [requireRfcxEmail],
    handler: getClassifierJobInfoByClassificationHandler
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
  },
  {
    method: GET,
    url: getDetectionsSummaryRoute,
    preHandler: [requireRfcxEmail],
    handler: getDetectionsSummaryHandler
  },
  {
    method: GET,
    url: getBestDetectionsRoute,
    preHandler: [requireRfcxEmail],
    handler: getBestDetectionsHandler
  },
  {
    method: GET,
    url: getBestDetectionsSummaryRoute,
    preHandler: [requireRfcxEmail],
    handler: getBestDetectionsSummaryHandler
  },
  {
    method: GET,
    url: getRecordedMinutesPerDayRoute,
    preHandler: [requireRfcxEmail],
    handler: getRecordedMinutesPerDayHandler
  },
  {
    method: POST,
    url: updateDetectionStatusRoute,
    handler: updateDetectionStatusHandler
  },
  {
    method: POST,
    url: exportDetectionsRoute,
    preHandler: [requireRfcxEmail],
    handler: exportDetectionsHandler
  },
  {
    method: PATCH,
    url: updateClassifierJobRoute,
    preHandler: [requireRfcxEmail],
    handler: updateClassifierJobHandler
  }
]
