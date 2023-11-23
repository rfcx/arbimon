import { type MyProjectsResponse, type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'

import { getViewableProjects } from '@/projects/projects-dao'

export const getProjects = async (memberProjectCoreIds: string[]): Promise<ProjectsResponse> => {
  return await getViewableProjects(memberProjectCoreIds)
}

export const getMyProjectsWithInfo = async (memberProjectCoreIds: string[]): Promise<MyProjectsResponse> => {
  return await getMyProjectsWithInfo(memberProjectCoreIds)
}
