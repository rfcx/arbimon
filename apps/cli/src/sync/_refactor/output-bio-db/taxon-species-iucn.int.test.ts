import { beforeEach, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type TaxonSpecies, type TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { writeIucnSpeciesDataToPostgres } from './taxon-species-iucn'

const biodiversitySequelize = getSequelize()

const taxonSpecies1: TaxonSpecies = {
  id: 1050001,
  idArbimon: 1050,
  slug: 'falco-amurensis',
  taxonClassId: 300,
  scientificName: 'Falco amurensis'
}
const taxonSpecies2: TaxonSpecies = {
  id: 1051001,
  idArbimon: 1051,
  slug: 'falco-eleonorae',
  taxonClassId: 300,
  scientificName: 'Falco eleonorae'
}

beforeEach(async () => {
  await biodiversitySequelize.query('DELETE FROM taxon_species_iucn')
  await biodiversitySequelize.query(`DELETE FROM taxon_species WHERE id in (${taxonSpecies1.id}, ${taxonSpecies2.id})`)

  await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate([taxonSpecies1, taxonSpecies2])
})

test('can insert and update (including updatedAt)', async () => {
  // Arrange
  const taxonSpeciesIucn1: Omit<TaxonSpeciesIucn, 'id'> = {
    taxonSpeciesId: taxonSpecies1.id,
    description: 'This species has an extremely large range, and hence does not approach the thresholds for Vulnerable under the range size criterion.',
    descriptionSourceUrl: 'http://datazone.birdlife.org/species/factsheet/amur-falcon-falco-amurensis',
    commonName: 'Amur Falcon',
    riskRatingIucnId: 400
  }
  const taxonSpeciesIucn2: Omit<TaxonSpeciesIucn, 'id'> = {
    taxonSpeciesId: taxonSpecies2.id,
    description: ' The population trend appears to be increasing.',
    descriptionSourceUrl: 'http://datazone.birdlife.org/species/factsheet/eleonoras-falcon-falco-eleonorae',
    commonName: 'Eleonora\'s Falcon',
    riskRatingIucnId: 200
  }
  await writeIucnSpeciesDataToPostgres(biodiversitySequelize, [taxonSpeciesIucn1])

  // Act
  await writeIucnSpeciesDataToPostgres(biodiversitySequelize, [
    { ...taxonSpeciesIucn1, riskRatingIucnId: 500 },
    taxonSpeciesIucn2
  ])

  // Assert
  const taxonSpeciesIucns = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpeciesIucn.findAll()
  expect(taxonSpeciesIucns).toHaveLength(2)
  expect(taxonSpeciesIucns[0].riskRatingIucnId).toBe(500)
  expect(taxonSpeciesIucns[1].riskRatingIucnId).toBe(200)
  expect(taxonSpeciesIucns[0].updatedAt).toEqual(taxonSpeciesIucns[1].updatedAt)
  expect(taxonSpeciesIucns[0].updatedAt).not.toEqual(taxonSpeciesIucns[0].createdAt)
})
