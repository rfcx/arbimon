import { ProjectsResponse } from '@rfcx-bio/common/api-bio/common/projects'

import { getUserProjects } from '@/projects/projects-dao'

export const getProjects = async (memberProjectCoreIds: string[]): Promise<ProjectsResponse> => {
  // TODO: Do we need BLL for this? Maybe we should be wrapping API responses
  return await getUserProjects(memberProjectCoreIds)
}
