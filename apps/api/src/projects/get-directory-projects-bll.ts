import { type DirectoryProjectsQuery, type DirectoryProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { queryDirectoryProjects} from './get-directory-projects-dao'

export const getDirectoryProjects = async (req: DirectoryProjectsQuery): Promise<DirectoryProjectsResponse> => {
  const isFull = req.full ?? false
  const ids = (req.ids?.split(',') ?? []).map((id) => parseInt(id))
  const keywords = req.keywords?.split(',') ?? []
  console.info('getDirectoryProjects', req, isFull, ids, keywords)
  return await queryDirectoryProjects(isFull, ids, keywords)
}