import { describe, expect, test } from 'vitest'

import { parseProjectSpeciesArbimonToBio } from './parse-project-species-arbimon-to-bio'

describe('ingest > parsers > parseProjectSpeciesArbimonToBio', () => {
  const VALID_PROJECT_CLASS = {
    locationProjectId: 1920,
    taxonSpeciesId: 74
  }

  test('succeeds for valid data', async () => {
    // Act
    const actual = parseProjectSpeciesArbimonToBio(VALID_PROJECT_CLASS)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fails if required props are missing', async () => {
    // Arrange
    const { locationProjectId, ...missingProjectId } = VALID_PROJECT_CLASS
    const { taxonSpeciesId, ...missingSpeciesId } = VALID_PROJECT_CLASS

    // Act
    const actualMissing = [
      parseProjectSpeciesArbimonToBio(missingProjectId),
      parseProjectSpeciesArbimonToBio(missingSpeciesId)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if non-nullish props are nullish', async () => {
    // Arrange
    const nullProjectId = { ...VALID_PROJECT_CLASS, locationProjectId: null }
    const nullSpeciesId = { ...VALID_PROJECT_CLASS, taxonSpeciesId: null }

    const undefinedProjectId = { ...VALID_PROJECT_CLASS, locationProjectId: undefined }
    const undefinedSpeciesId = { ...VALID_PROJECT_CLASS, taxonSpeciesId: undefined }

    // Act
    const actualMissing = [
      parseProjectSpeciesArbimonToBio(nullProjectId),
      parseProjectSpeciesArbimonToBio(nullSpeciesId),
      parseProjectSpeciesArbimonToBio(undefinedProjectId),
      parseProjectSpeciesArbimonToBio(undefinedSpeciesId)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })
})
