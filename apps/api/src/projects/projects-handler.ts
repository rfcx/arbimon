import { type LocationProjectForUser, type LocationProjectQuery, type MyProjectsResponse, type ProjectsGeoResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { type Handler } from '../_services/api-helpers/types'
import { getMyProjectsWithInfo, getViewableProjects } from './dao/projects-dao'
import { getProjectsGeo } from './projects-bll'

export const projectsGeoHandler: Handler<ProjectsGeoResponse, unknown, LocationProjectQuery> = async (req) => {
  return await getProjectsGeo(req.query.limit, req.query.offset)
}

export const projectsAllHandler: Handler<LocationProjectForUser[], unknown, LocationProjectQuery> = async (req) => {
  return await getViewableProjects(req.userId as number)
}

export const myProjectsHandler: Handler<MyProjectsResponse, unknown, LocationProjectQuery> = async (req) => {
  return await getMyProjectsWithInfo(req.userId as number, req.query.offset, req.query.limit)
}
