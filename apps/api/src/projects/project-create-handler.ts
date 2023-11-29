import { type ProjectCreateRequest, type ProjectCreateResponse } from '@rfcx-bio/common/api-bio/project/project-create'

import { extractUserId } from '~/auth0/extract-user'
import { type Handler } from '../_services/api-helpers/types'
import { createProject } from './project-create-bll'

export const projectCreateHandler: Handler<ProjectCreateResponse, unknown, unknown, ProjectCreateRequest> = async (req, res) => {
  // Inputs & validation
  const project = req.body
  const userIdAuth0 = await extractUserId(req)

  const slug = await createProject(project, userIdAuth0, req.headers.authorization ?? '')
  res.statusCode = 201
  return { slug }
}
