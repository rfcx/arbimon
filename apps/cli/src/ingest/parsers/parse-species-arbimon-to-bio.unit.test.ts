import { describe, expect, test } from 'vitest'

import { parseSpeciesArbimonToBio } from './parse-species-arbimon-to-bio'

describe('ingest > parsers > parseSpeciesArbimonToBio', () => {
  const VALID_SPECIES = {
    idArbimon: 1749,
    slug: 'actitis-macularius',
    taxonClassId: 1,
    scientificName: 'Actitis macularius',
    updatedAt: '2022-06-23T15:40:00.000Z'
  }

  test('succeeds for valid data', async () => {
    // Act
    const actual = parseSpeciesArbimonToBio(VALID_SPECIES)

    // Assert
    expect(actual.success).toBe(true)
  })

  test('fails if required props are missing', async () => {
    // Arrange
    const { idArbimon, ...missingIdArbimon } = VALID_SPECIES
    const { taxonClassId, ...missingTaxonClassId } = VALID_SPECIES
    const { scientificName, ...missingScientificName } = VALID_SPECIES

    // Act
    const actualMissing = [
      parseSpeciesArbimonToBio(missingIdArbimon),
      parseSpeciesArbimonToBio(missingTaxonClassId),
      parseSpeciesArbimonToBio(missingScientificName)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })

  test('fails if non-nullish props are nullish', async () => {
    // Arrange
    const nullIdArbimon = { ...VALID_SPECIES, idArbimon: null }
    const nullTaxonClassId = { ...VALID_SPECIES, taxonClassId: null }
    const nullScientificName = { ...VALID_SPECIES, scientificName: null }

    const undefinedIdArbimon = { ...VALID_SPECIES, idArbimon: undefined }
    const undefinedTaxonClassId = { ...VALID_SPECIES, taxonClassId: undefined }
    const undefinedScientificName = { ...VALID_SPECIES, scientificName: undefined }

    // Act
    const actualMissing = [
      parseSpeciesArbimonToBio(nullIdArbimon),
      parseSpeciesArbimonToBio(nullTaxonClassId),
      parseSpeciesArbimonToBio(nullScientificName),
      parseSpeciesArbimonToBio(undefinedIdArbimon),
      parseSpeciesArbimonToBio(undefinedTaxonClassId),
      parseSpeciesArbimonToBio(undefinedScientificName)
    ]

    // Assert
    actualMissing.forEach(actual => expect(actual.success).toBe(false))
  })
})
