import { type ProjectRole, RANKING_NONE } from '@rfcx-bio/common/roles'

import { getIdByEmail } from '@/users/user-profile-dao'
import { BioNotFoundError } from '~/errors'
import { create, destroy, update } from './dao/project-member-dao'

export const addProjectMember = async (locationProjectId: number, email: string, role?: Exclude<ProjectRole, 'none'>): Promise<void> => {
  const userId = await getIdByEmail(email)
  if (userId === undefined) {
    throw BioNotFoundError()
  }
  // Legacy
  // TODO: add in Arbimon
  // Local
  await create({ locationProjectId, userId, role: role ?? 'user', ranking: RANKING_NONE })
}

export const removeProjectMember = async (locationProjectId: number, email: string): Promise<void> => {
  const userId = await getIdByEmail(email)
  if (userId === undefined) {
    throw BioNotFoundError()
  }
  // Legacy
  // TODO: remove in Arbimon
  // Local
  await destroy(locationProjectId, userId)
}

export const updateProjectMember = async (locationProjectId: number, email: string, role: Exclude<ProjectRole, 'none'>): Promise<void> => {
  const userId = await getIdByEmail(email)
  if (userId === undefined) {
    throw BioNotFoundError()
  }
  // Legacy
  // TODO: update in Arbimon
  // Local
  await update({ locationProjectId, userId, role })
}
