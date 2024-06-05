import { type ProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'
import { type Project } from '@rfcx-bio/node-common/dao/types'

import { query } from '@/projects/dao/projects-dao'

export const getProjects = async (keyword?: string, limit?: number, offset?: number): Promise<ProjectsResponse> =>
  await query<Project>({ keyword }, { limit, offset })
