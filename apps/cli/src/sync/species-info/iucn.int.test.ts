import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { rawRiskRatings } from '@/db/seeders/_data/risk-rating'
import { getIucnSpecies } from '@/sync/_refactor/input-iucn/iucn-species'
import { getIucnSpeciesNarrative } from '@/sync/_refactor/input-iucn/iucn-species-narrative'
import { syncOnlyMissingIUCNSpeciesInfo } from './iucn'

// Inputs to the sync from the IUCN API
const IUCN_SPECIES_1 = {
  taxonid: 22724209,
  scientific_name: 'Agelaius xanthomus',
  main_common_name: 'Yellow-shouldered Blackbird',
  category: 'EN'
}
const IUCN_SPECIES_2 = {
  taxonid: 22693277,
  scientific_name: 'Actitis macularius',
  main_common_name: 'Spotted Sandpiper',
  category: 'LC'
}
const IUCN_NARRATIVE_SPECIES_1 = {
  species_id: 22724209,
  scientific_name: 'Agelaius xanthomus',
  habitat: 'The Yellow-shouldered Blackbird occupies a variety of habitats, all typically along the coast where it is most common (Jaramillo and Burke 1999).',
  sourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Agelaius%20xanthomus'
}
const IUCN_NARRATIVE_SPECIES_2 = {
  species_id: 22693277,
  scientific_name: 'Actitis macularius',
  habitat: null,
  sourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Actitis%20macularius'
}

vi.mock('@/sync/_refactor/input-iucn/iucn-species', () => {
  return {
    getIucnSpecies: vi.fn(async (scientificName: string) => await Promise.resolve([IUCN_SPECIES_1, IUCN_SPECIES_2].find(s => s.scientific_name === scientificName)))
  }
})
vi.mock('@/sync/_refactor/input-iucn/iucn-species-narrative', () => {
  return {
    getIucnSpeciesNarrative: vi.fn(async (scientificName: string) => await Promise.resolve([IUCN_NARRATIVE_SPECIES_1, IUCN_NARRATIVE_SPECIES_2].find(s => s.scientific_name === scientificName)))
  }
})
vi.mock('@rfcx-bio/utils/async', () => {
  return {
    getSequentially: async <T>(keys: string[], getter: (key: string) => Promise<T | undefined>): Promise<Record<string, T>> => {
      const results: Record<string, T> = {}
      for (const key of keys) {
        const result = await getter(key)
        if (result !== undefined) results[key] = result
      }
      return results
    }
  }
})

const biodiversitySequelize = getSequelize()
const models = ModelRepository.getInstance(biodiversitySequelize)

// Synced species from Arbimon
const SPECIES_1: TaxonSpecies = {
  id: 2050003,
  idArbimon: 9088,
  slug: 'agelaius-xanthomus',
  taxonClassId: 300,
  scientificName: 'Agelaius xanthomus',
  updatedAt: new Date('2023-04-04 03:11:20.339+00')
}
const SPECIES_2: TaxonSpecies = {
  id: 2050002,
  idArbimon: 7322,
  slug: 'actitis-macularius',
  taxonClassId: 300,
  scientificName: 'Actitis macularius',
  updatedAt: new Date('2023-04-04 03:11:20.339+00')
}
const SPECIES_3: TaxonSpecies = {
  id: 2050000,
  idArbimon: 7320,
  slug: 'alophoixus-finschii',
  taxonClassId: 300,
  scientificName: 'Alophoixus finschii',
  updatedAt: new Date('2023-03-09 03:11:20.339+00')
}
const SPECIES_4: TaxonSpecies = {
  id: 2050001,
  idArbimon: 9086,
  slug: 'arachnothera-everetti',
  taxonClassId: 300,
  scientificName: 'Arachnothera everetti',
  updatedAt: new Date('2023-03-09 03:11:20.339+00')
}

const iucnCategoryToRiskRatingId = Object.fromEntries(rawRiskRatings.map(r => [r.code, r.id]))

beforeEach(async () => {
  await models.TaxonSpecies.bulkCreate([SPECIES_1, SPECIES_2, SPECIES_3, SPECIES_4])
})

afterEach(async () => {
  await models.TaxonSpeciesIucn.destroy({ where: { taxonSpeciesId: [SPECIES_1, SPECIES_2, SPECIES_3, SPECIES_4].map(s => s.id) } })
  await models.TaxonSpecies.destroy({ where: { id: [SPECIES_1, SPECIES_2, SPECIES_3, SPECIES_4].map(s => s.id) } })
  vi.restoreAllMocks()
})

test('rows created for 2 matching species', async () => {
  // Act
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)

  // Assert
  const iucnSpecies1 = await models.TaxonSpeciesIucn.findOne({ where: { taxonSpeciesId: SPECIES_1.id } })
  expect(iucnSpecies1).toBeTruthy()
  expect(iucnSpecies1?.commonName).toBe(IUCN_SPECIES_1.main_common_name)
  expect(iucnSpecies1?.riskRatingIucnId).toBe(iucnCategoryToRiskRatingId[IUCN_SPECIES_1.category])
  expect(iucnSpecies1?.description).toBe(IUCN_NARRATIVE_SPECIES_1.habitat)
  const iucnSpecies2 = await models.TaxonSpeciesIucn.findOne({ where: { taxonSpeciesId: SPECIES_2.id } })
  expect(iucnSpecies2).toBeTruthy()
  expect(iucnSpecies2?.commonName).toBe(IUCN_SPECIES_2.main_common_name)
  expect(iucnSpecies2?.riskRatingIucnId).toBe(iucnCategoryToRiskRatingId[IUCN_SPECIES_2.category])
})

test('rows created for non-matching species', async () => {
  // Act
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)

  // Assert
  const iucnSpecies3 = await models.TaxonSpeciesIucn.findOne({ where: { taxonSpeciesId: SPECIES_3.id } })
  expect(iucnSpecies3).toBeTruthy()
  expect(iucnSpecies3?.riskRatingIucnId).toBe(iucnCategoryToRiskRatingId.NA)
})

test('risk rating updated after 1 month', async () => {
  // Arrange
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)
  await biodiversitySequelize.query(`UPDATE taxon_species_iucn SET updated_at = date_trunc('day', updated_at - interval '1 month') WHERE taxon_species_id = ${SPECIES_1.id}`)
  ;(getIucnSpecies as any).mockResolvedValue(undefined)
  ;(getIucnSpeciesNarrative as any).mockResolvedValue(undefined)

  // Act
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)

  // Assert
  const iucnSpecies1 = await models.TaxonSpeciesIucn.findOne({ where: { taxonSpeciesId: SPECIES_1.id } })
  const aMinuteAgo = new Date(Date.now() - 1000 * 60)
  expect(iucnSpecies1?.updatedAt?.getTime()).toBeGreaterThan(aMinuteAgo.getTime())
})

test('risk rating not updated when IUCN data not found', async () => {
  // Arrange
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)
  await biodiversitySequelize.query(`UPDATE taxon_species_iucn SET updated_at = date_trunc('day', updated_at - interval '1 month') WHERE taxon_species_id = ${SPECIES_1.id}`)
  ;(getIucnSpecies as any).mockResolvedValue(undefined)
  ;(getIucnSpeciesNarrative as any).mockResolvedValue(undefined)

  // Act
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)

  // Assert
  const iucnSpecies1 = await models.TaxonSpeciesIucn.findOne({ where: { taxonSpeciesId: SPECIES_1.id } })
  expect(iucnSpecies1?.riskRatingIucnId).toBe(iucnCategoryToRiskRatingId[IUCN_SPECIES_1.category])
})

test('risk rating not updated when getting IUCN data is rejected', async () => {
  // Arrange
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)
  await biodiversitySequelize.query(`UPDATE taxon_species_iucn SET updated_at = date_trunc('day', updated_at - interval '1 month') WHERE taxon_species_id = ${SPECIES_1.id}`)
  ;(getIucnSpecies as any).mockRejectedValue(new Error('Unexpected'))
  ;(getIucnSpeciesNarrative as any).mockRejectedValue(new Error('Unexpected'))
  const catchCall = vi.fn()

  // Act
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize).catch(catchCall)

  // Assert
  expect(catchCall).toHaveBeenCalledOnce()
  const iucnSpecies1 = await models.TaxonSpeciesIucn.findOne({ where: { taxonSpeciesId: SPECIES_1.id } })
  expect(iucnSpecies1?.riskRatingIucnId).toBe(iucnCategoryToRiskRatingId[IUCN_SPECIES_1.category])
})
