import { type ProjectProfileParams, type ProjectProfileResponse } from '@rfcx-bio/common/api-bio/project-profile/project-profile'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectProfile } from './project-profile-dao'

export const projectProfileHandler: Handler<ProjectProfileResponse, ProjectProfileParams> = async (req) => {
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
