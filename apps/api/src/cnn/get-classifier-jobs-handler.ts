import { type GetClassifierJobsQueryParams, type GetClassifierJobsResponse } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

import { type Handler } from '~/api-helpers/types'
import { getClassifierJobs } from './get-classifier-jobs-bll'

export const getClassifierJobsHandler: Handler<GetClassifierJobsResponse, unknown, GetClassifierJobsQueryParams, unknown> = async (req) => {
  const classifierJobs = await getClassifierJobs(req.headers?.authorization ?? '', req.query)
  return classifierJobs
}
