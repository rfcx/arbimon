import { type ProjectCreateRequest, type ProjectCreateResponse } from '@rfcx-bio/common/api-bio/project/project-create'

import { type Handler } from '../_services/api-helpers/types'
import { createProject } from './project-create-bll'
import { Auth0UserInfo } from '~/auth0'

export const projectCreateHandler: Handler<ProjectCreateResponse, unknown, unknown, ProjectCreateRequest> = async (req, res) => {
  // Inputs & validation
  const project = req.body

  const auth0UserInfo = await req.jwtDecode<Auth0UserInfo>()

  const slug = await createProject(project, auth0UserInfo.auth0_user_id, req.headers.authorization ?? '')
  res.statusCode = 201
  return { slug }
}
