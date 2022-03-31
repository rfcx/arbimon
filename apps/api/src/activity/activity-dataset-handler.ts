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
  // TODO: We can extract this validation instead of repeating it in each handler
  const { projectId: projectIdString } = req.params
  assertPathParamsExist({ projectId: projectIdString })

  const projectId = parseInt(projectIdString)
  if (Number.isNaN(projectId)) throw BioInvalidPathParamError({ projectId: projectIdString })

  const { startDate, endDate, siteIds, taxons } = req.query
  if (!isValidDate(startDate)) throw BioInvalidQueryParamError({ startDate })
  if (!isValidDate(endDate)) throw BioInvalidQueryParamError({ endDate })

  // Query
  const datasetFilter: FilterDataset = {
    projectId,
    startDateUtcInclusive: startDate,
    endDateUtcInclusive: endDate,
    // TODO ???: Better way to check query type!
    siteIds: Array.isArray(siteIds) ? siteIds.map(Number) : typeof siteIds === 'string' ? [Number(siteIds)] : [],
    taxons: Array.isArray(taxons) ? taxons.map(Number) : typeof taxons === 'string' ? [Number(taxons)] : []
  }

  const isProjectMember = getIsProjectMember(req)

  // Response
  return await getActivityOverviewData(datasetFilter, isProjectMember)
}
