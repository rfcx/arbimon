import { Op } from 'sequelize'
import { describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectSpecies, Project, TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { rawTaxonClasses } from '@/db/seeders/_data/taxon-class'
import { writeProjectSpeciesToBio } from './project-species'
import { writeProjectsToBio } from './projects'
import { writeSpeciesToBio } from './species'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > project species', async () => {
  const PROJECT_INPUT: Array<Omit<Project, 'id'>> = [{
    idCore: '807cuoi3cv99',
    idArbimon: 9999,
    slug: 'rfcx-99',
    name: 'RFCx 99',
    latitudeNorth: 1,
    latitudeSouth: 1,
    longitudeEast: 1,
    longitudeWest: 1
  }]

  await writeProjectsToBio(PROJECT_INPUT, biodiversitySequelize)

  const PROJECT = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({
    where: {
      idArbimon: 9999
    }
  })

  if (PROJECT?.id === undefined) return

  const BIRDS_ID = rawTaxonClasses[3].id

  const SPECIES_INPUT: Array<Omit<TaxonSpecies, 'id'>> = [{
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

  await writeSpeciesToBio(SPECIES_INPUT, biodiversitySequelize)

  const SPECIES = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findAll({
    where: {
      idArbimon: { [Op.in]: [2757, 2758] }
    }
  })

  const PROJECT_SPECIES_INPUT: LocationProjectSpecies[] = [{
    locationProjectId: PROJECT.id,
    taxonSpeciesId: SPECIES[0].id
  },
  {
    locationProjectId: PROJECT.id,
    taxonSpeciesId: SPECIES[1].id
  }]

  test('can write new project species', async () => {
    // Act
    await writeProjectSpeciesToBio(PROJECT_SPECIES_INPUT, biodiversitySequelize)

    // Assert
    const projectClasses = await ModelRepository.getInstance(biodiversitySequelize).LocationProjectSpecies.findAll({
      where: {
        locationProjectId: PROJECT.id
      }
    })
    expect(projectClasses.length).toBe(PROJECT_SPECIES_INPUT.length)
  })

  test('fail for duplicate project species', async () => {
    // Act
    await writeProjectSpeciesToBio([PROJECT_SPECIES_INPUT[0]], biodiversitySequelize)

    // Assert
    const projectClasses = await ModelRepository.getInstance(biodiversitySequelize).LocationProjectSpecies.findAll({ where: { locationProjectId: PROJECT.id } })
    expect(projectClasses.length).toBe(PROJECT_SPECIES_INPUT.length)
  })
})
