import { type ProjectSettingsParams, type ProjectSettingsResponse, type ProjectSettingsUpdateBody } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectSettings, updateProjectSettings } from './project-profile-dao'

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
  const { summary, objectives, name } = req.body
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  // TODO: validate user permissions with Core API

  if (summary === undefined && objectives === undefined) {
    throw new Error('Either summary or readme must be provided')
  }

  return await updateProjectSettings(projectIdInteger, { summary, objectives, name })
}
