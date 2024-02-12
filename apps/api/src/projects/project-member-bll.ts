import { type ProjectRole, RANKING_NONE } from '@rfcx-bio/common/roles'

import { getIdByEmail } from '@/users/user-profile-dao'
import { addProjectMemberLegacy, removeProjectMemberLegacy, updateProjectMemberLegacy } from '~/api-legacy-arbimon'
import { BioNotFoundError } from '~/errors'
import { create, destroy, update } from './dao/project-member-dao'
import { getProjectById } from './dao/projects-dao'

export const addProjectMember = async (token: string, locationProjectId: number, email: string, role?: Exclude<ProjectRole, 'none'>): Promise<void> => {
  const project = await getProjectById(locationProjectId)
  if (project === undefined) {
    throw BioNotFoundError()
  }

  const userId = await getIdByEmail(email)
  if (userId === undefined) {
    throw BioNotFoundError()
  }

  // Legacy
  await addProjectMemberLegacy(token, project.slug, email, role ?? 'user')

  // Local
  await create({ locationProjectId, userId, role: role ?? 'user', ranking: RANKING_NONE })
}

export const removeProjectMember = async (token: string, locationProjectId: number, email: string): Promise<void> => {
  const project = await getProjectById(locationProjectId)
  if (project === undefined) {
    throw BioNotFoundError()
  }

  const userId = await getIdByEmail(email)
  if (userId === undefined) {
    throw BioNotFoundError()
  }

  // Legacy
  await removeProjectMemberLegacy(token, project.slug, email)

  // Local
  await destroy(locationProjectId, userId)
}

export const updateProjectMember = async (token: string, locationProjectId: number, email: string, role: Exclude<ProjectRole, 'none'>): Promise<void> => {
  const project = await getProjectById(locationProjectId)
  if (project === undefined) {
    throw BioNotFoundError()
  }

  const userId = await getIdByEmail(email)
  if (userId === undefined) {
    throw BioNotFoundError()
  }

  // Legacy
  await updateProjectMemberLegacy(token, project.slug, email, role)

  // Local
  await update({ locationProjectId, userId, role })
}
