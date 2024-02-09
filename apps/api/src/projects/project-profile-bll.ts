import { type ProjectProfileUpdateBody, type ProjectSettingsResponse } from '@rfcx-bio/common/api-bio/project/project-settings'

import { updateProjectSettingsOnLegacyAndCore } from '~/api-legacy-arbimon'
import { updateProjectSettings as updateProjectSettingsLocal } from './dao/project-profile-dao'
import { updateProjectHiddenStatus } from './dao/project-status-dao'
import { getProjectById } from './dao/projects-dao'

export const updateProjectAndProfile = async (request: ProjectProfileUpdateBody, token: string, projectId: number): Promise<ProjectSettingsResponse> => {
  // get arbimon id
  const project = await getProjectById(projectId)
  if (project === undefined) {
    throw new Error(`Failed to get arbimon project id for locationProjectId: ${projectId}`)
  }

  // update in arbimon
  // arbimon updates core by itself
  await updateProjectSettingsOnLegacyAndCore(token, project.slug, {
    project: {
      project_id: project.idArbimon,
      name: request.name,
      url: request.slug,
      // TODO: Updating is_private to legacy and core?
      description: request.summary
    }
  })

  // TODO: move update name here
  if (request.isPublic !== undefined) {
    await updateProjectHiddenStatus(projectId, !request.isPublic)
  }

  // update in local db
  return await updateProjectSettingsLocal(projectId, request)
}
