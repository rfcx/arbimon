import { type LocationProjectQuery, type MyProjectsResponse, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { getProjects } from '@/projects/projects-bll'
import { type Handler } from '../_services/api-helpers/types'
import { getMyProjectsWithInfo } from './projects-dao'

export const projectsAllHandler: Handler<ProjectsResponse> = async (req) => {
  return await getProjects(req.userId as number)
}

export const myProjectsHandler: Handler<MyProjectsResponse, unknown, LocationProjectQuery> = async (req) => {
  return await getMyProjectsWithInfo(req.userId as number, req.query.offset, req.query.limit)
}
