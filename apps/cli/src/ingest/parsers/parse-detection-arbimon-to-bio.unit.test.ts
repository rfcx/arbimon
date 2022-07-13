import { describe, expect, test } from 'vitest'

import { parseDetectionArbimonToBio } from './parse-detection-arbimon-to-bio'

describe('ingest > parsers > parseDetectionArbimonToBio', () => {
  const VALID_DETECTION = {
    projectId: 1920,
    date: '2020-12-06',
    hour: '10',
    siteId: 88528,
    speciesId: 74,
    detectionCount: 1,
    detectionMinutes: '06',
    detectionId: '2391042',
    updatedAt: '2022-07-13 21:24:52'
  }

  test('succeeds for valid detection data', async () => {
    // Act
    const actual = parseDetectionArbimonToBio(VALID_DETECTION)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fail for not valid detection data', async () => {
    // Act
    const res = [
      parseDetectionArbimonToBio({ ...VALID_DETECTION, detectionId: 25 }),
      parseDetectionArbimonToBio({ ...VALID_DETECTION, detectionMinutes: 6 }),
      parseDetectionArbimonToBio({ ...VALID_DETECTION, detectionCount: undefined }),
      parseDetectionArbimonToBio({ ...VALID_DETECTION, speciesId: '12345' }),
      parseDetectionArbimonToBio({ ...VALID_DETECTION, hour: 12 }),
      parseDetectionArbimonToBio({ ...VALID_DETECTION, date: new Date('2022-03-22') })
    ]
    // Assert
    res.forEach(r => expect(r.success).toBe(false))
  })

  test('fails if required props are missing', async () => {
    // Arrange
    const { date, ...missingDate } = VALID_DETECTION
    const { detectionMinutes, ...missingDetectionMinutes } = VALID_DETECTION
    const { detectionCount, ...missingDetectionCount } = VALID_DETECTION

    // Act
    const actualMissing = [
      parseDetectionArbimonToBio(missingDate),
      parseDetectionArbimonToBio(missingDetectionMinutes),
      parseDetectionArbimonToBio(missingDetectionCount)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if non-nullish props are nullish', async () => {
    // Arrange
    const nullDate = { ...VALID_DETECTION, date: null }
    const nullDetectionCount = { ...VALID_DETECTION, detectionCount: null }

    const undefinedDate = { ...VALID_DETECTION, date: undefined }
    const undefinedDetectionCount = { ...VALID_DETECTION, detectionCount: undefined }

    // Act
    const actualMissing = [
      parseDetectionArbimonToBio(nullDate),
      parseDetectionArbimonToBio(nullDetectionCount),
      parseDetectionArbimonToBio(undefinedDate),
      parseDetectionArbimonToBio(undefinedDetectionCount)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })
})
