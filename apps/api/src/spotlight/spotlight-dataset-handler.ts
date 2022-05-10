import { SpotlightDatasetParams, SpotlightDatasetQuery, SpotlightDatasetResponse } from '@rfcx-bio/common/api-bio/spotlight/spotlight-dataset'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { arrayFromQuery } from '~/utils/request-query'
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

  const { speciesId: speciesIdString, dateStartUtcInclusive, dateEndUtcInclusive, siteIds, taxonClassIds } = req.query
  const speciesId = Number(speciesIdString)
  if (isNaN(speciesId)) throw BioInvalidQueryParamError({ speciesIdString })
  if (!isValidDate(dateStartUtcInclusive)) throw BioInvalidQueryParamError({ dateStartUtcInclusive })
  if (!isValidDate(dateEndUtcInclusive)) throw BioInvalidQueryParamError({ dateEndUtcInclusive })

  const isProjectMember = getIsProjectMember(req)

  // Query
  const datasetFilter: FilterDataset = {
    locationProjectId: projectIdInteger,
    dateStartUtcInclusive,
    dateEndUtcInclusive,
    siteIds: arrayFromQuery(siteIds).map(Number),
    taxonClassIds: arrayFromQuery(taxonClassIds).map(Number)
  }

  return await getSpotlightDatasetData(datasetFilter, speciesId, isProjectMember)
}
