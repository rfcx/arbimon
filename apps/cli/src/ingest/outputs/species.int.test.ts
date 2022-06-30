import { Op } from 'sequelize'
import { describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { writeSpeciesToBio } from './species'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > taxon species', () => {
  test('can write new taxon species', async () => {
    // Arrange
    const input: Array<Omit<TaxonSpecies, 'id'>> = [{
      idArbimon: 2757,
      slug: 'eudynamys-melanorhynchus',
      taxonClassId: 300,
      scientificName: 'Eudynamys melanorhynchus'
    },
    {
      idArbimon: 2758,
      slug: 'eudynamys-cyanocephalus',
      taxonClassId: 300,
      scientificName: 'Eudynamys cyanocephalus'
    }]

    // Act
    await writeSpeciesToBio(input, biodiversitySequelize)

    // Assert
    const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findAll({
      where: {
        idArbimon: { [Op.in]: input.map(i => i.idArbimon) }
      }
    })
    expect(species.length).toBe(input.length)
  })

  test('can update taxon species (slug, taxonClassId, scientificName)', async () => {
    // Arrange
    const inputItem: Omit<TaxonSpecies, 'id'> = {
      idArbimon: 2759,
      slug: 'eudynamys-taitensis',
      taxonClassId: 300,
      scientificName: 'Eudynamys taitensis'
    }

    const updatedScientificName = 'Eudynamys taitensis updated'

    await writeSpeciesToBio([inputItem], biodiversitySequelize)

    // Act
    await writeSpeciesToBio([{ ...inputItem, scientificName: updatedScientificName }], biodiversitySequelize)

    // Assert
    const updatedTaxonSpecies = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findOne({ where: { idArbimon: inputItem.idArbimon } })
    expect(updatedTaxonSpecies?.slug).toBe(inputItem.slug)
    expect(updatedTaxonSpecies?.taxonClassId).toBe(inputItem.taxonClassId)
    expect(updatedTaxonSpecies?.scientificName).toBe(updatedScientificName)
  })
})
