import { RichnessExportParams, RichnessExportQuery, RichnessExportResponse } from '@rfcx-bio/common/api-bio/richness/richness-export'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { BioInvalidPathParamError, BioInvalidQueryParamError } from '~/errors'
import { arrayFromQuery } from '~/utils/request-query'
import { Handler } from '../_services/api-helpers/types'
import { assertPathParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'
import { getRichnessExport } from './richness-export-bll'

export const richnessExportHandler: Handler<RichnessExportResponse, RichnessExportParams, RichnessExportQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = parseInt(projectId)
  if (Number.isNaN(projectIdInteger)) throw BioInvalidPathParamError({ projectId })

  const { dateStartUtcInclusive, dateEndUtcInclusive, siteIds, taxonClassIds } = req.query
  if (!isValidDate(dateStartUtcInclusive)) throw BioInvalidQueryParamError({ dateStartUtcInclusive })
  if (!isValidDate(dateEndUtcInclusive)) throw BioInvalidQueryParamError({ dateEndUtcInclusive })

  const datasetFilter = {
    locationProjectId: projectIdInteger,
    dateStartUtcInclusive,
    dateEndUtcInclusive,
    siteIds: arrayFromQuery(siteIds).map(Number),
    taxons: arrayFromQuery(taxonClassIds).map(Number)
  }

  const isProjectMember = getIsProjectMember(req)

  return await getRichnessExport(datasetFilter, isProjectMember)
}
