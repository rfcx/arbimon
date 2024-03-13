import { type GetClassifierJobsQueryParams, type GetClassifierJobsResponse } from '@rfcx-bio/common/api-bio/cnn/classifier-jobs'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidQueryParamError, BioMissingQueryParamError } from '~/errors'
import { getClassifierJobsFromApi } from './get-classifier-jobs-bll'

export const getClassifierJobsHandler: Handler<GetClassifierJobsResponse, unknown, GetClassifierJobsQueryParams, unknown> = async (req) => {
  const token = req.headers.authorization ?? ''

  if (
    req.query?.project === null ||
    req.query?.project === undefined ||
    req.query?.project === ''
  ) {
    throw BioMissingQueryParamError('project')
  }

  const classifierJobs = getClassifierJobsFromApi(token, req.query)
  return await classifierJobs
}
