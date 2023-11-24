import { type LocationProjectQuery, type MyProjectsResponse, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { getMemberProjectCoreIds } from '@/_middleware/get-member-projects'
import { getProjects } from '@/projects/projects-bll'
import { ApiServerError } from '~/errors'
import { type Handler } from '../_services/api-helpers/types'
import { getMyProjectsWithInfo } from './projects-dao'

export const projectsAllHandler: Handler<ProjectsResponse> = async (req) => {
  try {
    // Inputs & validation
    const memberProjectCoreIds = getMemberProjectCoreIds(req)

    // Response
    return await getProjects(memberProjectCoreIds)
  } catch (err) {
    req.log.error(err)
    throw ApiServerError()
  }
}

export const myProjectsHandler: Handler<MyProjectsResponse, unknown, LocationProjectQuery> = async (req) => {
  try {
    // Inputs & validation
    const memberProjectCoreIds = getMemberProjectCoreIds(req)

    // Response
    return await getMyProjectsWithInfo(memberProjectCoreIds, req.query.limit, req.query.offset)
  } catch (err) {
    req.log.error(err)
    throw ApiServerError()
  }
}
