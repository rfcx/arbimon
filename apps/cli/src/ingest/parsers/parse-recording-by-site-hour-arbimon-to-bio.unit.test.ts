import { describe, expect, test } from 'vitest'

import { parseRecordingBySiteHourToBio, parseRecordingDeleted } from './parse-recording-by-site-hour-arbimon-to-bio'

describe('ingest > parser > parseRecordingBySiteHourToBio', () => {
  const VALID_RECORDING = {
    siteIdArbimon: 123,
    datetime: '2022-07-06 07:00:00',
    duration: 60.25,
    idArbimon: 1001,
    updatedAt: '2022-07-06 16:00:00'
  }

  const VALID_RECORDING_DELETED = {
    siteIdArbimon: 123,
    datetime: '2022-07-06 07:00:00',
    duration: 60.25,
    idArbimon: 1001,
    deletedAt: '2022-07-06 16:00:00'
  }

  test('succeeds for valid data', async () => {
    // Act
    const actual = parseRecordingBySiteHourToBio(VALID_RECORDING)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fails if required props are missing', async () => {
    // Arrange
    const { siteIdArbimon, ...missingSiteIdArbimon } = VALID_RECORDING
    const { datetime, ...missingDatetime } = VALID_RECORDING
    const { duration, ...missingDuration } = VALID_RECORDING
    const { idArbimon, ...missingRecordingId } = VALID_RECORDING
    const { updatedAt, ...missingUploadTime } = VALID_RECORDING

    // Act
    const actualMissing = [
      parseRecordingBySiteHourToBio(missingSiteIdArbimon),
      parseRecordingBySiteHourToBio(missingDatetime),
      parseRecordingBySiteHourToBio(missingDuration),
      parseRecordingBySiteHourToBio(missingRecordingId),
      parseRecordingBySiteHourToBio(missingUploadTime)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if non-nullish props are nullish', async () => {
    // Arrange
    const nullSiteIdArbimon = { ...VALID_RECORDING, siteIdArbimon: null }
    const nullDatetime = { ...VALID_RECORDING, datetime: null }
    const nullDuration = { ...VALID_RECORDING, duration: null }
    const nullRecordingId = { ...VALID_RECORDING, idArbimon: null }
    const nullUploadTime = { ...VALID_RECORDING, updatedAt: null }

    const undefinedSiteIdArbimon = { ...VALID_RECORDING, siteIdArbimon: undefined }
    const undefinedDatetime = { ...VALID_RECORDING, datetime: undefined }
    const undefinedDuration = { ...VALID_RECORDING, duration: undefined }
    const undefinedRecordingId = { ...VALID_RECORDING, idArbimon: undefined }
    const undefinedUploadTime = { ...VALID_RECORDING, updatedAt: undefined }

    // Act
    const actualMissing = [
      parseRecordingBySiteHourToBio(nullSiteIdArbimon),
      parseRecordingBySiteHourToBio(nullDatetime),
      parseRecordingBySiteHourToBio(nullDuration),
      parseRecordingBySiteHourToBio(nullRecordingId),
      parseRecordingBySiteHourToBio(nullUploadTime),
      parseRecordingBySiteHourToBio(undefinedSiteIdArbimon),
      parseRecordingBySiteHourToBio(undefinedDatetime),
      parseRecordingBySiteHourToBio(undefinedDuration),
      parseRecordingBySiteHourToBio(undefinedRecordingId),
      parseRecordingBySiteHourToBio(undefinedUploadTime)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('succeeds for valid deleted recording', async () => {
    // Act
    const actual = parseRecordingDeleted(VALID_RECORDING_DELETED)

    // Assert
    expect(actual.success).toBe(true)
  })
})
