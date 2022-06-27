import { SafeParseReturnType, z } from 'zod'

import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

const SpeciesArbimonSchema = z.object({
  idArbimon: z.number(),
  slug: z.string(),
  scientificName: z.string(),
  taxonClassId: z.number(),
  updatedAt: z.string()
})

export const parseSpeciesArbimonToBio = (speciesArbimon: object): SafeParseReturnType<TaxonSpecies, Record<string, any>> =>
SpeciesArbimonSchema.safeParse(speciesArbimon)
