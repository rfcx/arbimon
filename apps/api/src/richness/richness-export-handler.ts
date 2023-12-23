import { type RichnessExportParams, type RichnessExportQuery, type RichnessExportResponse } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { hasPermission } from '@rfcx-bio/common/roles'

import { BioInvalidPathParamError, BioInvalidQueryParamError } from '~/errors'
import { type Handler } from '../_services/api-helpers/types'
import { assertPathParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'
import { getRichnessExport } from './richness-export-bll'

export const richnessExportHandler: Handler<RichnessExportResponse, RichnessExportParams, RichnessExportQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  const { dateStartInclusiveLocalIso: startDateUtcInclusive, dateEndInclusiveLocalIso: endDateUtcInclusive, siteIds, taxonClassIds: taxons } = req.query
  if (!isValidDate(startDateUtcInclusive)) throw BioInvalidQueryParamError({ startDate: startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) throw BioInvalidQueryParamError({ endDate: endDateUtcInclusive })

  const datasetFilter = {
    locationProjectId: projectIdInteger,
    startDateUtcInclusive,
    endDateUtcInclusive,
    // TODO ???: Better way to check query type!
    siteIds: Array.isArray(siteIds) ? siteIds.map(Number) : typeof siteIds === 'string' ? [Number(siteIds)] : [],
    taxons: Array.isArray(taxons) ? taxons.map(Number) : typeof taxons === 'string' ? [Number(taxons)] : []
  }

  return await getRichnessExport(datasetFilter, hasPermission(req.projectRole, 'read-insights-sensitive'))
}
