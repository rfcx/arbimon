import { type ProjectProfileParams, type ProjectProfileResponse } from '@rfcx-bio/common/api-bio/project-profile/project-profile'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectProfile } from './project-profile-dao'

export const projectProfileUpdateHandler: Handler<ProjectProfileResponse, ProjectProfileParams> = async (req) => {
  // TODO: validate input
  // TODO: validate user permissions
  // TODO: update project profile
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectContent = await getProjectProfile(projectIdInteger)
  return projectContent
}
