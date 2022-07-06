import { Op } from 'sequelize'
import { describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import { writeProjectsToBio } from './projects'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > projects', () => {
  test('can perform with 0 project', async () => {
    // Arrange
    await deleteOutputProjects(biodiversitySequelize)
    const input: Array<Omit<Project, 'id'>> = []

    // Act
    await writeProjectsToBio(input, biodiversitySequelize)

    // Assert
    const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll()
    expect(projects.length).toBe(input.length)
  })

  test('can write new project', async () => {
    // Arrange
    const input: Array<Omit<Project, 'id'>> = [{
      idCore: '807cuoi3cv99',
      idArbimon: 9999,
      slug: 'rfcx-99',
      name: 'RFCx 99',
      latitudeNorth: 1,
      latitudeSouth: 1,
      longitudeEast: 1,
      longitudeWest: 1
    },
    {
      idCore: '807cuoi3cv98',
      idArbimon: 9998,
      slug: 'rfcx-98',
      name: 'RFCx 98',
      latitudeNorth: 1,
      latitudeSouth: 1,
      longitudeEast: 1,
      longitudeWest: 1
    }]

    // Act
    await writeProjectsToBio(input, biodiversitySequelize)

    // Assert
    const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
      where: {
        idArbimon: { [Op.in]: input.map(i => i.idArbimon) }
      }
    })
    expect(projects.length).toBe(input.length)
  })

  test('can update project (Name, Slug, IdCore)', async () => {
    // Arrange
    const inputItem: Omit<Project, 'id'> = {
      idCore: '807cuoi3cvwx',
      idArbimon: 9999,
      slug: 'rfcx-99-1',
      name: 'RFCx 99-1',
      latitudeNorth: 1,
      latitudeSouth: 1,
      longitudeEast: 1,
      longitudeWest: 1
    }

    // Act
    await writeProjectsToBio([inputItem], biodiversitySequelize)

    // Assert
    const updatedProject = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: inputItem.idArbimon } })
    expect(updatedProject?.name).toBe(inputItem.name)
    expect(updatedProject?.slug).toBe(inputItem.slug)
    expect(updatedProject?.idCore).toBe(inputItem.idCore)
  })
})
