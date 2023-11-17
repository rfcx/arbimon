import { type ProjectProfileParams, type ProjectProfileResponse, type ProjectProfileUpdateBody } from '@rfcx-bio/common/api-bio/project-profile/project-profile'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { updateProjectProfile } from './project-profile-dao'

export const projectProfileUpdateHandler: Handler<ProjectProfileResponse, ProjectProfileParams, unknown, ProjectProfileUpdateBody> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  const { summary, objectives } = req.body
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  if (summary === undefined && objectives === undefined) {
    throw new Error('Either summary or readme must be provided')
  }

  // TODO: validate user permissions with Core API

  const projectContent = await updateProjectProfile(projectIdInteger, { summary, objectives: objectives ?? [] })
  return { summary: projectContent?.summary ?? '', objectives: projectContent?.objectives ?? [] }
}
