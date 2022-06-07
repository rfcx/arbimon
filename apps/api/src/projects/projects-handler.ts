import { ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { getMemberProjectCoreIds } from '@/_middleware/get-member-projects'
import { getProjects } from '@/projects/projects-bll'
import { ApiServerError } from '~/errors'
import { Handler } from '../_services/api-helpers/types'

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
