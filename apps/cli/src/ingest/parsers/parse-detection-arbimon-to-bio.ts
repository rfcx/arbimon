import { SafeParseReturnType, z } from 'zod'

const DetectionArbimonSchema = z.object({
  projectId: z.number(),
  date: z.string(),
  hour: z.string(),
  siteId: z.number(),
  speciesId: z.number(),
  detectionCount: z.number(),
  detectionMinutes: z.string(),
  detectionId: z.string(),
  updatedAt: z.string()
})

export type DetectionArbimon = z.infer<typeof DetectionArbimonSchema>

export const parseDetectionArbimonToBio = (detectionArbimon: unknown): SafeParseReturnType<unknown, DetectionArbimon> =>
DetectionArbimonSchema.safeParse(detectionArbimon)
