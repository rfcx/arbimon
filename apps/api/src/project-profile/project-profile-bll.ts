import { type ProjectProfileUpdateBody, type ProjectSettingsResponse } from '@rfcx-bio/common/api-bio/project/project-settings'

import { updateProjectVersion } from '@/projects/project-version-dao'
import { editProject } from '~/api-core/api-core'
import { getProjectCoreId, updateProjectSettings as updateProjectSettingsLocal } from './project-profile-dao'

export const updateProjectAndProfile = async (request: ProjectProfileUpdateBody, token: string, projectId: number): Promise<ProjectSettingsResponse> => {
  // Get core project id
  const coreProjectId = await getProjectCoreId(projectId)
  if (coreProjectId === undefined) throw new Error(`Failed to get core project id for locationProjectId: ${projectId}`)

  // update in Core
  // name is required as part of checking for permission in Core
  // TODO: check if we want to add is_public to the request
  const updateInCoreSuccess = await editProject(coreProjectId, { name: request.name }, token)
  if (!updateInCoreSuccess) throw new Error('Failed to update project in Core')

  // TODO: move update name here

  if (request.isPublic !== undefined) {
    await updateProjectVersion(projectId, request.isPublic)
  }

  // update in local db
  return await updateProjectSettingsLocal(projectId, request)
}
