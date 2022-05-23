import { describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { writeProjectsToBio } from './projects'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > projects', () => {
  test('can write new project', async () => {
    // Arrange
    const numberOfSeededProjects = 5
    const input: Array<Omit<Project, 'id'>> = [{
      idCore: '807cuoi3cvw0',
      idArbimon: 1920,
      slug: 'rfcx-1',
      name: 'RFCx 1'
    },
    {
      idCore: '807cuoi3cvw1',
      idArbimon: 1921,
      slug: 'rfcx-2',
      name: 'RFCx 2'
    }]

    // Act
    await writeProjectsToBio(biodiversitySequelize, input)

    // Assert
    const projects = await ModelRepository.getInstance(biodiversitySequelize).Project.findAll()
    expect(projects.length).toBe(numberOfSeededProjects + 2)
    expect(projects[projects.length - 2].idArbimon).toBe(input[0].idArbimon)
    expect(projects[projects.length - 1].idArbimon).toBe(input[1].idArbimon)
  })

  test('can update project (Name, Slug, IdCore)', async () => {
    // Arrange
    const inputItem: Omit<Project, 'id'> = {
      idCore: '807cuoi3cvwx',
      idArbimon: 1920,
      slug: 'rfcx-11',
      name: 'RFCx 11'
    }

    // Act
    await writeProjectsToBio(biodiversitySequelize, [inputItem])

    // Assert
    const updatedProject = await ModelRepository.getInstance(biodiversitySequelize).Project.findOne({ where: { idArbimon: inputItem.idArbimon } })
    expect(updatedProject?.name).toBe(inputItem.name)
    expect(updatedProject?.slug).toBe(inputItem.slug)
    expect(updatedProject?.idCore).toBe(inputItem.idCore)
  })
})
