import { type ProjectCreateRequest } from '@rfcx-bio/common/api-bio/project/project-create'
import { RANKING_PRIMARY } from '@rfcx-bio/common/roles'

import { createProject as createProjectInCore, getProject as getProjectInCore } from '~/api-core/api-core'
import { create } from './get-project-members-dao'
import { createProject as createProjectLocal } from './project-create-dao'

export const createProject = async (request: ProjectCreateRequest, userId: number, token: string): Promise<string> => {
  // Create in Core
  const idCore = await createProjectInCore({ name: request.name, is_public: false }, token)
  const { external_id: idArbimon } = await getProjectInCore(idCore, token)

  // Pre-populate insights table with the same data (will get updated from Core after sync)
  const dateStart = request.dateStart ? new Date(request.dateStart) : undefined
  const dateEnd = request.dateEnd ? new Date(request.dateEnd) : undefined
  if (dateStart && dateEnd && dateStart > dateEnd) {
    throw new Error('Date start must be before date end')
  }
  const project = { idCore, idArbimon, name: request.name, objectives: request.objectives, dateStart, dateEnd }
  const { id, slug } = await createProjectLocal(project)
  // Set current user as owner
  await create({ locationProjectId: id, userId, role: 'owner', ranking: RANKING_PRIMARY })
  return slug
}
