import { describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { syncIucnSpeciesInfo } from './iucn'

const biodiversitySequelize = getSequelize()

describe('species-info > iucn > syncIucnSpeciesInfo', () => {
  const VALID_SPECIES = [
    {
      id: 2,
      risk_rating_iucn_id: 200,
      scientific_name: 'Actitis macularius'
    },
    {
      id: 3,
      risk_rating_iucn_id: 500,
      scientific_name: 'Agelaius xanthomus'
    }
  ]

  const RISK_RATING = [
    {
      id: -1,
      code: 'NE'
    },
    {
      id: 200,
      code: 'LC'
    },
    {
      id: 300,
      code: 'NT'
    },
    {
      id: 500,
      code: 'EN'
    },
    {
      id: 600,
      code: 'CR'
    }
  ]

  test('succeeds for valid species data', async () => {
    // Arrange
    const speciesIds = VALID_SPECIES.map(species => species.id)
    const speciesRicks = VALID_SPECIES.map(species => species.risk_rating_iucn_id)
    const speciesNameToId = Object.fromEntries(VALID_SPECIES.map(s => [s.scientific_name, { id: s.id, risk_rating_iucn_id: s.risk_rating_iucn_id }]))
    const iucnCodeToId = Object.fromEntries(RISK_RATING.map(r => [r.code, r.id]))
    console.info('iucnCodeToId', iucnCodeToId)

    // Act
    await syncIucnSpeciesInfo(biodiversitySequelize, speciesNameToId, iucnCodeToId).catch(err => { console.error(err.message) })
    const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesIucn.findAll({ where: { taxonSpeciesId: speciesIds } })

    // Assert
    species.forEach(actual => { expect(speciesRicks).includes(actual.riskRatingIucnId) })
  })
})
