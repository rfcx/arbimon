import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncError } from '@rfcx-bio/common/dao/types'

import { RecordingBySiteHourBio } from '../parsers/parse-recording-by-site-hour-arbimon-to-bio'

export const writeRecordingBySiteHourToBio = async (recordingsBySiteHour: RecordingBySiteHourBio[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[RecordingBySiteHourBio[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  // loop upsert
  const successToInsertItems: RecordingBySiteHourBio[] = []
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []

  for (const recording of recordingsBySiteHour) {
    try {
      const existRecording = await ModelRepository.getInstance(sequelize).RecordingBySiteHour.findOne({
        where: {
          timePrecisionHourLocal: recording.timePrecisionHourLocal,
          locationProjectId: recording.locationProjectId,
          locationSiteId: recording.locationSiteId
        },
        raw: true
      })
      const newRecording = existRecording ? { ...recording, recordedMinutes: [...recording.recordedMinutes, ...existRecording.recordedMinutes] } : recording
      await ModelRepository.getInstance(sequelize).RecordingBySiteHour.upsert(newRecording)
      successToInsertItems.push(newRecording)
    } catch (e: any) {
      console.error('⚠️ Insert recording by site hour failed...')
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store insert errors
      failedToInsertItems.push({
        externalId: `${recording.lastUploaded.toString()}-${recording.locationSiteId}-${recording.firstRecordingIdArbimon}-${recording.lastRecordingIdArbimon}`,
        error: `InsertError: ${errorMessage}`
      })
    }
  }
  return [successToInsertItems, failedToInsertItems]
}
