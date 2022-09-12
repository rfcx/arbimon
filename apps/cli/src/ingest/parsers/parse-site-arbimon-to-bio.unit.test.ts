import { describe, expect, test } from 'vitest'

import { parseSiteArbimonToBio } from './parse-site-arbimon-to-bio'

describe('ingest > parsers > parseSiteArbimonToBio', () => {
  const VALID_SITE = {
    idArbimon: 123,
    idCore: '123',
    projectIdArbimon: 1,
    name: 'Site 123',
    latitude: 0,
    longitude: 0,
    altitude: 0,
    deletedAt: null
  }

  test('succeeds for valid data', async () => {
    // Act
    const actual = parseSiteArbimonToBio(VALID_SITE)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fails if required props are missing', async () => {
    // Arrange
    const { idArbimon, ...missingIdArbimon } = VALID_SITE
    const { idCore, ...missingIdCore } = VALID_SITE
    const { projectIdArbimon, ...missingProjectId } = VALID_SITE
    const { name, ...missingName } = VALID_SITE
    const { latitude, ...missingLatiude } = VALID_SITE
    const { longitude, ...missingLongitude } = VALID_SITE
    const { altitude, ...missingAltitude } = VALID_SITE

    // Act
    const actualMissing = [
      parseSiteArbimonToBio(missingIdArbimon),
      parseSiteArbimonToBio(missingIdCore),
      parseSiteArbimonToBio(missingProjectId),
      parseSiteArbimonToBio(missingName),
      parseSiteArbimonToBio(missingLatiude),
      parseSiteArbimonToBio(missingLongitude),
      parseSiteArbimonToBio(missingAltitude)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if non-nullish props are nullish', async () => {
    // Arrange
    const nullIdArbimon = { ...VALID_SITE, idArbimon: null }
    const nullIdCore = { ...VALID_SITE, idCore: null }
    const nullProjectId = { ...VALID_SITE, projectIdArbimon: null }
    const nullName = { ...VALID_SITE, name: null }
    const nullLatitude = { ...VALID_SITE, latitude: null }
    const nullLongitude = { ...VALID_SITE, longitude: null }
    const nullAltitude = { ...VALID_SITE, altitude: null }

    const undefinedIdArbimon = { ...VALID_SITE, idArbimon: undefined }
    const undefinedIdCore = { ...VALID_SITE, idCore: undefined }
    const undefinedProjectId = { ...VALID_SITE, projectIdArbimon: undefined }
    const undefinedName = { ...VALID_SITE, name: undefined }
    const undefinedLatitude = { ...VALID_SITE, latitude: undefined }
    const undefinedLongitude = { ...VALID_SITE, longitude: undefined }
    const undefinedAltitude = { ...VALID_SITE, altitude: undefined }

    // Act
    const actualMissing = [
      parseSiteArbimonToBio(nullIdArbimon),
      parseSiteArbimonToBio(nullIdCore),
      parseSiteArbimonToBio(nullProjectId),
      parseSiteArbimonToBio(nullName),
      parseSiteArbimonToBio(nullLatitude),
      parseSiteArbimonToBio(nullLongitude),
      parseSiteArbimonToBio(nullAltitude),
      parseSiteArbimonToBio(undefinedIdArbimon),
      parseSiteArbimonToBio(undefinedIdCore),
      parseSiteArbimonToBio(undefinedProjectId),
      parseSiteArbimonToBio(undefinedName),
      parseSiteArbimonToBio(undefinedLatitude),
      parseSiteArbimonToBio(undefinedLongitude),
      parseSiteArbimonToBio(undefinedAltitude)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if props are in wrong type (idCoreNumber, idArbimonString)', async () => {
    // Arrange
    const idCoreNumber = { ...VALID_SITE, idCore: 30 }
    const idArbimonString = { ...VALID_SITE, idArbimon: '30' }

    // Act
    const actualMissing = [
      parseSiteArbimonToBio(idCoreNumber),
      parseSiteArbimonToBio(idArbimonString)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })
})
