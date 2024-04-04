import { describe, expect, test } from 'vitest'

import { parseSiteArbimon } from './parse-site-arbimon-to-bio'

describe('ingest > parsers > parseSiteArbimonToBio', () => {
  const VALID_SITE = {
    idArbimon: 123,
    idCore: '123',
    projectIdArbimon: 1,
    name: 'Site 123',
    latitude: 0,
    longitude: 0,
    altitude: 0,
    countryCode: 'TH',
    deletedAt: null,
    hidden: 0
  }

  test('succeeds for valid data', async () => {
    // Act
    const actual = parseSiteArbimon(VALID_SITE)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fails if required props are missing', async () => {
    // Arrange
    const { idArbimon, ...missingIdArbimon } = VALID_SITE
    const { idCore, ...missingIdCore } = VALID_SITE
    const { projectIdArbimon, ...missingProjectId } = VALID_SITE
    const { name, ...missingName } = VALID_SITE

    // Act
    const actualMissingIdArbimon = parseSiteArbimon(missingIdArbimon)
    const actualMissingIdCore = parseSiteArbimon(missingIdCore)
    const actualMissingProjectId = parseSiteArbimon(missingProjectId)
    const actualMissingName = parseSiteArbimon(missingName)

    // Assert
    expect(actualMissingIdArbimon.success).toBe(false)
    expect(actualMissingIdCore.success).toBe(false)
    expect(actualMissingProjectId.success).toBe(false)
    expect(actualMissingName.success).toBe(false)
  })

  test('fails if non-nullish props are nullish', async () => {
    // Arrange
    const nullIdArbimon = { ...VALID_SITE, idArbimon: null }
    const nullIdCore = { ...VALID_SITE, idCore: null }
    const nullProjectId = { ...VALID_SITE, projectIdArbimon: null }
    const nullName = { ...VALID_SITE, name: null }

    const undefinedIdArbimon = { ...VALID_SITE, idArbimon: undefined }
    const undefinedIdCore = { ...VALID_SITE, idCore: undefined }
    const undefinedProjectId = { ...VALID_SITE, projectIdArbimon: undefined }
    const undefinedName = { ...VALID_SITE, name: undefined }
    const undefinedCountryCode = { ...VALID_SITE, countryCode: undefined }

    // Act
    const actualMissing = [
      parseSiteArbimon(nullIdArbimon),
      parseSiteArbimon(nullIdCore),
      parseSiteArbimon(nullProjectId),
      parseSiteArbimon(nullName),
      parseSiteArbimon(undefinedIdArbimon),
      parseSiteArbimon(undefinedIdCore),
      parseSiteArbimon(undefinedProjectId),
      parseSiteArbimon(undefinedName),
      parseSiteArbimon(undefinedCountryCode)
    ]

    // Assert
    actualMissing.forEach(actual => { expect(actual.success).toBe(false) })
  })

  test('fails if props are in wrong type (idCoreNumber, idArbimonString)', async () => {
    // Arrange
    const idCoreNumber = { ...VALID_SITE, idCore: 30 }
    const idArbimonString = { ...VALID_SITE, idArbimon: '30' }

    // Act
    const actualMissing = [
      parseSiteArbimon(idCoreNumber),
      parseSiteArbimon(idArbimonString)
    ]

    // Assert
    actualMissing.forEach(actual => { expect(actual.success).toBe(false) })
  })
})
