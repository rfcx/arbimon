import { type ProjectProfileParams, type ProjectProfileQuery, type ProjectProfileUpdateBody, type ProjectSettingsResponse } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { getMemberProjectCoreIds } from '@/_middleware/get-member-projects'
import { getProjects } from '@/projects/projects-bll'
import { type Handler } from '~/api-helpers/types'
import { BioForbiddenError, BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { updateProjectAndProfile } from './project-profile-bll'
import { getProjectInfo } from './project-profile-dao'

export const projectProfileHandler: Handler<ProjectSettingsResponse, ProjectProfileParams, ProjectProfileQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const { fields } = req.query

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  // TODO: change the logic to check for permission
  const memberProjectCoreIds = getMemberProjectCoreIds(req)
  const viewableProjectIds = await (await getProjects(memberProjectCoreIds)).map(p => p.id)
  if (!viewableProjectIds.includes(projectIdInteger)) {
    throw BioForbiddenError() // no permission to this project
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
