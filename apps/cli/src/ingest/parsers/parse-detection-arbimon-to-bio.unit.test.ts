import { describe, expect, test } from 'vitest'

import { parseDetectionArbimonToBio } from './parse-detection-arbimon-to-bio'

describe('ingest > parsers > parseDetectionArbimonToBio', () => {
  const VALID_DETECTION = {
    idArbimon: 2391043,
    datetime: '2020-12-06 10:06:19',
    date: '2020-12-06',
    hour: '10',
    siteId: 88529,
    recordingDuration: 90.24,
    speciesId: 3842,
    present: 1,
    presentReview: 2,
    presentAed: 0,
    updatedAt: '2022-01-03T01:00:00.000Z'
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
      parseDetectionArbimonToBio({ ...VALID_DETECTION, idArbimon: '2391043' }),
      parseDetectionArbimonToBio({ ...VALID_DETECTION, siteId: '88529' }),
      parseDetectionArbimonToBio({ ...VALID_DETECTION, presentReview: null }),
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
    const { idArbimon, ...missingIdArbimon } = VALID_DETECTION
    const { presentReview, ...missingPresentReview } = VALID_DETECTION

    // Act
    const actualMissing = [
      parseDetectionArbimonToBio(missingDate),
      parseDetectionArbimonToBio(missingIdArbimon),
      parseDetectionArbimonToBio(missingPresentReview)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if non-nullish props are nullish', async () => {
    // Arrange
    const nullDate = { ...VALID_DETECTION, date: null }
    const nullIdArbimon = { ...VALID_DETECTION, idArbimon: null }

    const undefinedDate = { ...VALID_DETECTION, date: undefined }
    const undefinedIdArbimon = { ...VALID_DETECTION, idArbimon: undefined }

    // Act
    const actualMissing = [
      parseDetectionArbimonToBio(nullDate),
      parseDetectionArbimonToBio(nullIdArbimon),
      parseDetectionArbimonToBio(undefinedDate),
      parseDetectionArbimonToBio(undefinedIdArbimon)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })
})
