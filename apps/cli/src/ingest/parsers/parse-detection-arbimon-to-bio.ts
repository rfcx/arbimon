import { groupBy } from 'lodash-es'
import { Op, Sequelize } from 'sequelize'
import { SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { filterRepeatingDetectionMinutes } from './parse-array'

const DetectionArbimonSchema = z.object({
  idArbimon: z.number(),
  datetime: z.string(), // recording datetime
  siteId: z.number(),
  recordingDuration: z.number(),
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
  countsByMinute: z.array(z.array(z.number()))
})

export type DetectionArbimon = z.infer<typeof DetectionArbimonSchema>
export type DetectionBySiteSpeciesHourBio = z.infer<typeof DetectionBySiteSpeciesHourBioSchema>

export const parseDetectionArbimonToBio = (detectionArbimon: unknown): SafeParseReturnType<unknown, DetectionArbimon> =>
DetectionArbimonSchema.safeParse(detectionArbimon)

function isValidated (val: DetectionArbimon): boolean {
  return (val.present !== null && val.present > 0) || val.presentReview > 0
}

const getTimePrecisionHourLocal = (datetime: string): string => {
  return dayjs.utc(datetime).format('YYYY-MM-DD HH:00:00+00') // string of date e.g. 2020-12-06 10:00:00
}

export const transformDetectionArbimonToBio = async (detectionArbimon: DetectionArbimon[], sequelize: Sequelize): Promise<DetectionBySiteSpeciesHourBio[][]> => {
  const itemsToInsertOrUpsert: DetectionBySiteSpeciesHourBio[] = []
  const itemsToDelete: DetectionBySiteSpeciesHourBio[] = []
  const arbimonDetectionGroupBySites = groupBy(detectionArbimon, 'siteId')
  const arbimonDetectionGroupBySpecies = groupBy(detectionArbimon, 'speciesId')

  // group arbimon detections by date, hour,site, species
  const arbimonDetectionGroupByDateHourSiteSpecies = Object.values(groupBy(detectionArbimon, d => `${getTimePrecisionHourLocal(d.datetime)}-${d.siteId}-${d.speciesId}`))
  const biodiversitySites = await ModelRepository.getInstance(sequelize).LocationSite.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonDetectionGroupBySites).map(Number) } },
    raw: true
  })

  const biodiversitySpecies = await ModelRepository.getInstance(sequelize).TaxonSpecies.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonDetectionGroupBySpecies).map(Number) } },
    raw: true
  })

  // Group new selected arbimon detections
  for (const group of arbimonDetectionGroupByDateHourSiteSpecies) {
    const timePrecisionHourLocal = getTimePrecisionHourLocal(group[0].datetime)
    const locationSite = biodiversitySites.find(site => site.idArbimon === group[0].siteId)
    const locationSiteId = locationSite?.id
    const taxonSpeciesId = biodiversitySpecies.find(species => species.idArbimon === group[0].speciesId)?.id
    if (locationSiteId === undefined || taxonSpeciesId === undefined) {
      // skip recordings with haven't synced site (validation issue)
      continue
    }

    // Find existing detections in the bio db
    const biodiversityDetection = await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.findOne({
      where: {
        timePrecisionHourLocal,
        locationSiteId,
        taxonSpeciesId
      },
      raw: true
    }) as unknown as DetectionBySiteSpeciesHourBio

    if (biodiversityDetection === null) {
      // detection to insert (only validated detections)
      const filteredArbimonDetectionsByValidation = group.filter(dt => isValidated(dt))
      if (filteredArbimonDetectionsByValidation.length) {
        const recordingData = filterRepeatingDetectionMinutes(filteredArbimonDetectionsByValidation)

        itemsToInsertOrUpsert.push({
          timePrecisionHourLocal: dayjs.utc(timePrecisionHourLocal).toDate(),
          locationProjectId: locationSite?.locationProjectId ?? -1,
          locationSiteId: locationSiteId ?? -1,
          taxonSpeciesId: taxonSpeciesId ?? -1,
          taxonClassId: biodiversitySpecies.find(species => species.idArbimon === group[0].speciesId)?.taxonClassId ?? -1,
          count: recordingData.countsByMinute.length, // 3 - count of detection in the group
          countsByMinute: recordingData.countsByMinute // '{{10,1},{25,1},{55,1}}' - array of recordings datetime minutes (values), related to this group by site/species/date/hour
        })
      }
    } else if (biodiversityDetection?.countsByMinute !== undefined) {
      // detection to upsert
      const countsByMinute = biodiversityDetection.countsByMinute

      group.forEach(dt => {
        const dtMinutes = dayjs(dt.datetime).minute()
        const existingIndex = countsByMinute.findIndex(pair => pair[0] === dtMinutes)
        const existing = existingIndex > -1

        // If a new detection exists and validated -> do nothing
        // Why do we get this detection again?
        // 1. the user increased/decreased present_review column
        // 2. there are several site's recordings with the same datetime and the user added overlapping validation on another recording with the same datetime like on the existing recording
        if (existing && isValidated(dt)) return

        // If new detection does not exist and not validated -> do nothing
        if (!existing && !isValidated(dt)) return

        // If new detection exists and not validated -> remove it
        if (existing && !isValidated(dt)) {
          countsByMinute[existingIndex][1] = countsByMinute[existingIndex][1] - 1
        }

          // If new detection do not exist and validated -> add it
        if (!existing && isValidated(dt)) {
          countsByMinute.push([dtMinutes, 1])
        }
      })

      // Keep the detections with count is not equal `0` in the countsByMinute: [[6, 0], [30, 1]] => [[30, 1]]
      const filteredDetections = countsByMinute.filter(group => group[1] !== 0)

      const upsertOrDeleteGroup = {
        timePrecisionHourLocal: biodiversityDetection.timePrecisionHourLocal,
        locationSiteId: biodiversityDetection.locationSiteId,
        taxonSpeciesId: biodiversityDetection.taxonSpeciesId,
        locationProjectId: biodiversityDetection.locationProjectId,
        taxonClassId: biodiversityDetection.taxonClassId,
        count: filteredDetections.length,
        countsByMinute: filteredDetections
      }

      // If a detection count is `0` in the countsByMinute -> remove this detection
      const isDeletedDetection = upsertOrDeleteGroup.count === 0

      if (isDeletedDetection) itemsToDelete.push(upsertOrDeleteGroup)
      else itemsToInsertOrUpsert.push(upsertOrDeleteGroup)
    }
  }

  return [itemsToInsertOrUpsert, itemsToDelete]
}
