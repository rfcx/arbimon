import { type ProjectCapabilitiesResponse } from '@rfcx-bio/common/api-bio/project/project-capabilities'

import { isSuperUser } from '@/_services/auth0/is-super-user'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectCapabilities } from './project-capabilities-bll'

export const projectCapabilitiesHandler: Handler<ProjectCapabilitiesResponse, { projectId: string }> = async (request) => {
  const { projectId } = request.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  return await getProjectCapabilities(
    request.headers.authorization ?? '',
    projectIdInteger,
    request.projectRole,
    isSuperUser(request)
  )
}
