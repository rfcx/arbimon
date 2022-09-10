import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncError } from '@rfcx-bio/common/dao/types'

import { literalIntegerArray2D, reducedAndSortedPairs } from '@/db/seeders/_helpers/sequelize-literal-integer-array-2d'
import { mapRecordingBySiteHourArbimonWithBioFk, RecordingArbimon, RecordingBySiteHourBio } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'

export const writeRecordingBySiteHourToBio = async (recordingsBySiteHourArbimon: RecordingArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[RecordingBySiteHourBio[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  // convert to bio db
  const recordingsBySiteHourBio = await mapRecordingBySiteHourArbimonWithBioFk(recordingsBySiteHourArbimon, sequelize)

  // loop upsert
  const successToInsertItems: RecordingBySiteHourBio[] = []
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []

  for (const recording of recordingsBySiteHourBio) {
    try {
      const newRecording = { ...recording, countsByMinute: literalIntegerArray2D(reducedAndSortedPairs(recording.countsByMinute), sequelize) }
      // @ts-expect-error
      await ModelRepository.getInstance(sequelize).RecordingBySiteHour.upsert(newRecording, {
        ...transaction && { transaction }
      })
      // @ts-expect-error
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
