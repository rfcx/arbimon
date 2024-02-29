import { type LocationProjectQuery, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { type Handler } from '../_services/api-helpers/types'
import { getProjects } from './super-projects-bll'

export const superGetProjectsHandler: Handler<ProjectsResponse, unknown, LocationProjectQuery> = async (req) => {
  return await getProjects(req.query.keyword, req.query.limit, req.query.offset)
}
