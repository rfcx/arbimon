import { DashboardProfileParams, DashboardProfileResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'
import { ModelRepositoryFactory } from '@rfcx-bio/common/dao/model-repository'
import { DashboardSpeciesHighlighted } from '@rfcx-bio/common/dao/types/dashboard-species-highlighted'

import { Handler } from '../_services/api-helpers/types'
import { getSequelize } from '../_services/db'
import { assertParamsExist } from '../_services/validation'

export const dashboardProfileHandler: Handler<DashboardProfileResponse, DashboardProfileParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  // Query
  const response: DashboardProfileResponse = await getProfile(projectId)

  // Response
  return response
}

const getProfile = async (projectId: string): Promise<DashboardProfileResponse> => {
  const sequelize = getSequelize()
  const models = ModelRepositoryFactory.getInstance(sequelize)

  const projectInformation = await models.LocationProjectProfile.findOne({
    where: { locationProjectId: projectId }
  })

  const speciesHighlightedRaw = await models.DashboardSpeciesHighlighted.findAll({
    where: { locationProjectId: projectId },
    order: [['highlightedOrder', 'ASC']],
    raw: true
  }) as DashboardSpeciesHighlighted[]

  return {
    summary: projectInformation?.summary ?? '',
    readme: projectInformation?.readme ?? '',
    speciesHighlighted: speciesHighlightedRaw.map(({ taxonClassSlug: taxonSlug, taxonSpeciesSlug: slug, ...rest }) => ({ ...rest, taxonSlug, slug }))
  }
}
