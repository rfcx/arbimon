import { type ProjectCreateRequest } from '@rfcx-bio/common/api-bio/project/project-create'

import { createProject as createProjectInCore } from '~/api-core/api-core'
import { createProject as createProjectLocal } from './project-create-dao'

export const createProject = async (request: ProjectCreateRequest, token: string): Promise<string> => {
  // Create in Core
  const id = await createProjectInCore({ name: request.name, is_public: false }, token)
  const project = await getProjectInCore(id)

  // Pre-populate insights table with the same data (will get updated again after sync)
  const project = { id, name: request.name }
  const slug = await createProjectLocal(project)
  return slug
}
