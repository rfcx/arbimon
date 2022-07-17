import { groupBy } from 'lodash-es'
import { Op, Sequelize } from 'sequelize'
import { SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

const DetectionArbimonSchema = z.object({
  idArbimon: z.number(),
  datetime: z.string(),
  date: z.string(),
  hour: z.string(),
  siteId: z.number(),
  speciesId: z.number(),
  present: z.number().nullable(),
  presentReview: z.number(),
  presentAed: z.number(),
  updatedAt: z.string()
})

const DetectionBySiteSpeciesHourBioSchema = z.object({
  timePrecisionHourLocal: z.date(),
  locationSiteId: z.number(),
  taxonSpeciesId: z.number(),
  locationProjectId: z.number(),
  taxonClassId: z.number(),
  count: z.number(),
  durationMinutes: z.number(), // TODO: remove parameter
  detectionMinutes: z.string()
})

export type DetectionArbimon = z.infer<typeof DetectionArbimonSchema>
export type DetectionBySiteSpeciesHourBio = z.infer<typeof DetectionBySiteSpeciesHourBioSchema>

export const parseDetectionArbimonToBio = (detectionArbimon: unknown): SafeParseReturnType<unknown, DetectionArbimon> =>
DetectionArbimonSchema.safeParse(detectionArbimon)

export const transformDetectionArbimonToBio = async (detectionArbimon: DetectionArbimon[], sequelize: Sequelize): Promise<DetectionBySiteSpeciesHourBio[]> => {
  const arbimonDetectionGroupBySites = groupBy(detectionArbimon, 'siteId')
  const arbimonDetectionGroupBySpecies = groupBy(detectionArbimon, 'speciesId')

  const biodiversitySites = (await ModelRepository.getInstance(sequelize).LocationSite.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonDetectionGroupBySites).map(Number) } },
    raw: true
  }))

  const biodiversitySpecies = (await ModelRepository.getInstance(sequelize).TaxonSpecies.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonDetectionGroupBySpecies).map(Number) } },
    raw: true
  }))

  // map bio `project id`, `site id` and `species id` into `detection by site species hour` object
  return detectionArbimon.map(detection => {
    const { siteId, speciesId, date, hour, datetime } = detection
    const site = biodiversitySites.find(site => site.idArbimon === siteId)
    return {
      timePrecisionHourLocal: new Date(new Date(date).getTime() + Number(hour) * 60 * 60 * 1000),
      locationProjectId: site?.locationProjectId ?? -1,
      locationSiteId: site?.id ?? -1,
      taxonSpeciesId: biodiversitySpecies.find(species => species.idArbimon === speciesId)?.id ?? -1,
      taxonClassId: biodiversitySpecies.find(species => species.idArbimon === speciesId)?.taxonClassId ?? -1,
      count: 1,
      durationMinutes: 60, // TODO: remove
      detectionMinutes: dayjs(datetime).minute().toString()
    }
  })
}
