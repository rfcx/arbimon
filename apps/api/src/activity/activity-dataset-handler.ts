import { DatasetQueryParamsSerialized } from '@rfcx-bio/common/api-bio/_helpers'
import { ActivityDatasetParams, ActivityDatasetResponse } from '@rfcx-bio/common/api-bio/activity/activity-dataset'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { getSequelize } from '~/db'
import { BioInvalidPathParamError, BioInvalidQueryParamError, BioNotFoundError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { assertPathParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'
import { getActivityOverviewData } from './activity-dataset-bll'

export const activityDatasetHandler: Handler<ActivityDatasetResponse, ActivityDatasetParams, DatasetQueryParamsSerialized> = async (req) => {
  // Input & validation
  // TODO: We can extract this validation instead of repeating it in each handler
  const { projectId: projectIdString } = req.params
  assertPathParamsExist({ projectId: projectIdString })

  const projectId = parseInt(projectIdString)
  if (Number.isNaN(projectId)) throw BioInvalidPathParamError({ projectId: projectIdString })

  const { dateStartInclusiveLocalIso: startDateUtcInclusive, dateEndInclusiveLocalIso: endDateUtcInclusive, siteIds, taxonClassIds: taxons } = req.query
  if (!isValidDate(startDateUtcInclusive)) throw BioInvalidQueryParamError({ startDate: startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) throw BioInvalidQueryParamError({ endDate: endDateUtcInclusive })

  const projectVersion = await ModelRepository.getInstance(getSequelize())
    .ProjectVersion
    .findOne({
      where: { projectId },
      attributes: ['id'],
      raw: true
    })
  if (projectVersion === null) throw BioNotFoundError()
  const projectVersionId = projectVersion.id

  const datasetFilter: FilterDataset = {
    projectVersionId,
    startDateUtcInclusive,
    endDateUtcInclusive,
    // TODO ???: Better way to check query type!
    siteIds: Array.isArray(siteIds) ? siteIds.map(Number) : typeof siteIds === 'string' ? [Number(siteIds)] : [],
    taxons: Array.isArray(taxons) ? taxons.map(Number) : typeof taxons === 'string' ? [Number(taxons)] : []
  }

  const isProjectMember = getIsProjectMember(req)

  // Response
  return await getActivityOverviewData(datasetFilter, isProjectMember)
}
