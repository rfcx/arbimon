import { groupBy } from 'lodash-es'
import { Op, Sequelize } from 'sequelize'
import { SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

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

const DetectionBySiteSpeciesHourBioSchema = z.object({
  timePrecisionHourLocal: z.date(),
  locationSiteId: z.number(),
  taxonSpeciesId: z.number(),
  locationProjectId: z.number(),
  taxonClassId: z.number(),
  count: z.number(),
  detectionMinutes: z.number().array()
})

export type DetectionArbimon = z.infer<typeof DetectionArbimonSchema>
export type DetectionBySiteSpeciesHourBio = z.infer<typeof DetectionBySiteSpeciesHourBioSchema>

export const parseDetectionArbimonToBio = (detectionArbimon: unknown): SafeParseReturnType<unknown, DetectionArbimon> =>
DetectionArbimonSchema.safeParse(detectionArbimon)

export const transformDetectionArbimonToBio = async (detectionArbimon: DetectionArbimon[], sequelize: Sequelize): Promise<DetectionBySiteSpeciesHourBio[]> => {
  const arbimonDetectionGroupByProject = groupBy(detectionArbimon, 'projectId')
  const arbimonDetectionGroupBySites = groupBy(detectionArbimon, 'siteId')
  const arbimonDetectionGroupBySpecies = groupBy(detectionArbimon, 'speciesId')

  // get distinct bio project ids
  const biodiversityProjects = await ModelRepository.getInstance(sequelize).LocationProject.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonDetectionGroupByProject).map(Number) } },
    raw: true
  })

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
    const { projectId, siteId, speciesId, date, hour, detectionCount, detectionMinutes } = detection
    return {
      timePrecisionHourLocal: new Date(new Date(date).getTime() + Number(hour) * 60 * 60 * 1000),
      locationProjectId: biodiversityProjects.find(project => project.idArbimon === projectId)?.id ?? -1,
      locationSiteId: biodiversitySites.find(site => site.idArbimon === siteId)?.id ?? -1,
      taxonSpeciesId: biodiversitySpecies.find(species => species.idArbimon === speciesId)?.id ?? -1,
      taxonClassId: biodiversitySpecies.find(species => species.idArbimon === speciesId)?.taxonClassId ?? -1,
      count: detectionCount,
      detectionMinutes: detectionMinutes.split(',').map(Number)
    }
  })
}
