import { type ProjectSettingsParams, type ProjectSettingsResponse, type ProjectSettingsUpdateBody } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectSettings } from './project-profile-dao'
import { updateProjectAndProfile } from './project-settings-bll'

export const projectSettingsHandler: Handler<ProjectSettingsResponse, ProjectSettingsParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectContent = await getProjectSettings(projectIdInteger)
  return projectContent
}

export const projectSettingsUpdateHandler: Handler<ProjectSettingsResponse, ProjectSettingsParams, unknown, ProjectSettingsUpdateBody> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  return await updateProjectAndProfile(req.body, req.headers.authorization ?? '', projectIdInteger)
}
