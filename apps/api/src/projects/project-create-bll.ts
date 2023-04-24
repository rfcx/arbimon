import { type ProjectCreateRequest } from '@rfcx-bio/common/api-bio/project/project-create'

import { createProject as createProjectInCore, getProject as getProjectInCore } from '~/api-core/api-core'
import { clearMemberProjectCoreIds } from '~/cache/user-project-cache'
import { createProject as createProjectLocal } from './project-create-dao'

export const createProject = async (request: ProjectCreateRequest, auth0UserId: string, token: string): Promise<string> => {
  // Create in Core
  const idCore = await createProjectInCore({ name: request.name, is_public: false }, token)
  const { external_id: idArbimon } = await getProjectInCore(idCore, token)

  // Cache user project
  await clearMemberProjectCoreIds(auth0UserId)

  // Pre-populate insights table with the same data (will get updated again after sync)
  const project = { idCore, idArbimon, name: request.name }
  const slug = await createProjectLocal(project)
  return slug
}
