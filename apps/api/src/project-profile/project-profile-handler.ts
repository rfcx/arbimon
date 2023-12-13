import { ProjectProfileQuery, type ProjectProfileParams, type ProjectSettingsResponse, type ProjectProfileUpdateBody } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectInfo } from './project-profile-dao'
import { updateProjectAndProfile } from './project-profile-bll'

export const projectProfileHandler: Handler<ProjectSettingsResponse, ProjectProfileParams, ProjectProfileQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const { fields } = req.query
  console.log('params', fields)

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const projectContent = await getProjectInfo(projectIdInteger, fields ?? [])
  return projectContent
}

export const projectProfileUpdateHandler: Handler<ProjectSettingsResponse, ProjectProfileParams, unknown, ProjectProfileUpdateBody> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  return await updateProjectAndProfile(req.body, req.headers.authorization ?? '', projectIdInteger)
}
