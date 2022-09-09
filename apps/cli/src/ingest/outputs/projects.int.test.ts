import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import { writeProjectsToBio } from './projects'
import { ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'
import { Project, ProjectVersion, Site, SyncLogByProject } from '@rfcx-bio/common/dao/types'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > projects', () => {
  beforeEach(async () => {
    await deleteOutputProjects(biodiversitySequelize)
  })
  const projectInput: Omit<ProjectArbimon, 'id'> = {
    idCore: '807cuoi3cv99',
    idArbimon: 9999,
    slug: 'rfcx-99',
    name: 'RFCx 99',
    latitudeNorth: 1,
    latitudeSouth: 1,
    longitudeEast: 1,
    longitudeWest: 1,
    deletedAt: null
  }
  test('can perform with 0 project', async () => {
    // Arrange
    const input: Array<Omit<ProjectArbimon, 'id'>> = []

    // Act
    await writeProjectsToBio(input, biodiversitySequelize)

    // Assert
    const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll()
    expect(projects.length).toBe(input.length)
  })

  test('can write new project', async () => {
    // Arrange
    const idsArbimon = [9998, 9999]

    // Act
    await writeProjectsToBio([
      projectInput,
      { ...projectInput, idCore: '807cuoi3cv98', idArbimon: 9998, slug: 'rfcx-98', name: 'RFCx 98' }
    ], biodiversitySequelize)

    // Assert
    const projects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({
      where: {
        idArbimon: { [Op.in]: idsArbimon }
      }
    })
    expect(projects.length).toBe(idsArbimon.length)
  })

  test('can update project (Name, Slug, IdCore)', async () => {
    // Act
    await writeProjectsToBio([{ ...projectInput, idCore: '807cuoi3cvwx', idArbimon: 9999, slug: 'rfcx-99-1', name: 'RFCx 99-1' }], biodiversitySequelize)

    // Assert
    const [updatedProject] = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({ where: { idArbimon: 9999 } })

    expect([updatedProject]).toHaveLength(1)
    expect(updatedProject?.name).toBe('RFCx 99-1')
    expect(updatedProject?.slug).toBe('rfcx-99-1')
    expect(updatedProject?.idCore).toBe('807cuoi3cvwx')
  })

  test('can remove project data', async () => {
    // Arrange
    // Write project
    await writeProjectsToBio([
      { ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx 10000' }
    ], biodiversitySequelize)

    // Check project
    const newProject = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: 10000 } }) as Project
    expect(newProject).toBeDefined()

    // Write project data
    const testProjectVersion: ProjectVersion = {
      id: 111,
      locationProjectId: newProject.id,
      isPublished: true,
      isPublic: true
    }
    const testSyncLogProject: Omit<SyncLogByProject, 'createdAt' | 'updatedAt'> = {
      id: 1,
      locationProjectId: newProject.id,
      syncSourceId: 100,
      syncDataTypeId: 100,
      delta: 1
    }
    const testSites: Site[] = [
      {
        id: 100,
        idCore: 'testSite0001',
        idArbimon: 101,
        locationProjectId: newProject.id,
        name: 'Test Site 1',
        latitude: 18.31307,
        longitude: -65.24878,
        altitude: 30.85246588
      },
      {
        id: 102,
        idCore: 'testSite0002',
        idArbimon: 102,
        locationProjectId: newProject.id,
        name: 'Test Site 2',
        latitude: 18.32567,
        longitude: -65.25421,
        altitude: 20.12366
      }
    ]

    const newVersion = await ModelRepository.getInstance(biodiversitySequelize).ProjectVersion.bulkCreate([testProjectVersion])
    const newLog = await ModelRepository.getInstance(biodiversitySequelize).SyncLogByProject.bulkCreate([testSyncLogProject])
    const newProjectSites = await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate(testSites)
    expect(newVersion).toBeDefined()
    expect(newLog).toBeDefined()
    expect(newProjectSites).toBeDefined()

    // Act
    await writeProjectsToBio([{ ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx 10000', deletedAt: '2022-08-29T16:00:00.000Z' }], biodiversitySequelize)

    // Assert
    const deletedVersion = await ModelRepository.getInstance(biodiversitySequelize).ProjectVersion.findOne({ where: { locationProjectId: newProject.id } })
    const deletedLog = await ModelRepository.getInstance(biodiversitySequelize).SyncLogByProject.findOne({ where: { locationProjectId: newProject.id } })
    const deletedProjectSites = await ModelRepository.getInstance(biodiversitySequelize).LocationSite.findAll({ where: { locationProjectId: newProject.id } })
    const deletedProject = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: 10000 } })
    expect(deletedVersion).toBe(null)
    expect(deletedLog).toBe(null)
    expect(deletedProjectSites).toHaveLength(0)
    expect(deletedProject).toBe(null)
  })

  test('can remove one project and update another one', async () => {
    // Arrange
    const where = { idArbimon: { [Op.in]: [10000, 10001] } }

    // Act
    await writeProjectsToBio([
      { ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx 10000' },
      { ...projectInput, idCore: '807cuoi3cv12', idArbimon: 10001, slug: 'rfcx-10001', name: 'RFCx 10001'}
    ], biodiversitySequelize)

    // Assert
    const newProjects = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({ where })
    expect(newProjects).toHaveLength(2)

    await writeProjectsToBio([
      { ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx project deleted', deletedAt: '2022-08-29T16:00:00.000Z' },
      { ...projectInput, idCore: '807cuoi3cv12', idArbimon: 10001, slug: 'rfcx-10001', name: 'RFCx project updated'}
    ], biodiversitySequelize)

    const [result] = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findAll({ where })
    expect([result]).toHaveLength(1)
    expect(result.name).toBe('RFCx project updated')
  })
})
