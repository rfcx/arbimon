import { RichnessDatasetParams, RichnessDatasetQuery, RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getIsProjectMember } from '@/_middleware/get-is-project-member'
import { FilterDataset } from '~/datasets/dataset-types'
import { getSequelize } from '~/db'
import { BioInvalidPathParamError, BioInvalidQueryParamError, BioNotFoundError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { assertPathParamsExist } from '../_services/validation'
import { isValidDate } from '../_services/validation/query-validation'
import { getRichnessDataset } from './richness-dataset-bll'

export const richnessDatasetHandler: Handler<RichnessDatasetResponse, RichnessDatasetParams, RichnessDatasetQuery> = async (req) => {
  // Inputs & validation
  const { projectId: projectIdString } = req.params
  assertPathParamsExist({ projectId: projectIdString })

  const projectId = parseInt(projectIdString)
  if (Number.isNaN(projectId)) throw BioInvalidPathParamError({ projectId: projectIdString })

  const { dateStartInclusiveLocalIso: startDateUtcInclusive, dateEndInclusiveLocalIso: endDateUtcInclusive, siteIds, taxonClassIds: taxons } = req.query
  if (!isValidDate(startDateUtcInclusive)) throw BioInvalidQueryParamError({ startDate: startDateUtcInclusive })
  if (!isValidDate(endDateUtcInclusive)) throw BioInvalidQueryParamError({ endDate: endDateUtcInclusive })

  // TODO: Send the version in the API request
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

  return await getRichnessDataset(datasetFilter, isProjectMember)
}
