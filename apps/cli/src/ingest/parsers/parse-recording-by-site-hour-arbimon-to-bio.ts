import { ceil, groupBy, max, min, sum } from 'lodash-es'
import { type Sequelize, Op } from 'sequelize'
import { type SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type RecordingBySiteHour, type Site } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { filterRepeatingDetectionMinutes } from './parse-array'

const RecordingArbimonSchema = z.object({
  siteIdArbimon: z.number(),
  datetime: z.string(),
  duration: z.number(),
  idArbimon: z.number(),
  updatedAt: z.string()
})

const RecordingDeletedArbimonSchema = z.object({
  idArbimon: z.number(),
  siteIdArbimon: z.number(),
  datetime: z.string(),
  duration: z.number(),
  deletedAt: z.string()
})

const RecordingBySiteHourBioSchema = z.object({
  timePrecisionHourLocal: z.string(),
  locationProjectId: z.number(),
  locationSiteId: z.number(),
  totalDurationInMinutes: z.number(),
  countsByMinute: z.array(z.array(z.number())),
  count: z.number(),
  firstRecordingIdArbimon: z.number(), // to catch error recording id in a sync data
  lastRecordingIdArbimon: z.number(), // to catch error recording id in a sync data
  lastUploaded: z.string() // to catch error recording id in a sync data
})

export type RecordingArbimon = z.infer<typeof RecordingArbimonSchema>
export type RecordingDeletedArbimon = z.infer<typeof RecordingDeletedArbimonSchema>
export type RecordingBySiteHourBio = z.infer<typeof RecordingBySiteHourBioSchema>

export const parseRecordingBySiteHourToBio = (recordingBySiteHourArbimon: unknown): SafeParseReturnType<unknown, RecordingArbimon> =>
  RecordingArbimonSchema.safeParse(recordingBySiteHourArbimon)

export const parseRecordingDeleted = (recordingDeletedArbimon: unknown): SafeParseReturnType<unknown, RecordingDeletedArbimon> =>
  RecordingDeletedArbimonSchema.safeParse(recordingDeletedArbimon)

/**
 * Convert datetime to the local recording time
 * @param datetime string of date e.g. 2020-12-06 10:00:00
 * @returns dayjs.utc and +00
 */
const getTimePrecisionHourLocal = (datetime: string): string => {
  return dayjs.utc(datetime).format('YYYY-MM-DD HH:00:00+00')
}

export const mapRecordingBySiteHourArbimonWithBioFk = async (recordingArbimon: RecordingArbimon[], sequelize: Sequelize): Promise<RecordingBySiteHourBio[]> => {
  const itemsToInsertOrUpsert: RecordingBySiteHourBio[] = []
  const arbimonRecordingBySiteHourGroupBySites = groupBy(recordingArbimon, 'siteIdArbimon')

  // group arbimon recordings by date, hour, site
  const arbimonRecordingBySiteHourGroup = Object.values(groupBy(recordingArbimon, r => `${getTimePrecisionHourLocal(r.datetime)}-${r.siteIdArbimon}`))
  const biodiversitySites = await ModelRepository.getInstance(sequelize).LocationSite.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonRecordingBySiteHourGroupBySites).map(Number) } },
    raw: true
  })

  // group recordings
  for (const group of arbimonRecordingBySiteHourGroup) {
    const timePrecisionHourLocal = getTimePrecisionHourLocal(group[0].datetime)
    const locationSite = biodiversitySites.find(site => site.idArbimon === group[0].siteIdArbimon)
    const locationSiteId = locationSite?.id
    if (locationSiteId === undefined) {
      // skip recordings with haven't synced site (validation issue)
      continue
    }
    // find existing recordings in the bio db
    const bioRecordingBySiteHour = await ModelRepository.getInstance(sequelize).RecordingBySiteHour.findOne({
      where: { timePrecisionHourLocal, locationSiteId },
      raw: true
    }) as unknown as RecordingBySiteHourBio

    const isNewRecording = bioRecordingBySiteHour === null

    const totalDuration = isNewRecording
      ? sum(group.map(item => item.duration)) / 60
      : bioRecordingBySiteHour.totalDurationInMinutes + sum(group.map(item => item.duration)) / 60

    // create a correct countsByMinute array (number[][]) for a new recording
    const recordingData = filterRepeatingDetectionMinutes(group)

    const countsByMinute = isNewRecording ? recordingData.countsByMinute : bioRecordingBySiteHour.countsByMinute

    if (!isNewRecording) {
      group.forEach(dt => {
        const dtMinutes = dayjs(dt.datetime).minute()
        const existingIndex = countsByMinute.findIndex(pair => pair[0] === dtMinutes)
        const existing = existingIndex > -1

        // if a new recording exists -> increase the recording count in the existing array
        // why do we get this recording again?
        // 1. there are several site's recordings with the same datetime
        if (existing) {
          countsByMinute[existingIndex][1] = countsByMinute[existingIndex][1] + 1
        } else {
          // if new recording does not exist -> add it
          countsByMinute.push([dtMinutes, 1])
        }
      })
    }

    itemsToInsertOrUpsert.push({
      timePrecisionHourLocal,
      locationProjectId: locationSite?.locationProjectId ?? -1,
      locationSiteId: locationSite?.id ?? -1,
      totalDurationInMinutes: ceil(totalDuration, 2), // 3.20 - total recordings duration in minutes in the group
      countsByMinute, // [[2,1], [4,1], [6,1]] - recording minutes in the group
      count: countsByMinute.length, // 3 - length
      firstRecordingIdArbimon: min(group.map(item => item.idArbimon)) ?? group[0].idArbimon,
      lastRecordingIdArbimon: max(group.map(item => item.idArbimon)) ?? group[group.length - 1].idArbimon,
      lastUploaded: max(group.map(item => item.datetime)) ?? group[group.length - 1].datetime
    })
  }
  return itemsToInsertOrUpsert
}

export const transformDeletedRecordingToBio = async (recordingDeletedArbimon: RecordingDeletedArbimon[], sequelize: Sequelize): Promise<RecordingBySiteHour[][]> => {
  const itemsToUpsert: RecordingBySiteHour[] = []
  const itemsToDelete: RecordingBySiteHour[] = []

  const arbimonRecordingBySiteHourGroupBySites = groupBy(recordingDeletedArbimon, 'siteIdArbimon')
  // group arbimon recordings by date, hour, site
  const arbimonRecordingBySiteHourGroup = Object.values(groupBy(recordingDeletedArbimon, r => `${getTimePrecisionHourLocal(r.datetime)}-${r.siteIdArbimon}`))
  const biodiversitySites = await ModelRepository.getInstance(sequelize).LocationSite.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonRecordingBySiteHourGroupBySites).map(Number) } },
    raw: true
  }) as Site[]
  // process each group of deleted recordings
  for (const group of arbimonRecordingBySiteHourGroup) {
    const timePrecisionHourLocal = getTimePrecisionHourLocal(group[0].datetime)
    const locationSite = biodiversitySites.find(site => site.idArbimon === group[0].siteIdArbimon)
    const locationSiteId = locationSite?.id
    if (locationSiteId === undefined) {
      // skip recordings with haven't synced site (validation issue)
      continue
    }
    // find existing recordings in the bio db
    const bioRecordingBySiteHour = await ModelRepository.getInstance(sequelize).RecordingBySiteHour.findOne({
      where: { timePrecisionHourLocal, locationSiteId },
      raw: true
    }) as unknown as RecordingBySiteHourBio

    const isExist = bioRecordingBySiteHour !== null

    if (isExist) {
      const totalDuration = bioRecordingBySiteHour.totalDurationInMinutes - sum(group.map(item => item.duration)) / 60
      const countsByMinute = bioRecordingBySiteHour.countsByMinute

      group.forEach(dt => {
        const dtMinutes = dayjs(dt.datetime).minute()
        const existingIndex = countsByMinute.findIndex(pair => pair[0] === dtMinutes)
        const existing = existingIndex > -1

        // if recording exists -> decrease the recording count in the existing array
        if (existing) {
          const reducedValue = countsByMinute[existingIndex][1] - 1
          countsByMinute[existingIndex][1] = reducedValue <= 0 ? 0 : reducedValue
        }
      })

      // Keep the recordings with count is not equal `0` in the countsByMinute: [[6, 0], [30, 1]] => [[30, 1]]
      const filteredRecordings = countsByMinute.filter(group => group[1] !== 0)

      const upsertOrDeleteGroup = {
        timePrecisionHourLocal: dayjs.utc(timePrecisionHourLocal).toDate(),
        locationProjectId: locationSite?.locationProjectId ?? -1,
        locationSiteId: locationSite?.id ?? -1,
        totalDurationInMinutes: totalDuration < 0 ? 0 : ceil(totalDuration, 2), // 3.20 - total recordings duration in minutes in the group
        countsByMinute: filteredRecordings, // [[2,1], [4,1], [6,1]] - recording minutes in the group
        count: filteredRecordings.length // 3 - length
      }

      // If a recording count is `0` in the countsByMinute -> remove this recording
      const isDeletedRecording = upsertOrDeleteGroup.count === 0

      if (isDeletedRecording) itemsToDelete.push(upsertOrDeleteGroup)
      else itemsToUpsert.push(upsertOrDeleteGroup)
    }
  }

  return [itemsToUpsert, itemsToDelete]
}
