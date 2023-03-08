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

  test('succeeds for valid species call data', async () => {
    // Act
    const actual = parseSpeciesCallArbimonToBio(VALID_SPECIES_CALL)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fail for not valid species call data', async () => {
    // Act
    const res = [
      parseSpeciesCallArbimonToBio({ ...VALID_SPECIES_CALL, start: '54.322105263157894' }),
      parseSpeciesCallArbimonToBio({ ...VALID_SPECIES_CALL, siteIdCore: 'cydwrzz91cbzzz' }),
      parseSpeciesCallArbimonToBio({ ...VALID_SPECIES_CALL, callRecordedAt: undefined }),
      parseSpeciesCallArbimonToBio({ ...VALID_SPECIES_CALL, callRecordedAt: new Date('2020-12-06 03:06:19') }),
      parseSpeciesCallArbimonToBio({ ...VALID_SPECIES_CALL, callType: 12 }),
      parseSpeciesCallArbimonToBio({ ...VALID_SPECIES_CALL, updatedAt: new Date('2022-03-22 07:31:11') })
    ]
    // Assert
    res.forEach(r => { expect(r.success).toBe(false) })
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
    actualMissing.forEach(actual => { expect(actual.success).toBe(false) })
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
    actualMissing.forEach(actual => { expect(actual.success).toBe(false) })
  })
})
