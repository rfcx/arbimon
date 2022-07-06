import { describe, expect, test } from 'vitest'

import { parseSpeciesCallArbimonToBio } from './parse-species-call-arbimon-to-bio'

describe('ingest > parsers > parseProjectSpeciesArbimonToBio', () => {
  const VALID_SPECIES_CALL = {
    taxonSpeciesId: 1050,
    callProjectId: 1920,
    projectSlugArbimon: 'rfcx-1',
    callSiteId: 88528,
    callRecordedAt: '2020-12-06 03:06:19',
    start: 75.24309455587392,
    end: 80.86693409742121,
    siteIdCore: 'cydwrzz91cbz',
    callType: 'Common Song',
    recordingId: 7047505,
    callTimezone: 'Asia/Bangkok',
    updatedAt: '2022-03-22 07:31:11',
    idArbimon: 980
  }

  const NOT_VALID_SPECIES_CALLS = [
    {
      taxonSpeciesId: 42251,
      callProjectId: 1920,
      projectSlugArbimon: 'rfcx-1',
      callSiteId: 88528,
      callRecordedAt: '2020-12-06 03:06:19',
      start: '54.322105263157894', // not valid format
      end: '59.764210526315786', // not valid format
      siteIdCore: 'cydwrzz91cbzzz', // not valid format
      callType: 'Common Song',
      recordingId: 7047505,
      callTimezone: 'Asia/Bangkok',
      updatedAt: '2022-03-22 07:31:11',
      idArbimon: 980
    },
    {
      taxonSpeciesId: 3842,
      callProjectId: 1920,
      projectSlugArbimon: 'rfcx-1',
      callSiteId: 88528,
      callRecordedAt: undefined, // not valid format
      start: 10.488421052631578,
      end: 17.810526315789474,
      siteIdCore: 'cydwrzz91cbz',
      callType: 12, // not valid format
      recordingId: 7047505,
      callTimezone: 'Asia/Bangkok',
      updatedAt: '2022-03-22 07:31:11'
    }
  ]

  test('succeeds for valid species call data', async () => {
    // Act
    const actual = parseSpeciesCallArbimonToBio(VALID_SPECIES_CALL)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fail for not valid species call data', async () => {
    // Act
    const actual = parseSpeciesCallArbimonToBio(NOT_VALID_SPECIES_CALLS[0])
    const actual2 = parseSpeciesCallArbimonToBio(NOT_VALID_SPECIES_CALLS[1])

    // Assert
    expect(actual.success).toBe(false)
    expect(actual2.success).toBe(false)
  })

  test('fails if required props are missing', async () => {
    // Arrange
    const { taxonSpeciesId, ...missingTaxonSpeciesId } = VALID_SPECIES_CALL
    const { callProjectId, ...missingCallProjectId } = VALID_SPECIES_CALL
    const { projectSlugArbimon, ...missingProjectSlugArbimon } = VALID_SPECIES_CALL

    // Act
    const actualMissing = [
      parseSpeciesCallArbimonToBio(missingTaxonSpeciesId),
      parseSpeciesCallArbimonToBio(missingCallProjectId),
      parseSpeciesCallArbimonToBio(missingProjectSlugArbimon)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if non-nullish props are nullish', async () => {
    // Arrange
    const nullTaxonSpeciesId = { ...VALID_SPECIES_CALL, taxonSpeciesId: null }
    const nullCallProjectId = { ...VALID_SPECIES_CALL, callProjectId: null }

    const undefinedTaxonSpeciesId = { ...VALID_SPECIES_CALL, taxonSpeciesId: undefined }
    const undefinedCallProjectId = { ...VALID_SPECIES_CALL, callProjectId: undefined }

    // Act
    const actualMissing = [
      parseSpeciesCallArbimonToBio(nullTaxonSpeciesId),
      parseSpeciesCallArbimonToBio(nullCallProjectId),
      parseSpeciesCallArbimonToBio(undefinedTaxonSpeciesId),
      parseSpeciesCallArbimonToBio(undefinedCallProjectId)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })
})
