import { describe, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { getIucnSpecies } from '@/sync/_refactor/input-iucn/iucn-species'
import { getIucnSpeciesNarrative } from '@/sync/_refactor/input-iucn/iucn-species-narrative'
import { syncIucnSpeciesInfo } from './iucn'

vi.mock('@/sync/_refactor/input-iucn/iucn-species', () => {
  return {
    getIucnSpecies: vi.fn()
  }
})
vi.mock('@/sync/_refactor/input-iucn/iucn-species-narrative', () => {
  return {
    getIucnSpeciesNarrative: vi.fn()
  }
})

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

  const DEFAULT_IUCN_SPECIES = {
    'Actitis macularius': {
      taxonid: 22693277,
      scientific_name: 'Actitis macularius',
      main_common_name: 'Spotted Sandpiper',
      category: 'LC'
    },
    'Agelaius xanthomus': {
      taxonid: 22724209,
      scientific_name: 'Agelaius xanthomus',
      main_common_name: 'Yellow-shouldered Blackbird',
      category: 'EN'
    }
  }

  const DEFAULT_IUCN_SPECIES_NARRATIVE = {
    'Actitis macularius': {
      species_id: 22693277,
      habitat: null,
      sourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Actitis%20macularius'
    },
    'Agelaius xanthomus': {
      species_id: 22724209,
      habitat: "The Yellow-shouldered Blackbird occupies a variety of habitats, all typically along the coast where it is most common (Jaramillo and Burke 1999). Such habitats include: mud flats, salt flats, offshore red mangroves&#160;(<em>Rhizophora mangle</em>) cays, black mangrove (<em>Avicennia germinans</em>) forests, lowland dry coastal pastures, suburban areas (including buildings), coconut (<em>Cocos nucifera</em>) plantations, and coastal cliffs (Skutch 1996, Lewis <em>et al</em>. 1999, Falcon <em>et al</em>. 2000, USFWS 2018).&#160;The species was once common in coastal forests, however during the early 20th century, the majority of Puerto Rico's coastal forests were replaced by sugar cane plantations, and latterly housing or livestock pasture (USFWS 2011, 2018, J.&#160;Martínez <em>in litt</em>. 2020). Many birds now breed on offshore cays (Skutch 1996)<strong></strong>. Whilst non-migratory, some individuals of the main island population are known to move inland to inhabit subtropical wet forest during the non-breeding season to forage (USFWS 2011). Whilst typically an arboreal insectivore, the species also forages terrestrially, consuming arachnids, small molluscs, fruits, seeds and nectar from various plant species (Skutch 1996,&#160;Raffaele <em>et al</em>. 1998, Jaramillo and Burke 1999, USFWS 2011); it has also been evidenced to consume exposed or discarded human food and livestock feed (USFWS 2018). Birds gather at communal feeding-sites, with large flocks forming during the non-breeding season (Jaramillo and Burke 1999)<strong></strong><strong></strong>. Nests are often built low in mangrove trees, or in large deciduous trees in pastures near to mangroves (Skutch 1996)<strong></strong>, with several nests being built in close proximity (Jaramillo and Burke 1999)<strong></strong><strong></strong>. On Mona Island, nests are placed in crevices or on ledges on high, vertical sea-cliffs (Skutch 1996)<strong></strong>. Three clutches are usually laid per year (Skutch 1996)<strong></strong>, and the breeding season is May-September.<p></p>",
      sourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Agelaius%20xanthomus'
    }
  }

  test('succeeds for valid species data', async () => {
    // Arrange
    const speciesIds = VALID_SPECIES.map(species => species.id)
    const speciesRicks = VALID_SPECIES.map(species => species.risk_rating_iucn_id)
    const speciesNameToId = Object.fromEntries(VALID_SPECIES.map(s => [s.scientific_name, { id: s.id, riskRatingIucnId: s.risk_rating_iucn_id }]))
    const iucnCodeToId = Object.fromEntries(RISK_RATING.map(r => [r.code, r.id]))

    // Mock services
    const longCredit1 = 'x'.repeat(1024);
    (getIucnSpecies as any).mockResolvedValueOnce({ ...DEFAULT_IUCN_SPECIES, credit: longCredit1 })
    const longCredit2 = 'x'.repeat(1024);
    (getIucnSpeciesNarrative as any).mockResolvedValueOnce({ ...DEFAULT_IUCN_SPECIES_NARRATIVE, credit: longCredit2 })

    // Act
    await syncIucnSpeciesInfo(biodiversitySequelize, speciesNameToId, iucnCodeToId).catch(err => { console.error(err.message) })
    const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesIucn.findAll({ where: { taxonSpeciesId: speciesIds } })

    // Assert
    expect(getIucnSpecies).toHaveBeenCalled()
    expect(getIucnSpeciesNarrative).toHaveBeenCalled()
    species.forEach(actual => { expect(speciesRicks).includes(actual.riskRatingIucnId) })
  })

  test.todo('getIucnSpecies returns undefined species data', async () => { })
  test.todo('getIucnSpecies raises an exception', async () => { })
})
