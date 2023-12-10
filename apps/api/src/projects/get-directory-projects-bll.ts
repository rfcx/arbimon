import { type DirectoryProjectsQuery, type DirectoryProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { queryDirectoryProjects } from './get-directory-projects-dao'

export const getDirectoryProjects = async (req: DirectoryProjectsQuery): Promise<DirectoryProjectsResponse> => {
  const isLight = req.light ?? false
  const ids = (req.ids?.split(',') ?? []).map((id) => parseInt(id))
  const keywords = req.keywords?.split(',') ?? []
  return await queryDirectoryProjects(isLight, ids, keywords)
  // return getDirectoryProjectsFromMock(isLight, ids.map((id) => parseInt(id)), keywords)
}
