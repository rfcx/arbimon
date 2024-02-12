import { type ProjectProfileUpdateBody, type ProjectSettingsResponse } from '@rfcx-bio/common/api-bio/project/project-settings'

import { updateProjectLegacy } from '~/api-legacy-arbimon'
import { updateProjectSettings as updateProjectSettingsLocal } from './dao/project-profile-dao'
import { updateProjectHiddenStatus } from './dao/project-status-dao'
import { getProjectById } from './dao/projects-dao'

export const updateProjectAndProfile = async (request: ProjectProfileUpdateBody, token: string, projectId: number): Promise<ProjectSettingsResponse> => {
  const project = await getProjectById(projectId)
  if (project === undefined) {
    throw new Error(`Failed to get arbimon project id for locationProjectId: ${projectId}`)
  }

  // Update Legacy (note: updates Core by itself)
  if (request.name !== undefined || request.slug !== undefined) {
    const name = request.name ?? project.name
    const url = request.slug ?? project.slug
    await updateProjectLegacy(token, project.slug, {
      project: { name, url, project_id: project.idArbimon }
    })
  }

  // Update locally

  if (request.hidden !== undefined) {
    await updateProjectHiddenStatus(projectId, request.hidden)
  }

  return await updateProjectSettingsLocal(projectId, request)
}
