import { SafeParseReturnType, z } from 'zod'

const ProjectSpeciesArbimonSchema = z.object({
  projectId: z.number(),
  speciesId: z.number()
})

export type ProjectSpeciesArbimon = z.infer<typeof ProjectSpeciesArbimonSchema>

export const parseProjectSpeciesArbimonToBio = (projectSpeciesArbimon: unknown): SafeParseReturnType<unknown, ProjectSpeciesArbimon> =>
ProjectSpeciesArbimonSchema.safeParse(projectSpeciesArbimon)
