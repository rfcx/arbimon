import { SitesParams, SitesResponse } from '@rfcx-bio/common/api-bio/common/sites'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_LOCATION_SITE } from '@rfcx-bio/common/dao/types'

import { ApiServerError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'
import { assertPathParamsExist } from '../_services/validation'

export const sitesAllHandler: Handler<SitesResponse, SitesParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  // Query
  const models = ModelRepository.getInstance(getSequelize())

  const sites = await models.LocationSite
    .findAll({
      where: { locationProjectId: projectId },
      attributes: ATTRIBUTES_LOCATION_SITE.light,
      order: [['name', 'ASC']]
    })
    .catch(err => {
      req.log.error(err)
      throw ApiServerError()
    })

  return sites
}
