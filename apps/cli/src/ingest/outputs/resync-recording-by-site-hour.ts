import { ceil, groupBy, max, min, sum } from 'lodash-es'
import { type Sequelize, type Transaction, Op } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_RECORDING_BY_SITE_HOUR } from '@rfcx-bio/common/dao/models/recording-by-site-hour-model'
import type { SyncError } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { literalIntegerArray2D, reducedAndSortedPairs } from '@/db/seeders/_helpers/sequelize-literal-integer-array-2d'
import { filterRepeatingDetectionMinutes } from '../parsers/parse-array'
import type { RecordingArbimon, RecordingBySiteHourBio } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'

type ItemsToInsertOrUpsert = Record<string, RecordingBySiteHourBio>

const itemsToInsertOrUpsert: ItemsToInsertOrUpsert = {}

/**
 * Convert datetime to the local recording time
 * @param datetime string of date e.g. 2020-12-06 10:00:00
 * @returns dayjs.utc and +00
 */
const getTimePrecisionHourLocal = (datetime: string): string => {
  return dayjs.utc(datetime).format('YYYY-MM-DD HH:00:00+00')
}

export const writeRecordingBySiteHourToBio = async (recordingsBySiteHourBio: RecordingBySiteHourBio[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[RecordingBySiteHourBio[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  // loop upsert
  const successToInsertItems: RecordingBySiteHourBio[] = []
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  console.info('- syncArbimonRecordingBySiteHourBatch: rows to insert ', recordingsBySiteHourBio.length)
  for (const recording of recordingsBySiteHourBio) {
    try {
      const newRecording = { ...recording, countsByMinute: literalIntegerArray2D(reducedAndSortedPairs(recording.countsByMinute), sequelize) }
      // @ts-expect-error: countsByMinute in rows has incompatible type
      await ModelRepository.getInstance(sequelize).RecordingBySiteHour.upsert(newRecording, {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_RECORDING_BY_SITE_HOUR,
        ...transaction && { transaction }
      })
      // @ts-expect-error: countsByMinute in rows has incompatible type
      successToInsertItems.push(newRecording)
    } catch (e: any) {
      console.error('⚠️ Insert recording by site hour failed...', e)
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store insert errors
      failedToInsertItems.push({
        externalId: `${recording.lastUploaded.toString()}|${recording.locationSiteId}|${recording.firstRecordingIdArbimon}|${recording.lastRecordingIdArbimon}`,
        error: `InsertError: ${errorMessage}`
      })
    }
  }
  return [successToInsertItems, failedToInsertItems]
}

export const mapRecordingBySiteHourArbimonWithPrevSync = async (recordingArbimon: RecordingArbimon[], sequelize: Sequelize): Promise<RecordingBySiteHourBio[]> => {
  // return previosly collected itemsToInsertOrUpsert if there is not new recordingArbimon
  if (!recordingArbimon.length) return Object.values(itemsToInsertOrUpsert)

  // group arbimon recordings by date, hour, site
  const arbimonRecordingBySiteHourGroupBySites = groupBy(recordingArbimon, 'siteIdArbimon')
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

    // find existing recordings in the itemsToInsertOrUpsert object
    const label = `${locationSiteId}_${timePrecisionHourLocal}`
    const isNewRecording = itemsToInsertOrUpsert[label] === undefined
    const totalDuration = isNewRecording
      ? sum(group.map(item => item.duration)) / 60
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      : itemsToInsertOrUpsert[label].totalDurationInMinutes + (sum(group.map(item => item.duration)) / 60)
    // create a correct countsByMinute array (number[][]) for a new recording
    const recordingData = filterRepeatingDetectionMinutes(group)
    const countsByMinute = isNewRecording ? recordingData.countsByMinute : itemsToInsertOrUpsert[label].countsByMinute

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

    itemsToInsertOrUpsert[label] = {
      timePrecisionHourLocal,
      locationProjectId: locationSite?.locationProjectId ?? -1,
      locationSiteId: locationSite?.id ?? -1,
      totalDurationInMinutes: ceil(totalDuration, 2), // 3.20 - total recordings duration in minutes in the group
      countsByMinute, // [[2,1], [4,1], [6,1]] - recording minutes in the group
      count: countsByMinute.length, // 3 - length
      firstRecordingIdArbimon: min(group.map(item => item.idArbimon)) ?? group[0].idArbimon,
      lastRecordingIdArbimon: max(group.map(item => item.idArbimon)) ?? group[group.length - 1].idArbimon,
      lastUploaded: max(group.map(item => item.datetime)) ?? group[group.length - 1].datetime
    }
  }
  return Object.values(itemsToInsertOrUpsert)
}
