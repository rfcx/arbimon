import { type ProjectCreateRequest, type ProjectCreateResponse } from '@rfcx-bio/common/api-bio/project/project-create'

import { type Handler } from '../_services/api-helpers/types'
import { createProject } from './project-create-bll'

export const projectCreateHandler: Handler<ProjectCreateResponse, unknown, unknown, ProjectCreateRequest> = async (req) => {
  // Inputs & validation
  const project = req.body

  const slug = await createProject(project, req.headers.authorization ?? '')
  return { slug }
}
