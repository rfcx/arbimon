import { RichnessByExportParams, RichnessByExportQuery, RichnessByExportResponse } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { BioInvalidQueryParamError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { assertPathParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'
import { getRichnessDatasetInformation } from './bll-richness-export'

export const richnessExportHandler: Handler<RichnessByExportResponse, RichnessByExportParams, RichnessByExportQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const { startDate: startDateUtcInclusive, endDate: endDateUtcInclusive, siteIds, taxons } = req.query
  if (!isValidDate(startDateUtcInclusive)) throw BioInvalidQueryParamError({ startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) throw BioInvalidQueryParamError({ endDateUtcInclusive })

  // Query
  const convertedQuery = {
    startDateUtcInclusive,
    endDateUtcInclusive,
    siteIds: Array.isArray(siteIds) ? siteIds.map(Number) : [],
    taxons: Array.isArray(taxons) ? taxons : []
  }

  return await getRichnessDatasetInformation(req, convertedQuery)
}
