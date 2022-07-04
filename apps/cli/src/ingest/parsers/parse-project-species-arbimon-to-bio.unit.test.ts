import { describe, expect, test } from 'vitest'

import { parseProjectSpeciesArbimonToBio } from './parse-project-species-arbimon-to-bio'

describe('ingest > parsers > parseProjectSpeciesArbimonToBio', () => {
  const VALID_PROJECT_CLASS = {
    projectId: 1920,
    speciesId: 74
  }

  test('succeeds for valid data', async () => {
    // Act
    const actual = parseProjectSpeciesArbimonToBio(VALID_PROJECT_CLASS)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fails if required props are missing', async () => {
    // Arrange
    const { projectId, ...missingProjectId } = VALID_PROJECT_CLASS
    const { speciesId, ...missingSpeciesId } = VALID_PROJECT_CLASS

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
    const nullProjectId = { ...VALID_PROJECT_CLASS, projectId: null }
    const nullSpeciesId = { ...VALID_PROJECT_CLASS, speciesId: null }

    const undefinedProjectId = { ...VALID_PROJECT_CLASS, projectId: undefined }
    const undefinedSpeciesId = { ...VALID_PROJECT_CLASS, speciesId: undefined }

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
