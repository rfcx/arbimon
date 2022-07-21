import { groupBy } from 'lodash-es'
import { Op, Sequelize } from 'sequelize'
import { SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

interface RecordingData {
  detectionMinutes: string[]
  durationMinutes: number
}

const DetectionArbimonSchema = z.object({
  idArbimon: z.number(),
  datetime: z.string(), // recording datetime
  date: z.string(),
  hour: z.number(),
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
  detectionMinutes: z.string()
})

export type DetectionArbimon = z.infer<typeof DetectionArbimonSchema>
export type DetectionBySiteSpeciesHourBio = z.infer<typeof DetectionBySiteSpeciesHourBioSchema>

export const parseDetectionArbimonToBio = (detectionArbimon: unknown): SafeParseReturnType<unknown, DetectionArbimon> =>
DetectionArbimonSchema.safeParse(detectionArbimon)

function isNotValidated (val: DetectionArbimon): boolean {
  // Reacted to deleted validation and absent validation
  return (val.present === null || val.present === 0) && val.presentReview === 0
}

function filterRepeatingDetectionMinutes (dts: DetectionArbimon[]): RecordingData {
  const recordingData = dts.reduce((acc, cur) => {
      if (!acc.detectionMinutes.includes(cur.datetime)) {
        acc.detectionMinutes.push(cur.datetime)
        acc.durationMinutes += cur.recordingDuration
      }
      return acc
    }, { detectionMinutes: [] as string[], durationMinutes: 0 })
  return recordingData
}

function getDetectionMinutes (datetimeArray: string[]): string {
  return datetimeArray.map(item => dayjs(item).minute().toString()).join(',')
}

export const transformDetectionArbimonToBio = async (detectionArbimon: DetectionArbimon[], sequelize: Sequelize): Promise<DetectionBySiteSpeciesHourBio[][]> => {
  const itemsToInsertOrUpsert: DetectionBySiteSpeciesHourBio[] = []
  // const itemsToUpsert: DetectionBySiteSpeciesHourBio[] = []
  const itemsToDelete: DetectionBySiteSpeciesHourBio[] = []
  const arbimonDetectionGroupBySites = groupBy(detectionArbimon, 'siteId')
  const arbimonDetectionGroupBySpecies = groupBy(detectionArbimon, 'speciesId')

  // group arbimon detections by date, hour,site, species
  const arbimonDetectionGroupByDateHourSiteSpecies = Object.values(groupBy(detectionArbimon, d => `${d.date}-${d.hour}-${d.siteId}-${d.speciesId}`))

  const biodiversitySites = await ModelRepository.getInstance(sequelize).LocationSite.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonDetectionGroupBySites).map(Number) } },
    raw: true
  })

  const biodiversitySpecies = await ModelRepository.getInstance(sequelize).TaxonSpecies.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonDetectionGroupBySpecies).map(Number) } },
    raw: true
  })

  // Group new selected arbimon detections
  for (const dts of arbimonDetectionGroupByDateHourSiteSpecies) {
    const timePrecisionHourLocal = new Date(new Date(dts[0].date).getTime() + dts[0].hour * 60 * 60 * 1000)
    const locationSiteId = biodiversitySites.find(site => site.idArbimon === dts[0].siteId)?.id
    const taxonSpeciesId = biodiversitySpecies.find(species => species.idArbimon === dts[0].speciesId)?.id
    // Find existing detections in the bio db
    const biodiversityDetection = await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.findOne({
      where: {
        timePrecisionHourLocal,
        locationSiteId,
        taxonSpeciesId
      },
      raw: true
    })

    if (biodiversityDetection === null) {
      // detections to insert (only validated detections)
      const filteredArbimonDetectionsByValidation = dts.filter(dt => !isNotValidated(dt))
      if (filteredArbimonDetectionsByValidation.length) {
        const site = biodiversitySites.find(site => site.idArbimon === dts[0].siteId)

        // filter repeating recordings datetime to avoid inserting duplicate of
        // recordings data: durationMinutes and detectionMinutes
        const recordingData = filterRepeatingDetectionMinutes(filteredArbimonDetectionsByValidation)

        const newDetectionMinutes = getDetectionMinutes(recordingData.detectionMinutes)
        const newDurationMinutes = recordingData.durationMinutes / 60

        itemsToInsertOrUpsert.push({
          timePrecisionHourLocal,
          locationProjectId: site?.locationProjectId ?? -1,
          locationSiteId: site?.id ?? -1,
          taxonSpeciesId: taxonSpeciesId ?? -1,
          taxonClassId: biodiversitySpecies.find(species => species.idArbimon === dts[0].speciesId)?.taxonClassId ?? -1,
          count: filteredArbimonDetectionsByValidation.length, // 1 - count of detection in the group
          durationMinutes: newDurationMinutes, // 3 - duration of recordings datetime minutes, related to this group by site/species/date/hour
          detectionMinutes: newDetectionMinutes // '10,25,55' - array of recordings datetime minutes (values), related to this group by site/species/date/hour
        })
      }
    } else if (biodiversityDetection?.detectionMinutes) {
      // detections to upsert
      const count = biodiversityDetection.count
      const detectionMinutes = biodiversityDetection.detectionMinutes?.split(',')
      const durationMinutes = biodiversityDetection.durationMinutes
      const detectionCountMinutes = {
        count,
        detectionMinutes,
        durationMinutes
      }
      dts.forEach(dt => {
        const dtMinutes = dayjs(dt.datetime).minute().toString()

        // filter repeating recordings detectionMinutes to avoid inserting duplicate of it
        const existing = detectionCountMinutes?.detectionMinutes.includes(dtMinutes)

        // If new detection exists and validated -> do nothing
        // If new detection does not exist and not validated -> do nothing
        // If new detection exists and not validated -> remove it
        // If new detection do not exist and validated -> add it
        if (existing && !isNotValidated(dt)) return
        if (!existing && isNotValidated(dt)) return
        if (existing && isNotValidated(dt)) {
          detectionCountMinutes.count = detectionCountMinutes.count - 1
          const index = detectionCountMinutes.detectionMinutes.findIndex(min => min === dtMinutes)
          detectionCountMinutes.detectionMinutes.splice(index, 1)
          detectionCountMinutes.durationMinutes = detectionCountMinutes.durationMinutes - dt.recordingDuration / 60
        }
        if (!existing && !isNotValidated(dt)) {
          detectionCountMinutes.count = detectionCountMinutes.count + 1
          detectionCountMinutes.detectionMinutes.push(dtMinutes)
          detectionCountMinutes.durationMinutes = detectionCountMinutes.durationMinutes + (dt.recordingDuration / 60)
        }
      })

      const upsertObj = {
        timePrecisionHourLocal: biodiversityDetection.timePrecisionHourLocal,
        locationSiteId: biodiversityDetection.locationSiteId,
        taxonSpeciesId: biodiversityDetection.taxonSpeciesId,
        locationProjectId: biodiversityDetection.locationProjectId,
        taxonClassId: biodiversityDetection.taxonClassId,
        durationMinutes: detectionCountMinutes.durationMinutes,
        count: detectionCountMinutes.count,
        detectionMinutes: detectionCountMinutes.detectionMinutes.join(',')
      }

      if (detectionCountMinutes.count === 0) itemsToDelete.push(upsertObj)
      else itemsToInsertOrUpsert.push(upsertObj)
    }
  }

  return [itemsToInsertOrUpsert, itemsToDelete]
}
