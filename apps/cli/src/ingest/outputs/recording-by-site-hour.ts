import type { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_RECORDING_BY_SITE_HOUR } from '@rfcx-bio/common/dao/models/recording-by-site-hour-model'
import type { RecordingBySiteHour, SyncError } from '@rfcx-bio/common/dao/types'

import { literalIntegerArray2D, reducedAndSortedPairs } from '@/db/seeders/_helpers/sequelize-literal-integer-array-2d'
import type { RecordingArbimon, RecordingBySiteHourBio, RecordingDeletedArbimon } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'
import { mapRecordingBySiteHourArbimonWithBioFk, transformDeletedRecordingToBio } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'

export const writeRecordingBySiteHourToBio = async (recordingsBySiteHourArbimon: RecordingArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[RecordingBySiteHourBio[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  // convert to bio db
  const recordingsBySiteHourBio = await mapRecordingBySiteHourArbimonWithBioFk(recordingsBySiteHourArbimon, sequelize)

  // loop upsert
  const successToInsertItems: RecordingBySiteHourBio[] = []
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []

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

export const deleteRecordingFromBio = async (recordings: RecordingDeletedArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[RecordingBySiteHour[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const [itemsToUpsert, itemsToReset] = await Promise.all(await transformDeletedRecordingToBio(recordings, sequelize))

  // Reset deleted recordigs by site spesies hour
  await deleteRecordings(itemsToReset, sequelize, transaction)
  try {
    // Upsert updated items
    if (itemsToUpsert.length) {
      const rows = itemsToUpsert.map(group => {
        return { ...group, countsByMinute: literalIntegerArray2D(reducedAndSortedPairs(group.countsByMinute), sequelize) }
      })
      // @ts-expect-error: countsByMinute in rows has incompatible type
      await ModelRepository.getInstance(sequelize).RecordingBySiteHour.bulkCreate(rows, {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_RECORDING_BY_SITE_HOUR,
        ...transaction && { transaction }
      })
    }
    return [itemsToUpsert, []]
  } catch (err) {
    const errorMessage = (err instanceof Error) ? err.message : ''
    console.info('⚠️ Batch upsert `recording by site hour` failed...', errorMessage, err)
    let failedToDeleteItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
    failedToDeleteItems = itemsToUpsert.map(recording => {
      return {
        externalId: `${recording.timePrecisionHourLocal.toString()}|${recording.locationSiteId}`,
        error: `DeleteError: ${errorMessage}`
      }
    })
    return [[], failedToDeleteItems]
  }
}

const deleteRecordings = async (recordings: RecordingBySiteHour[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  if (!recordings.length) return
  try {
    for (const r of recordings) {
      const numberOfDeletedRows = await ModelRepository
        .getInstance(sequelize)
        .RecordingBySiteHour
        .destroy({
          where: {
            timePrecisionHourLocal: r.timePrecisionHourLocal,
            locationSiteId: r.locationSiteId
          },
          transaction
        })
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.info(`> ${numberOfDeletedRows} recordings reset successfully for time ${r.timePrecisionHourLocal}, site ${r.locationSiteId}`)
    }
  } catch (err) {
    // TODO: Inform about the issue to the bio dev slack channel?
    console.error('> Error when deleting recordings', recordings, err as Error)
  }
}
