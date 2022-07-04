import { SafeParseReturnType, z } from 'zod'

const SiteArbimonSchema = z.object({
  idArbimon: z.number(),
  idCore: z.string(),
  locationProjectId: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number()
})

export type SiteArbimon = z.infer<typeof SiteArbimonSchema>

export const parseSiteArbimonToBio = (siteArbimon: unknown): SafeParseReturnType<unknown, SiteArbimon> =>
SiteArbimonSchema.safeParse(siteArbimon)
