import { ActivityDatasetParams, ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { FilterDatasetQuery } from '@rfcx-bio/common/api-bio/common/filter'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { BioInvalidPathParamError, BioInvalidQueryParamError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { assertPathParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'
import { getActivityOverviewData } from './activity-dataset-bll'

export const activityDatasetHandler: Handler<ActivityDatasetResponse, ActivityDatasetParams, FilterDatasetQuery> = async (req) => {
  // Input & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  const { startDate: startDateUtcInclusive, endDate: endDateUtcInclusive, siteIds, taxonClassIds } = req.query
  if (!isValidDate(startDateUtcInclusive)) throw BioInvalidQueryParamError({ startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) throw BioInvalidQueryParamError({ endDateUtcInclusive })

  // Query
  const datasetFilter: FilterDataset = {
    locationProjectId: projectIdInteger,
    startDateUtcInclusive,
    endDateUtcInclusive,
    // TODO ???: Better way to check query type!
    siteIds: Array.isArray(siteIds) ? siteIds.map(Number) : typeof siteIds === 'string' ? [Number(siteIds)] : [],
    taxons: Array.isArray(taxonClassIds) ? taxonClassIds.map(Number) : typeof taxonClassIds === 'string' ? [Number(taxonClassIds)] : []
  }

  const isProjectMember = getIsProjectMember(req)

  // Response
  return await getActivityOverviewData(datasetFilter, isProjectMember)
}
