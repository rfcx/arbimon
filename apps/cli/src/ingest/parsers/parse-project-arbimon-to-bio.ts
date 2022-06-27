import { SafeParseReturnType, z } from 'zod'

import { Project } from '@rfcx-bio/common/dao/types'

const ProjectArbimonSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  slug: z.string(),
  name: z.string()
})

export const parseProjectArbimonToBio = (projectArbimon: object): SafeParseReturnType<Project, Record<string, any>> =>
  ProjectArbimonSchema.safeParse(projectArbimon)
