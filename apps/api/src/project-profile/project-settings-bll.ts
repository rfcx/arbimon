import { type ProjectSettingsResponse, type ProjectSettingsUpdateBody } from '@rfcx-bio/common/api-bio/project-profile/project-settings'

import { editProject } from '~/api-core/api-core'
import { getProjectCoreId, updateProjectSettings as updateProjectSettingsLocal } from './project-profile-dao'

export const updateProjectAndProfile = async (request: ProjectSettingsUpdateBody, token: string, projectId: number): Promise<ProjectSettingsResponse> => {
  // Get core project id
  const coreProjectId = await getProjectCoreId(projectId)
  if (coreProjectId === undefined) throw new Error(`Failed to get core project id for locationProjectId: ${projectId}`)

  // TODO: save change on Arbimon legacy

  // update in Core
  const updateInCoreSuccess = await editProject(coreProjectId, { name: request.name }, token)
  if (!updateInCoreSuccess) throw new Error('Failed to update project in Core')

  // update in local db
  return await updateProjectSettingsLocal(projectId, request)
}