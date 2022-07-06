import { SafeParseReturnType, z } from 'zod'

const SpeciesArbimonSchema = z.object({
  idArbimon: z.number(),
  slug: z.string(),
  scientificName: z.string(),
  taxonClassId: z.number()
})

export type SpeciesArbimon = z.infer<typeof SpeciesArbimonSchema>

export const parseSpeciesArbimonToBio = (speciesArbimon: unknown): SafeParseReturnType<unknown, SpeciesArbimon> =>
SpeciesArbimonSchema.safeParse(speciesArbimon)
