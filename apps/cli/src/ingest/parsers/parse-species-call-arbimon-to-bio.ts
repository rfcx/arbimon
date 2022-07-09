import { SafeParseReturnType, z } from 'zod'

const SpeciesCallArbimonSchema = z.object({
  taxonSpeciesId: z.number(),
  callProjectId: z.number(),
  callSiteId: z.number(),
  siteIdCore: z.string().length(12),
  callType: z.string(),
  callRecordedAt: z.date(),
  callTimezone: z.string(),
  start: z.number(),
  end: z.number(),
  updatedAt: z.date(),
  projectSlugArbimon: z.string(),
  recordingId: z.number(),
  idArbimon: z.number(),
  callMediaWavUrl: z.string().optional(),
  callMediaSpecUrl: z.string().optional(),
  callMediaRedirectUrl: z.string().optional()
})

export type SpeciesCallArbimon = z.infer<typeof SpeciesCallArbimonSchema>

export const parseSpeciesCallArbimonToBio = (speciesCallsArbimon: unknown): SafeParseReturnType<unknown, SpeciesCallArbimon> =>
SpeciesCallArbimonSchema.safeParse(speciesCallsArbimon)
