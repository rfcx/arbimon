import { type DirectoryProjectsQuery, type DirectoryProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { getDirectoryProjects as getMock, queryDirectoryProjects } from './dao/get-directory-projects-dao'

export const getDirectoryProjects = async (req: DirectoryProjectsQuery): Promise<DirectoryProjectsResponse> => {
  const isFull = req.full ?? false
  const ids = (req.ids?.split(',') ?? []).map((id) => parseInt(id))
  const keywords = req.keywords?.split(',') ?? []
  return await queryDirectoryProjects(isFull, ids, keywords)
}

export const getDirectoryProjectsMock = async (req: DirectoryProjectsQuery): Promise<DirectoryProjectsResponse> => {
  const isFull = req.full ?? false
  const ids = (req.ids?.split(',') ?? []).map((id) => parseInt(id))
  const keywords = req.keywords?.split(',') ?? []
  return getMock(isFull, ids, keywords)
}
