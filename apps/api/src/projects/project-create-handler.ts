import { type ProjectCreateRequest, type ProjectCreateResponse } from '@rfcx-bio/common/api-bio/project/project-create'

import { type Handler } from '../_services/api-helpers/types'
import { createProject } from './project-create-bll'

export const projectCreateHandler: Handler<ProjectCreateResponse, unknown, unknown, ProjectCreateRequest> = async (req, res) => {
  // Inputs & validation
  const project = req.body
  const dateStart = project.dateStart ? new Date(project.dateStart) : undefined
  const dateEnd = project.dateEnd ? new Date(project.dateEnd) : undefined
  if (dateStart && dateEnd && dateStart > dateEnd) {
    throw new Error('Date start must be before date end')
  }

  const [slug, id] = await createProject(project, req.userId as number, req.headers.authorization ?? '')
  res.statusCode = 201
  void res.header('Location', `/projects/${id}`)
  return { slug }
}
