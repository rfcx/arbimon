import { ActivityDatasetParams, ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { FilterDatasetQuery } from '@rfcx-bio/common/api-bio/common/filter'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { BioInvalidPathParamError, BioInvalidQueryParamError } from '~/errors'
import { arrayFromQuery } from '~/utils/request-query'
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

  const { dateStartUtcInclusive, dateEndUtcInclusive, siteIds, taxonClassIds } = req.query
  if (!isValidDate(dateStartUtcInclusive)) throw BioInvalidQueryParamError({ dateStartUtcInclusive })
  if (!isValidDate(dateEndUtcInclusive)) throw BioInvalidQueryParamError({ dateEndUtcInclusive })

  // Query
  const datasetFilter: FilterDataset = {
    locationProjectId: projectIdInteger,
    dateStartUtcInclusive,
    dateEndUtcInclusive,
    siteIds: arrayFromQuery(siteIds).map(Number),
    taxonClassIds: arrayFromQuery(taxonClassIds).map(Number)
  }

  const isProjectMember = getIsProjectMember(req)

  // Response
  return await getActivityOverviewData(datasetFilter, isProjectMember)
}
