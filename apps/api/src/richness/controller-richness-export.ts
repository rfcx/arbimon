import { RichnessByExportParams, RichnessByExportQuery, RichnessByExportResponse } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { Handler } from '../_services/api-helper/types'
import { assertInvalidQuery, assertParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'
import { getRichnessDatasetInformation } from './bll-richness-export'

export const RichnessExportHandler: Handler<RichnessByExportResponse, RichnessByExportParams, RichnessByExportQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  const { startDate: startDateUtcInclusive, endDate: endDateUtcInclusive, siteIds, taxons } = req.query
  if (!isValidDate(startDateUtcInclusive)) assertInvalidQuery({ startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) assertInvalidQuery({ endDateUtcInclusive })

  // Query
  const convertedQuery = {
    startDateUtcInclusive,
    endDateUtcInclusive,
    siteIds: siteIds ?? [],
    taxons: taxons ?? []
  }

  return await getRichnessDatasetInformation(req, convertedQuery)
}
