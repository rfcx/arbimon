import { RichnessDatasetParams, RichnessDatasetQuery, RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { FilterDataset } from '~/datasets/dataset-types'
import { BioInvalidPathParamError, BioInvalidQueryParamError } from '~/errors'
import { arrayFromQuery } from '~/utils/request-query'
import { Handler } from '../_services/api-helpers/types'
import { assertPathParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'
import { getRichnessDataset } from './richness-dataset-bll'

export const richnessDatasetHandler: Handler<RichnessDatasetResponse, RichnessDatasetParams, RichnessDatasetQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  const { dateStartUtcInclusive, dateEndUtcInclusive, siteIds, taxonClassIds } = req.query
  if (!isValidDate(dateStartUtcInclusive)) throw BioInvalidQueryParamError({ dateStartUtcInclusive })
  if (!isValidDate(dateEndUtcInclusive)) throw BioInvalidQueryParamError({ dateEndUtcInclusive })

  const datasetFilter: FilterDataset = {
    locationProjectId: projectIdInteger,
    dateStartUtcInclusive,
    dateEndUtcInclusive,
    siteIds: arrayFromQuery(siteIds).map(Number),
    taxonClassIds: arrayFromQuery(taxonClassIds).map(Number)
  }

  const isProjectMember = getIsProjectMember(req)

  return await getRichnessDataset(datasetFilter, isProjectMember)
}
