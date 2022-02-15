import { SitesParams, SitesResponse } from '@rfcx-bio/common/api-bio/common/sites'
import { LocationSiteModel, SITE_MODEL_ATTRIBUTES } from '@rfcx-bio/common/dao/models/location-site-model'

import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'
import { assertParamsExist } from '../_services/validation'

export const sitesAllHandler: Handler<SitesResponse, SitesParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  // Query
  const sites = await LocationSiteModel(getSequelize()).findAll({
    where: { locationProjectId: projectId },
    attributes: SITE_MODEL_ATTRIBUTES.light,
    order: [
      ['name', 'ASC']
    ]
  })

  return sites
}
