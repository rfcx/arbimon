import { floor, groupBy } from 'lodash-es'
import { Op, Sequelize } from 'sequelize'
import { SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

interface RecordingData {
  detectionMinutes: number[]
  durationMinutes: number
}

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
  durationMinutes: z.number(),
  detectionMinutes: z.array(z.number())
})

export type DetectionArbimon = z.infer<typeof DetectionArbimonSchema>
export type DetectionBySiteSpeciesHourBio = z.infer<typeof DetectionBySiteSpeciesHourBioSchema>

export const parseDetectionArbimonToBio = (detectionArbimon: unknown): SafeParseReturnType<unknown, DetectionArbimon> =>
DetectionArbimonSchema.safeParse(detectionArbimon)

function isValidated (val: DetectionArbimon): boolean {
  return (val.present !== null && val.present > 0) || val.presentReview > 0
}

function filterRepeatingDetectionMinutes (group: DetectionArbimon[]): RecordingData {
  return group.reduce((acc, cur) => {
    const minute = Number(dayjs(cur.datetime).minute().toString())
      if (!acc.detectionMinutes.includes(minute)) {
        acc.detectionMinutes.push(minute)
        acc.durationMinutes += cur.recordingDuration
      }
      return acc
    }, { detectionMinutes: [] as number[], durationMinutes: 0 })
}

const getTimePrecisionHourLocal = (datetime: string): string => {
  return dayjs.utc(datetime).format('YYYY-MM-DD HH:00:00') // string of date e.g. 2020-12-06 10:00:00
}

const floorValue = (n: number): number => {
  return floor(n, 0)
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
    const locationSiteId = biodiversitySites.find(site => site.idArbimon === group[0].siteId)?.id

    // Skip recordings with haven't synced site (validation issue)
    if (locationSiteId !== undefined) {
      const taxonSpeciesId = biodiversitySpecies.find(species => species.idArbimon === group[0].speciesId)?.id
      // Find existing detections in the bio db
      const biodiversityDetection = await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.findOne({
        where: {
          timePrecisionHourLocal: dayjs.utc(timePrecisionHourLocal).toDate(),
          locationSiteId,
          taxonSpeciesId
        },
        raw: true
      }) as unknown as DetectionBySiteSpeciesHourBio

      if (biodiversityDetection === null) {
        // detections to insert (only validated detections)
        const filteredArbimonDetectionsByValidation = group.filter(dt => isValidated(dt))
        if (filteredArbimonDetectionsByValidation.length) {
          const site = biodiversitySites.find(site => site.idArbimon === group[0].siteId)

          // filter repeating recordings datetime to avoid inserting duplicate of
          // recordings durationMinutes and detectionMinutes
          const recordingData = filterRepeatingDetectionMinutes(filteredArbimonDetectionsByValidation)

          itemsToInsertOrUpsert.push({
            timePrecisionHourLocal: dayjs.utc(timePrecisionHourLocal).toDate(),
            locationProjectId: site?.locationProjectId ?? -1,
            locationSiteId: site?.id ?? -1,
            taxonSpeciesId: taxonSpeciesId ?? -1,
            taxonClassId: biodiversitySpecies.find(species => species.idArbimon === group[0].speciesId)?.taxonClassId ?? -1,
            count: filteredArbimonDetectionsByValidation.length, // 1 - count of detection in the group
            durationMinutes: floorValue(recordingData.durationMinutes / 60), // 3 - duration of recordings datetime minutes, related to this group by site/species/date/hour
            detectionMinutes: recordingData.detectionMinutes // '10,25,55' - array of recordings datetime minutes (values), related to this group by site/species/date/hour
          })
        }
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      } else if (biodiversityDetection?.detectionMinutes) {
        // detections to upsert
        const count = biodiversityDetection.count
        const detectionMinutes = biodiversityDetection.detectionMinutes
        const durationMinutes = biodiversityDetection.durationMinutes
        const detectionCountMinutes = {
          count,
          detectionMinutes,
          durationMinutes
        }
        group.forEach(dt => {
          const dtMinutes = Number(dayjs(dt.datetime).minute().toString())

          // filter repeating recordings detectionMinutes to avoid inserting duplicate of it
          const existing = detectionCountMinutes?.detectionMinutes.includes(dtMinutes)

          // If new detection exists and validated -> do nothing
          // If new detection does not exist and not validated -> do nothing
          // If new detection exists and not validated -> remove it
          // If new detection do not exist and validated -> add it
          if (existing && isValidated(dt)) return
          if (!existing && !isValidated(dt)) return
          if (existing && !isValidated(dt)) {
            detectionCountMinutes.count = detectionCountMinutes.count - 1
            const index = detectionCountMinutes.detectionMinutes.findIndex(min => min === dtMinutes)
            detectionCountMinutes.detectionMinutes.splice(index, 1)
            detectionCountMinutes.durationMinutes = floorValue(detectionCountMinutes.durationMinutes - (dt.recordingDuration / 60))
          }
          if (!existing && isValidated(dt)) {
            detectionCountMinutes.count = detectionCountMinutes.count + 1
            detectionCountMinutes.detectionMinutes.push(dtMinutes)
            detectionCountMinutes.durationMinutes = floorValue(detectionCountMinutes.durationMinutes + (dt.recordingDuration / 60))
          }
        })

        const upsertOrDeleteGroup = {
          timePrecisionHourLocal: biodiversityDetection.timePrecisionHourLocal,
          locationSiteId: biodiversityDetection.locationSiteId,
          taxonSpeciesId: biodiversityDetection.taxonSpeciesId,
          locationProjectId: biodiversityDetection.locationProjectId,
          taxonClassId: biodiversityDetection.taxonClassId,
          durationMinutes: detectionCountMinutes.durationMinutes,
          count: detectionCountMinutes.count,
          detectionMinutes: detectionCountMinutes.detectionMinutes
        }

        if (detectionCountMinutes.count === 0) itemsToDelete.push(upsertOrDeleteGroup)
        else itemsToInsertOrUpsert.push(upsertOrDeleteGroup)
      }
    }
  }

  return [itemsToInsertOrUpsert, itemsToDelete]
}
