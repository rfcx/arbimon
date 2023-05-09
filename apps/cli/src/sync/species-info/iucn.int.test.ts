import { afterEach, beforeEach, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type TaxonSpecies, type TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { syncOnlyMissingIUCNSpeciesInfo } from './iucn'

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
  // Act
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

  await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate(taxonSpecies)
  await syncOnlyMissingIUCNSpeciesInfo(biodiversitySequelize)
  const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesIucn.findAll({ where: { taxonSpeciesId: [2050002, 2050003] } })

  // Assert
  species.forEach(actual => { expect(speciesRicks).includes(actual.riskRatingIucnId) })
})
