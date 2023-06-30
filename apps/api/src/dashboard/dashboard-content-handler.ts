import { type DashboardContentParams, type DashboardContentResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-content'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getDashboardContent } from './dashboard-content-dao'

export const dashboardContentHandler: Handler<DashboardContentResponse, DashboardContentParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectContent = await getDashboardContent(projectIdInteger)
  return projectContent
}
