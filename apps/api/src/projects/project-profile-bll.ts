import { type ProjectProfileUpdateBody, ERROR_MESSAGE_UPDATE_PROJECT_SET_HIDDEN_WHEN_PUBLISHED, ERROR_MESSAGE_UPDATE_PROJECT_SLUG_NOT_UNIQUE } from '@rfcx-bio/common/api-bio/project/project-settings'

import { updateProjectLegacy } from '~/api-legacy-arbimon'
import { BioNotFoundError, BioPublicError } from '~/errors'
import { updateProjectSettings as updateProjectSettingsLocal } from './dao/project-profile-dao'
import { updateProjectHiddenStatus } from './dao/project-status-dao'
import { getProjectById } from './dao/projects-dao'

export const updateProjectAndProfile = async (request: ProjectProfileUpdateBody, token: string, projectId: number): Promise<void> => {
  const project = await getProjectById(projectId)
  if (project === undefined) {
    throw BioNotFoundError()
  }

  // Don't allow changes to hidden if the project is published
  if (request.hidden !== undefined && project.status === 'published') {
    throw new BioPublicError(ERROR_MESSAGE_UPDATE_PROJECT_SET_HIDDEN_WHEN_PUBLISHED, 400)
  }

  // Update Legacy (note: updates Core by itself)
  if (request.name !== undefined || request.slug !== undefined) {
    const name = request.name ?? project.name
    const url = request.slug ?? project.slug
    const res = await updateProjectLegacy(token, project.slug, {
      project: { name, url, project_id: project.idArbimon }
    })

    if (!res.success && res?.error?.startsWith('URL') === true) {
      throw new BioPublicError(ERROR_MESSAGE_UPDATE_PROJECT_SLUG_NOT_UNIQUE, 400)
    }
  }

  // Update locally
  if (request.hidden !== undefined) {
    await updateProjectHiddenStatus(projectId, request.hidden)
  }
  await updateProjectSettingsLocal(projectId, request)
}
