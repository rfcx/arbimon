import { type DashboardStakeholdersParams, type DashboardStakeholdersResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'
import { type ProjectProfileParams, type ProjectProfileQuery, type ProjectProfileUpdateBody, type ProjectSettingsResponse } from '@rfcx-bio/common/api-bio/project/project-settings'

import { getProjectStakeholders, getProjectStakeholderUsers } from '@/dashboard/dashboard-stakeholders-dao'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectInfo } from './dao/project-profile-dao'
import { updateProjectAndProfile } from './project-profile-bll'

export const projectProfileHandler: Handler<ProjectSettingsResponse, ProjectProfileParams, ProjectProfileQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const { fields } = req.query

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

export const projectProfileStakeholdersReadOnlyHandler: Handler<DashboardStakeholdersResponse, DashboardStakeholdersParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const organizations = await getProjectStakeholders(projectIdInteger)
  const users = await getProjectStakeholderUsers(projectIdInteger)

  return {
    users,
    organizations
  }
}