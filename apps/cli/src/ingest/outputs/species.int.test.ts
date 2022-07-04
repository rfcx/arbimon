import { Op } from 'sequelize'
import { describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { rawTaxonClasses } from '@/db/seeders/_data/taxon-class'
import { writeSpeciesToBio } from './species'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > taxon species', () => {
  const BIRDS_ID = rawTaxonClasses[3].id

  test('can write new taxon species', async () => {
    // Arrange
    const INPUT: Array<Omit<TaxonSpecies, 'id'>> = [{
      idArbimon: 2757,
      slug: 'eudynamys-melanorhynchus',
      taxonClassId: BIRDS_ID,
      scientificName: 'Eudynamys melanorhynchus'
    },
    {
      idArbimon: 2758,
      slug: 'eudynamys-cyanocephalus',
      taxonClassId: BIRDS_ID,
      scientificName: 'Eudynamys cyanocephalus'
    }]

    // Act
    await writeSpeciesToBio(INPUT, biodiversitySequelize)

    // Assert
    const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findAll({
      where: {
        idArbimon: { [Op.in]: INPUT.map(i => i.idArbimon) }
      }
    })
    expect(species.length).toBe(INPUT.length)
  })

  test('can update taxon species (slug, taxonClassId, scientificName)', async () => {
    // Arrange
    const INPUT: Omit<TaxonSpecies, 'id'> = {
      idArbimon: 2759,
      slug: 'eudynamys-taitensis',
      taxonClassId: BIRDS_ID,
      scientificName: 'Eudynamys taitensis'
    }

    const UPDATED_SLUG = 'eudynamys-taitensis-updated'
    const UPDATED_NAME = 'Eudynamys taitensis updated'
    const UPDATED_TAXON_CLASS_ID = rawTaxonClasses[4].id

    await writeSpeciesToBio([INPUT], biodiversitySequelize)

    // Act
    await writeSpeciesToBio([
      { ...INPUT, slug: UPDATED_SLUG, scientificName: UPDATED_NAME, taxonClassId: UPDATED_TAXON_CLASS_ID }
    ], biodiversitySequelize)

    // Assert
    const updatedTaxonSpecies = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findOne({ where: { idArbimon: INPUT.idArbimon } })
    expect(updatedTaxonSpecies?.slug).toBe(UPDATED_SLUG)
    expect(updatedTaxonSpecies?.taxonClassId).toBe(UPDATED_TAXON_CLASS_ID)
    expect(updatedTaxonSpecies?.scientificName).toBe(UPDATED_NAME)
  })

  test('skip species with not unique slug', async () => {
    // Arrange
    const INPUT: Array<Omit<TaxonSpecies, 'id'>> = [{
      idArbimon: 2760,
      slug: 'eudynamys-melanorhynchus-test',
      taxonClassId: BIRDS_ID,
      scientificName: 'Eudynamys melanorhynchus test'
    },
    {
      idArbimon: 2761,
      slug: 'eudynamys-melanorhynchus-test',
      taxonClassId: BIRDS_ID,
      scientificName: 'Eudynamys melanorhynchus test'
    }]

    const IDS_ARBIMON = [2760, 2761]

    // Act
    await writeSpeciesToBio(INPUT, biodiversitySequelize)

    // Assert
    const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findAll({ where: { idArbimon: IDS_ARBIMON } })
    expect(species.length).toBe(1)
  })
})
