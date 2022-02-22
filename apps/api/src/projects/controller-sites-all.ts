import { SitesParams, SitesResponse } from '@rfcx-bio/common/api-bio/common/sites'
import { ModelRepositoryFactory } from '@rfcx-bio/common/dao/model-repository'
import { SITE_MODEL_ATTRIBUTES } from '@rfcx-bio/common/dao/models/location-site-model'

import { ApiServerError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'
import { assertPathParamsExist } from '../_services/validation'

export const sitesAllHandler: Handler<SitesResponse, SitesParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  // Query
  const models = ModelRepositoryFactory.getInstance(getSequelize())

  const sites = await models.LocationSite
    .findAll({
      where: { locationProjectId: projectId },
      attributes: SITE_MODEL_ATTRIBUTES.light,
      order: [
        ['name', 'ASC']
      ]
    })
    .catch(err => {
      req.log.error(err)
      throw ApiServerError()
    })

  return sites
}
