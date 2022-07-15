import { beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { writeRecordingBySiteHourToBio } from './recording-by-site-hour'

const biodiversitySequelize = await getSequelize()

describe('ingest > output > recording by site hour', () => {
  beforeEach(async () => {
    await biodiversitySequelize.query('DELETE FROM recording_by_site_hour')
  })
  test('can write new recording by site hour', async () => {
    // Arrange
    const INPUTS = [
      {
        locationProjectId: 1,
        locationSiteId: 123,
        timePrecisionHourLocal: '2022-07-06 07:00:00',
        totalDurationInMinutes: 60.25,
        recordedMinutes: [5, 10],
        firstRecordingIdArbimon: 222,
        lastRecordingIdArbimon: 223,
        lastUploaded: '2022-07-06 16:00:00'
      },
      {
        locationProjectId: 1,
        locationSiteId: 123,
        timePrecisionHourLocal: '2022-07-06 08:00:00',
        totalDurationInMinutes: 180.5,
        recordedMinutes: [15, 20],
        firstRecordingIdArbimon: 224,
        lastRecordingIdArbimon: 225,
        lastUploaded: '2022-07-06 17:00:00'
      }
    ]

    // Act
    await writeRecordingBySiteHourToBio(INPUTS, biodiversitySequelize)

    // Assert
    const recordingBySiteHour = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.findAll()
    expect(recordingBySiteHour.length).toBe(INPUTS.length)
  })

  test('update recorded minutes if location project, location site, and time precision hour local are the same', async () => {
    // Arrange
    const OLD_RECORD = {
      locationProjectId: 1,
      locationSiteId: 123,
      timePrecisionHourLocal: '2022-07-06 07:00:00',
      totalDurationInMinutes: 60.25,
      recordedMinutes: [5, 10],
      firstRecordingIdArbimon: 222,
      lastRecordingIdArbimon: 223,
      lastUploaded: '2022-07-06 16:00:00'
    }

    const NEW_RECORD = {
      locationProjectId: 1,
      locationSiteId: 123,
      timePrecisionHourLocal: '2022-07-06 07:00:00',
      totalDurationInMinutes: 60.25,
      recordedMinutes: [20, 30],
      firstRecordingIdArbimon: 224,
      lastRecordingIdArbimon: 225,
      lastUploaded: '2022-07-06 16:00:00'
    }

    // Act
    await writeRecordingBySiteHourToBio([OLD_RECORD], biodiversitySequelize)
    await writeRecordingBySiteHourToBio([NEW_RECORD], biodiversitySequelize)
    const recordingBySiteHour = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.findAll({ raw: true })
    expect(recordingBySiteHour.length).toBe(1)
    expect(recordingBySiteHour[0].recordedMinutes).toEqual([5, 10, 20, 30])
  })
})
