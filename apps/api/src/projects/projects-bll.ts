import { type MyProjectsResponse, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { getMyProjectsWithInfo as getMyProjects, getViewableProjects } from '@/projects/dao/projects-dao'

export const getProjects = async (userId: number | undefined): Promise<ProjectsResponse> => {
  return await getViewableProjects(userId)
}

export const getMyProjectsWithInfo = async (userId: number): Promise<MyProjectsResponse> => {
  return await getMyProjects(userId)
}
