import { SpotlightDatasetParams, SpotlightDatasetQuery, SpotlightDatasetResponse } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { Handler } from '../_services/api-helpers/types'
import { FilterDataset } from '../_services/datasets/dataset-types'
import { BioInvalidPathParamError, BioInvalidQueryParamError } from '../_services/errors'
import { assertPathParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'
import { getSpotlightDatasetData } from './spotlight-dataset-bll'

export const spotlightDatasetHandler: Handler<SpotlightDatasetResponse, SpotlightDatasetParams, SpotlightDatasetQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  const { speciesId: speciesIdString, dateStartInclusiveLocalIso: startDateUtcInclusive, dateEndInclusiveLocalIso: endDateUtcInclusive, siteIds, taxonClassIds: taxons } = req.query
  const speciesId = Number(speciesIdString)
  if (isNaN(speciesId)) throw BioInvalidQueryParamError({ speciesIdString })
  if (!isValidDate(startDateUtcInclusive)) throw BioInvalidQueryParamError({ startDate: startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) throw BioInvalidQueryParamError({ endDate: endDateUtcInclusive })

  const isProjectMember = getIsProjectMember(req)

  // Query
  const datasetFilter: FilterDataset = {
    projectId: projectIdInteger,
    startDateUtcInclusive,
    endDateUtcInclusive,
    // TODO ???: Better way to check query type!
    siteIds: Array.isArray(siteIds) ? siteIds.map(Number) : typeof siteIds === 'string' ? [Number(siteIds)] : [],
    taxons: Array.isArray(taxons) ? taxons.map(Number) : typeof taxons === 'string' ? [Number(taxons)] : []
  }

  return await getSpotlightDatasetData(datasetFilter, speciesId, isProjectMember)
}
