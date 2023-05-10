import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type TaxonSpecies, type TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { getIucnSpecies } from '@/sync/_refactor/input-iucn/iucn-species'
import { getIucnSpeciesNarrative } from '@/sync/_refactor/input-iucn/iucn-species-narrative'
import { syncOnlyMissingIUCNSpeciesInfo } from './iucn'

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

// Species do not exist in the https://www.iucnredlist.org/
const taxonSpecies: TaxonSpecies[] = [{
  id: 2050000,
  idArbimon: 7320,
  slug: 'alophoixus-finschii',
  taxonClassId: 300,
  scientificName: 'Alophoixus finschii',
  updatedAt: new Date('2023-03-09 03:11:20.339+00')
}, {
  id: 2050001,
  idArbimon: 9086,
  slug: 'arachnothera-everetti',
  taxonClassId: 300,
  scientificName: 'Arachnothera everetti',
  updatedAt: new Date('2023-03-09 03:11:20.339+00')
}]

const taxonSpeciesIucn: TaxonSpeciesIucn[] = [{
  taxonSpeciesId: 2050000,
  riskRatingIucnId: 300,
  commonName: 'Alophoixus finschii',
  description: '',
  descriptionSourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Alophoixus%20finschii'
}, {
  taxonSpeciesId: 2050001,
  riskRatingIucnId: 200,
  commonName: 'Arachnothera everetti',
  description: '',
  descriptionSourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Arachnothera%20everetti'
}]

const VALID_IUCN_SPECIES_1 = {
  taxonid: 22724209,
  scientific_name: 'Agelaius xanthomus',
  main_common_name: 'Yellow-shouldered Blackbird',
  category: 'EN'
}

const VALID_IUCN_SPECIES_2 = {
  taxonid: 22693277,
  scientific_name: 'Actitis macularius',
  main_common_name: 'Spotted Sandpiper',
  category: 'LC'
}

const VALID_NARRATIVE_1 = {
  species_id: 22693277,
  habitat: null,
  sourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Actitis%20macularius'
}

const VALID_NARRATIVE_2 = {
  species_id: 22724209,
  habitat: "The Yellow-shouldered Blackbird occupies a variety of habitats, all typically along the coast where it is most common (Jaramillo and Burke 1999). Such habitats include: mud flats, salt flats, offshore red mangroves&#160;(<em>Rhizophora mangle</em>) cays, black mangrove (<em>Avicennia germinans</em>) forests, lowland dry coastal pastures, suburban areas (including buildings), coconut (<em>Cocos nucifera</em>) plantations, and coastal cliffs (Skutch 1996, Lewis <em>et al</em>. 1999, Falcon <em>et al</em>. 2000, USFWS 2018).&#160;The species was once common in coastal forests, however during the early 20th century, the majority of Puerto Rico's coastal forests were replaced by sugar cane plantations, and latterly housing or livestock pasture (USFWS 2011, 2018, J.&#160;Martínez <em>in litt</em>. 2020). Many birds now breed on offshore cays (Skutch 1996)<strong></strong>. Whilst non-migratory, some individuals of the main island population are known to move inland to inhabit subtropical wet forest during the non-breeding season to forage (USFWS 2011). Whilst typically an arboreal insectivore, the species also forages terrestrially, consuming arachnids, small molluscs, fruits, seeds and nectar from various plant species (Skutch 1996,&#160;Raffaele <em>et al</em>. 1998, Jaramillo and Burke 1999, USFWS 2011); it has also been evidenced to consume exposed or discarded human food and livestock feed (USFWS 2018). Birds gather at communal feeding-sites, with large flocks forming during the non-breeding season (Jaramillo and Burke 1999)<strong></strong><strong></strong>. Nests are often built low in mangrove trees, or in large deciduous trees in pastures near to mangroves (Skutch 1996)<strong></strong>, with several nests being built in close proximity (Jaramillo and Burke 1999)<strong></strong><strong></strong>. On Mona Island, nests are placed in crevices or on ledges on high, vertical sea-cliffs (Skutch 1996)<strong></strong>. Three clutches are usually laid per year (Skutch 1996)<strong></strong>, and the breeding season is May-September.<p></p>",
  sourceUrl: 'https://apiv3.iucnredlist.org/api/v3/website/Agelaius%20xanthomus'
}

const speciesIds = taxonSpeciesIucn.map(item => item.taxonSpeciesId)

beforeEach(async () => {
  await biodiversitySequelize.query('DELETE FROM taxon_species_iucn')
  await biodiversitySequelize.query('DELETE FROM taxon_species')
  await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate(taxonSpecies)
})

afterEach(async () => {
  await biodiversitySequelize.query('DELETE FROM taxon_species_iucn')
  await biodiversitySequelize.query('DELETE FROM taxon_species')
})

test('sync job does not rewrite existing species risk for (no data) species', async () => {
  // Arrange
  const speciesRicks = [300, 200]
  await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesIucn.bulkCreate(taxonSpeciesIucn)

  // Act
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)
  const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesIucn.findAll({ where: { taxonSpeciesId: speciesIds } })

  // Assert
  species.forEach(actual => { expect(speciesRicks).includes(actual.riskRatingIucnId) })
})

test('can sync iucn species info for new species | (no data) species', async () => {
  // Act
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)
  const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesIucn.findAll({ where: { taxonSpeciesId: speciesIds } })

  // Assert
  species.forEach(actual => { expect(actual.riskRatingIucnId).toBe(-1) })
})

test('can sync iucn species info for new species | (has data) species', async () => {
  // Arrange
  // Species exist in the https://www.iucnredlist.org/
  const taxonSpecies: TaxonSpecies[] = [{
    id: 2050002,
    idArbimon: 7322,
    slug: 'actitis-macularius',
    taxonClassId: 300,
    scientificName: 'Actitis macularius',
    updatedAt: new Date('2023-04-04 03:11:20.339+00')
  }, {
    id: 2050003,
    idArbimon: 9088,
    slug: 'agelaius-xanthomus',
    taxonClassId: 300,
    scientificName: 'Agelaius xanthomus',
    updatedAt: new Date('2023-04-04 03:11:20.339+00')
  }]

  const speciesRicks = [500, 200]
  await biodiversitySequelize.query('DELETE FROM taxon_species_iucn')
  await biodiversitySequelize.query('DELETE FROM taxon_species')
  await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate(taxonSpecies)

  // Mock services
  const longCredit1 = 'x'.repeat(1024);
  (getIucnSpecies as any).mockResolvedValueOnce({ ...VALID_IUCN_SPECIES_1, credit: longCredit1 })
  const longCredit2 = 'x'.repeat(1024);
  (getIucnSpecies as any).mockResolvedValueOnce({ ...VALID_IUCN_SPECIES_2, credit: longCredit2 })
  const longCredit3 = 'x'.repeat(1024);
  (getIucnSpeciesNarrative as any).mockResolvedValueOnce({ ...VALID_NARRATIVE_1, credit: longCredit3 })
  const longCredit4 = 'x'.repeat(1024);
  (getIucnSpeciesNarrative as any).mockResolvedValueOnce({ ...VALID_NARRATIVE_2, credit: longCredit4 })

  // Act
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)
  const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesIucn.findAll({ where: { taxonSpeciesId: [2050002, 2050003] } })

  // Assert
  species.forEach(actual => { expect(speciesRicks).includes(actual.riskRatingIucnId) })
})
