import { describe, expect, test } from 'vitest'

import { parseProjectArbimonToBio } from './parse-project-arbimon-to-bio'

describe('ingest > parsers > parseProjectArbimonToBio', () => {
  const VALID_PROJECT = {
    idArbimon: 123,
    idCore: '123',
    slug: 'project-123',
    name: 'Project 123',
    latitudeNorth: 0,
    latitudeSouth: 0,
    longitudeEast: 0,
    longitudeWest: 0
  }

  test('succeeds for valid data', async () => {
    // Act
    const actual = parseProjectArbimonToBio(VALID_PROJECT)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fails if required props are missing', async () => {
    // Arrange
    const { idArbimon, ...missingIdArbimon } = VALID_PROJECT
    const { idCore, ...missingIdCore } = VALID_PROJECT
    const { slug, ...missingSlug } = VALID_PROJECT
    const { name, ...missingName } = VALID_PROJECT
    const { latitudeNorth, ...missingLatiudeNorth } = VALID_PROJECT
    const { latitudeSouth, ...missingLatiudeSouth } = VALID_PROJECT
    const { longitudeEast, ...missingLongitudeEast } = VALID_PROJECT
    const { longitudeWest, ...missingLongitudeWest } = VALID_PROJECT

    // Act
    const actualMissing = [
      parseProjectArbimonToBio(missingIdArbimon),
      parseProjectArbimonToBio(missingIdCore),
      parseProjectArbimonToBio(missingSlug),
      parseProjectArbimonToBio(missingName),
      parseProjectArbimonToBio(missingLatiudeNorth),
      parseProjectArbimonToBio(missingLatiudeSouth),
      parseProjectArbimonToBio(missingLongitudeEast),
      parseProjectArbimonToBio(missingLongitudeWest)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if non-nullish props are nullish', async () => {
    // Arrange
    const nullIdArbimon = { ...VALID_PROJECT, idArbimon: null }
    const nullIdCore = { ...VALID_PROJECT, idCore: null }
    const nullSlug = { ...VALID_PROJECT, slug: null }
    const nullName = { ...VALID_PROJECT, name: null }
    const nullLatitudeNorth = { ...VALID_PROJECT, latitudeNorth: null }
    const nullLatitudeSouth = { ...VALID_PROJECT, latitudeSouth: null }
    const nullLongitudeEast = { ...VALID_PROJECT, longitudeEast: null }
    const nullLongitudeWest = { ...VALID_PROJECT, longitudeWest: null }

    const undefinedIdArbimon = { ...VALID_PROJECT, idArbimon: undefined }
    const undefinedIdCore = { ...VALID_PROJECT, idCore: undefined }
    const undefinedSlug = { ...VALID_PROJECT, slug: undefined }
    const undefinedName = { ...VALID_PROJECT, name: undefined }
    const undefinedLatitudeNorth = { ...VALID_PROJECT, latitudeNorth: undefined }
    const undefinedLatitudeSouth = { ...VALID_PROJECT, latitudeSouth: undefined }
    const undefinedLongitudeEast = { ...VALID_PROJECT, longitudeEast: undefined }
    const undefinedLongitudeWest = { ...VALID_PROJECT, longitudeWest: undefined }

    // Act
    const actualMissing = [
      parseProjectArbimonToBio(nullIdArbimon),
      parseProjectArbimonToBio(nullIdCore),
      parseProjectArbimonToBio(nullSlug),
      parseProjectArbimonToBio(nullName),
      parseProjectArbimonToBio(nullLatitudeNorth),
      parseProjectArbimonToBio(nullLatitudeSouth),
      parseProjectArbimonToBio(nullLongitudeEast),
      parseProjectArbimonToBio(nullLongitudeWest),
      parseProjectArbimonToBio(undefinedIdArbimon),
      parseProjectArbimonToBio(undefinedIdCore),
      parseProjectArbimonToBio(undefinedSlug),
      parseProjectArbimonToBio(undefinedName),
      parseProjectArbimonToBio(undefinedLatitudeNorth),
      parseProjectArbimonToBio(undefinedLatitudeSouth),
      parseProjectArbimonToBio(undefinedLongitudeEast),
      parseProjectArbimonToBio(undefinedLongitudeWest)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if props are in wrong type (idCoreNumber, idArbimonString)', async () => {
    // Arrange
    const idCoreNumber = { ...VALID_PROJECT, idCore: 30 }
    const idArbimonString = { ...VALID_PROJECT, idArbimon: '30' }

    // Act
    const actualMissing = [
      parseProjectArbimonToBio(idCoreNumber),
      parseProjectArbimonToBio(idArbimonString)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if slug is not urlified', async () => {
    // Arrange
    const slugWithSlash = { ...VALID_PROJECT, slug: 'not/a/slug' }
    const slugWithSpace = { ...VALID_PROJECT, slug: 'not a slug' }
    const slugWithUpperCase = { ...VALID_PROJECT, slug: 'Not-a-slug' }
    const slugWithRandomChars = { ...VALID_PROJECT, slug: 'not-a-slug/1' }

    // Act
    const actualMissing = [
      parseProjectArbimonToBio(slugWithSlash),
      parseProjectArbimonToBio(slugWithSpace),
      parseProjectArbimonToBio(slugWithUpperCase),
      parseProjectArbimonToBio(slugWithRandomChars)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })
})
