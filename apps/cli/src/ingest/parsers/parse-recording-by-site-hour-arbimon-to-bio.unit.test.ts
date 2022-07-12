import { describe, expect, test } from 'vitest'

import { parseRecordingBySiteHourToBio } from './parse-recording-by-site-hour-arbimon-to-bio'

describe('ingest > parser > parseRecordingBySiteHourToBio', () => {
  const VALID_RECORDING_BY_SITE_HOUR = {
    projectIdArbimon: 1,
    siteIdArbimon: 123,
    timePrecisionHourLocal: '2022-07-06 07:00:00',
    totalDuration: 60.25,
    recordedMinutes: '5,10',
    firstRecordingIdArbimon: 222,
    lastRecordingIdArbimon: 223,
    lastUploaded: '2022-07-06 16:00:00'
  }

  test('succeeds for valid data', async () => {
    // Act
    const actual = parseRecordingBySiteHourToBio(VALID_RECORDING_BY_SITE_HOUR)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fails if required props are missing', async () => {
    // Arrange
    const { projectIdArbimon, ...missingProjectIdArbimon } = VALID_RECORDING_BY_SITE_HOUR
    const { siteIdArbimon, ...missingSiteIdArbimon } = VALID_RECORDING_BY_SITE_HOUR
    const { timePrecisionHourLocal, ...missingTimePrecisionHourLocal } = VALID_RECORDING_BY_SITE_HOUR
    const { totalDuration, ...missingTotalDuration } = VALID_RECORDING_BY_SITE_HOUR
    const { recordedMinutes, ...missingRecordedMinutes } = VALID_RECORDING_BY_SITE_HOUR
    const { firstRecordingIdArbimon, ...missingFirstRecordingIdArbimon } = VALID_RECORDING_BY_SITE_HOUR
    const { lastRecordingIdArbimon, ...missingLastRecordingIdArbimon } = VALID_RECORDING_BY_SITE_HOUR
    const { lastUploaded, ...missingLastUploaded } = VALID_RECORDING_BY_SITE_HOUR

    // Act
    const actualMissing = [
      parseRecordingBySiteHourToBio(missingProjectIdArbimon),
      parseRecordingBySiteHourToBio(missingSiteIdArbimon),
      parseRecordingBySiteHourToBio(missingTimePrecisionHourLocal),
      parseRecordingBySiteHourToBio(missingTotalDuration),
      parseRecordingBySiteHourToBio(missingRecordedMinutes),
      parseRecordingBySiteHourToBio(missingFirstRecordingIdArbimon),
      parseRecordingBySiteHourToBio(missingLastRecordingIdArbimon),
      parseRecordingBySiteHourToBio(missingLastUploaded)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if non-nullish props are nullish', async () => {
    // Arrange
    const nullProjectIdArbimon = { ...VALID_RECORDING_BY_SITE_HOUR, projectIdArbimon: null }
    const nullSiteIdArbimon = { ...VALID_RECORDING_BY_SITE_HOUR, siteIdArbimon: null }
    const nullTimePrecisionHourLocal = { ...VALID_RECORDING_BY_SITE_HOUR, timePrecisionHourLocal: null }
    const nullTotalDuration = { ...VALID_RECORDING_BY_SITE_HOUR, totalDuration: null }
    const nullRecordedMinutes = { ...VALID_RECORDING_BY_SITE_HOUR, recordedMinutes: null }
    const nullFirstRecordingIdArbimon = { ...VALID_RECORDING_BY_SITE_HOUR, firstRecordingIdArbimon: null }
    const nullLastRecordingIdArbimon = { ...VALID_RECORDING_BY_SITE_HOUR, lastRecordingIdArbimon: null }
    const nullLastUploaded = { ...VALID_RECORDING_BY_SITE_HOUR, lastUploaded: null }

    const undefinedProjectIdArbimon = { ...VALID_RECORDING_BY_SITE_HOUR, projectIdArbimon: undefined }
    const undefinedSiteIdArbimon = { ...VALID_RECORDING_BY_SITE_HOUR, siteIdArbimon: undefined }
    const undefinedTimePrecisionHourLocal = { ...VALID_RECORDING_BY_SITE_HOUR, timePrecisionHourLocal: undefined }
    const undefinedTotalDuration = { ...VALID_RECORDING_BY_SITE_HOUR, totalDuration: undefined }
    const undefinedRecordedMinutes = { ...VALID_RECORDING_BY_SITE_HOUR, recordedMinutes: undefined }
    const undefinedFirstRecordingIdArbimon = { ...VALID_RECORDING_BY_SITE_HOUR, firstRecordingIdArbimon: undefined }
    const undefinedLastRecordingIdArbimon = { ...VALID_RECORDING_BY_SITE_HOUR, lastRecordingIdArbimon: undefined }
    const undefinedLastUploaded = { ...VALID_RECORDING_BY_SITE_HOUR, lastUploaded: undefined }

    // Act
    const actualMissing = [
      parseRecordingBySiteHourToBio(nullProjectIdArbimon),
      parseRecordingBySiteHourToBio(nullSiteIdArbimon),
      parseRecordingBySiteHourToBio(nullTimePrecisionHourLocal),
      parseRecordingBySiteHourToBio(nullTotalDuration),
      parseRecordingBySiteHourToBio(nullRecordedMinutes),
      parseRecordingBySiteHourToBio(nullFirstRecordingIdArbimon),
      parseRecordingBySiteHourToBio(nullLastRecordingIdArbimon),
      parseRecordingBySiteHourToBio(nullLastUploaded),
      parseRecordingBySiteHourToBio(undefinedProjectIdArbimon),
      parseRecordingBySiteHourToBio(undefinedSiteIdArbimon),
      parseRecordingBySiteHourToBio(undefinedTimePrecisionHourLocal),
      parseRecordingBySiteHourToBio(undefinedTotalDuration),
      parseRecordingBySiteHourToBio(undefinedRecordedMinutes),
      parseRecordingBySiteHourToBio(undefinedFirstRecordingIdArbimon),
      parseRecordingBySiteHourToBio(undefinedLastRecordingIdArbimon),
      parseRecordingBySiteHourToBio(undefinedLastUploaded)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })
})
