import type { DirectoryProjectsQuery, DirectoryProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { type Handler } from '../_services/api-helpers/types'
import { getDirectoryProjects } from './get-directory-projects-bll'

export const projectsDirectoryHandler: Handler<DirectoryProjectsResponse, unknown, DirectoryProjectsQuery> = async (req) => {
  return await getDirectoryProjects(req.query)
}
