import { ceil, groupBy, max, min, sum } from 'lodash-es'
import { Op, Sequelize } from 'sequelize'
import { SafeParseReturnType, z } from 'zod'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { filterRepeatingDetectionMinutes } from './parse-array'

const RecordingArbimonSchema = z.object({
  projectIdArbimon: z.number(),
  siteIdArbimon: z.number(),
  datetime: z.string(),
  duration: z.number(),
  idArbimon: z.number(),
  updatedAt: z.string()
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
export type RecordingBySiteHourBio = z.infer<typeof RecordingBySiteHourBioSchema>

export const parseRecordingBySiteHourToBio = (recordingBySiteHourArbimon: unknown): SafeParseReturnType<unknown, RecordingArbimon> =>
  RecordingArbimonSchema.safeParse(recordingBySiteHourArbimon)

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

  // group arbimon recordings by date, hour,site, species
  const arbimonRecordingBySiteHourGroup = Object.values(groupBy(recordingArbimon, r => `${getTimePrecisionHourLocal(r.datetime)}-${r.siteIdArbimon}`))
  const biodiversitySites = await ModelRepository.getInstance(sequelize).LocationSite.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonRecordingBySiteHourGroupBySites).map(Number) } },
    raw: true
  })

  // group recordings
  for (const group of arbimonRecordingBySiteHourGroup) {
    const timePrecisionHourLocal = getTimePrecisionHourLocal(group[0].datetime)
    const locationSiteId = biodiversitySites.find(site => site.idArbimon === group[0].siteIdArbimon)?.id

    // Skip recordings with haven't synced site (validation issue)
    if (locationSiteId !== undefined) {
      const locationSite = biodiversitySites.find(site => site.idArbimon === group[0].siteIdArbimon)

      const bioRecordingBySiteHour = await ModelRepository.getInstance(sequelize).RecordingBySiteHour.findOne({
        where: {
          timePrecisionHourLocal,
          locationSiteId
        },
        raw: true
      }) as unknown as RecordingBySiteHourBio

      const isNewRecording = bioRecordingBySiteHour === null

      const totalDuration = isNewRecording ? sum(group.map(item => item.duration)) / 60 : bioRecordingBySiteHour.totalDurationInMinutes + sum(group.map(item => item.duration)) / 60

      const recordingData = filterRepeatingDetectionMinutes(group)

      itemsToInsertOrUpsert.push({
        timePrecisionHourLocal,
        locationProjectId: locationSite?.locationProjectId ?? -1,
        locationSiteId: locationSite?.id ?? -1,
        totalDurationInMinutes: ceil(totalDuration, 2), // 3.20 - total recordings duration in minutes in the group
        countsByMinute: recordingData.countsByMinute, // [[2,1], [4,1], [6,1]] - recording minutes in the group
        count: recordingData.countsByMinute.length, // 3 - length
        firstRecordingIdArbimon: min(group.map(item => item.idArbimon)) ?? group[0].idArbimon,
        lastRecordingIdArbimon: max(group.map(item => item.idArbimon)) ?? group[group.length - 1].idArbimon,
        lastUploaded: max(group.map(item => item.datetime)) ?? group[group.length - 1].datetime
      })
    }
  }
  return itemsToInsertOrUpsert
}
