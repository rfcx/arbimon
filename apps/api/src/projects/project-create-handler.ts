import { type ProjectCreateRequest, type ProjectCreateResponse } from '@rfcx-bio/common/api-bio/project/project-create'

import { BioInvalidBodyError } from '~/errors'
import { type Handler } from '../_services/api-helpers/types'
import { createProject } from './project-create-bll'

export const projectCreateHandler: Handler<ProjectCreateResponse, unknown, unknown, ProjectCreateRequest> = async (req, res) => {
  // Inputs & validation
  const project = req.body
  const dateStart = project.dateStart ? new Date(project.dateStart) : undefined
  const dateEnd = project.dateEnd ? new Date(project.dateEnd) : undefined
  const validationErrors: Record<string, any> = {}
  if (dateStart !== undefined && isNaN(dateStart.getTime())) {
    validationErrors.dateStart = project.dateStart
  }
  if (dateEnd !== undefined && isNaN(dateEnd.getTime())) {
    validationErrors.dateEnd = project.dateEnd
  }
  if (dateStart === undefined && dateEnd !== undefined) {
    validationErrors.dateStart = 'required when dateEnd is set'
  }
  if (dateStart && dateEnd && dateStart > dateEnd) {
    validationErrors.dateStart = 'must be before dateEnd'
  }
  if (Object.keys(validationErrors).length > 0) {
    throw BioInvalidBodyError(validationErrors)
  }

  const [slug, id] = await createProject({ ...project, dateStart, dateEnd }, req.userId as number, req.headers.authorization ?? '')
  res.statusCode = 201
  void res.header('Location', `/projects/${id}`)
  return { slug }
}
