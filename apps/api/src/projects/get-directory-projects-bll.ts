import { type DirectoryProjectsQuery, type DirectoryProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { getDirectoryProjects as getDirectoryProjectsFromMock } from './get-directory-projects-dao'

export const getDirectoryProjects = (req: DirectoryProjectsQuery): DirectoryProjectsResponse => {
  const isLight = req.light ?? false
  const ids = req.ids?.split(',') ?? []
  const keywords = req.keywords?.split(',') ?? []
  return getDirectoryProjectsFromMock(isLight, ids.map((id) => parseInt(id)), keywords)
}
