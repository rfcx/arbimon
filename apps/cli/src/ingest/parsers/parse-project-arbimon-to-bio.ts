import { SafeParseReturnType, z } from 'zod'

const ProjectArbimonSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  slug: z.string(),
  name: z.string()
})

export type ProjectArbimon = z.infer<typeof ProjectArbimonSchema>

export const parseProjectArbimonToBio = (projectArbimon: unknown): SafeParseReturnType<unknown, ProjectArbimon> =>
  ProjectArbimonSchema.safeParse(projectArbimon)
