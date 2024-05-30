import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Project, type Site, type SyncLogByProject, type TaxonSpecies } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import { type ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'
import { type SpeciesCallArbimon } from '../parsers/parse-species-call-arbimon-to-bio'
import { writeProjectsToBio } from './projects'
import { writeSpeciesCallsToBio } from './species-calls'

const biodiversitySequelize = getSequelize()
const models = ModelRepository.getInstance(biodiversitySequelize)

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
    isPrivate: 1,
    updatedAt: new Date(),
    deletedAt: null
  }
  test('can perform with 0 project', async () => {
    // Arrange
    const input: Array<Omit<ProjectArbimon, 'id'>> = []

    // Act
    await writeProjectsToBio(input, biodiversitySequelize)

    // Assert
    const projects = await models.LocationProject.findAll()
    expect(projects).toHaveLength(input.length)
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
    const projects = await models.LocationProject.findAll({
      where: {
        idArbimon: { [Op.in]: idsArbimon }
      }
    })
    expect(projects).toHaveLength(idsArbimon.length)
  })

  test('can update project (name, slug, idCore)', async () => {
    // Act
    await writeProjectsToBio([{ ...projectInput, idCore: '807cuoi3cvwx', idArbimon: 9999, slug: 'rfcx-99-1', name: 'RFCx 99-1' }], biodiversitySequelize)

    // Assert
    const [updatedProject] = await models.LocationProject.findAll({ where: { idArbimon: 9999 } })

    expect([updatedProject]).toHaveLength(1)
    expect(updatedProject?.name).toBe('RFCx 99-1')
    expect(updatedProject?.slug).toBe('rfcx-99-1')
    expect(updatedProject?.idCore).toBe('807cuoi3cvwx')
  })

  test('can remove related project data - version, log, sites, species calls', async () => {
    // Arrange
    // Write project
    await writeProjectsToBio([
      { ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx 10000' }
    ], biodiversitySequelize)

    // Check project
    const newProject = await models.LocationProject.findOne({ where: { idArbimon: 10000 } }) as Project
    expect(newProject).toBeDefined()

    // Write project data
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
        altitude: 30.85246588,
        countryCode: 'TH'
      },
      {
        id: 102,
        idCore: 'testSite0002',
        idArbimon: 102,
        locationProjectId: newProject.id,
        name: 'Test Site 2',
        latitude: 18.32567,
        longitude: -65.25421,
        altitude: 20.12366,
        countryCode: 'TH'
      }
    ]

    // Batch species if it takes
    const SPECIES_INPUT: Omit<TaxonSpecies, 'id'> = {
      idArbimon: 1050,
      slug: 'falco-amurensis',
      taxonClassId: 300,
      scientificName: 'Falco amurensis'
    }

    const species = await models.TaxonSpecies.findOne({ where: { idArbimon: SPECIES_INPUT.idArbimon } })

    if (!species) await models.TaxonSpecies.bulkCreate([SPECIES_INPUT])

    const SPECIES_CALL_INPUT: SpeciesCallArbimon[] = [{
      taxonSpeciesId: 1050,
      callProjectId: newProject.id,
      projectSlugArbimon: 'rfcx-1',
      callSiteId: testSites[1].id,
      callRecordedAt: '2020-12-06 03:06:19',
      start: 75.24309455587392,
      end: 80.86693409742121,
      siteIdCore: 'cydwrzz91cbz',
      callType: 'Common Song',
      recordingId: 7047505,
      callTimezone: 'Asia/Bangkok',
      updatedAt: '2022-03-22 07:31:11',
      idArbimon: 980
    }]

    await writeSpeciesCallsToBio(SPECIES_CALL_INPUT, biodiversitySequelize)

    const newLog = await models.SyncLogByProject.bulkCreate([testSyncLogProject])
    const newProjectSites = await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate(testSites)
    expect(newLog).toBeDefined()
    expect(newProjectSites).toBeDefined()

    // Act
    // Add project deleted_at attribute
    await writeProjectsToBio([{ ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx 10000', deletedAt: '2022-08-29T16:00:00.000Z' }], biodiversitySequelize)

    // Assert
    const deletedLog = await models.SyncLogByProject.findOne({ where: { locationProjectId: newProject.id } })
    const deletedSpeciesCall = await models.TaxonSpeciesCall.findOne({ where: { callProjectId: newProject.id } })
    const deletedProjectSites = await models.LocationSite.findAll({ where: { locationProjectId: newProject.id } })
    const deletedProject = await models.LocationProject.findOne({ where: { idArbimon: 10000 } })
    expect(deletedLog).toBe(null)
    expect(deletedSpeciesCall).toBe(null)
    expect(deletedProjectSites).toHaveLength(0)
    expect(deletedProject).toBe(null)
  })

  test('can remove one project and update another one', async () => {
    // Arrange
    const where = { idArbimon: { [Op.in]: [10000, 10001] } }

    // Act
    await writeProjectsToBio([
      { ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx 10000' },
      { ...projectInput, idCore: '807cuoi3cv12', idArbimon: 10001, slug: 'rfcx-10001', name: 'RFCx 10001' }
    ], biodiversitySequelize)

    // Assert
    const newProjects = await models.LocationProject.findAll({ where })
    expect(newProjects).toHaveLength(2)

    await writeProjectsToBio([
      { ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx project deleted', deletedAt: '2022-08-29T16:00:00.000Z' },
      { ...projectInput, idCore: '807cuoi3cv12', idArbimon: 10001, slug: 'rfcx-10001', name: 'RFCx project updated' }
    ], biodiversitySequelize)

    const [result] = await models.LocationProject.findAll({ where })
    expect([result]).toHaveLength(1)
    expect(result.name).toBe('RFCx project updated')
  })

  test('can remove the project and does not invoke the issue if the deleted project is synced again', async () => {
    // Arrange
    const where = { idArbimon: { [Op.in]: [10000] } }

    // Act
    await writeProjectsToBio([
      { ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx 10000' }
    ], biodiversitySequelize)

    const newProjects = await models.LocationProject.findAll({ where })
    expect(newProjects).toHaveLength(1)

    await writeProjectsToBio([
      { ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx project deleted', deletedAt: '2022-08-29T16:00:00.000Z' }
    ], biodiversitySequelize)

    const result = await models.LocationProject.findAll()
    expect(result).toHaveLength(0)

    await writeProjectsToBio([
      { ...projectInput, idCore: '807cuoi3cv11', idArbimon: 10000, slug: 'rfcx-10000', name: 'RFCx project deleted', deletedAt: '2022-08-29T19:00:00.000Z' }
    ], biodiversitySequelize)

    // Assert
    const result2 = await models.LocationProject.findAll()
    expect(result2).toHaveLength(0)
  })

  test('can write new project with private version', async () => {
    // Arrange
    const arbimonProject = { ...projectInput, idCore: '807cuoi3cv96', idArbimon: 9996, slug: 'rfcx-96', name: 'RFCx 96' }

    // Act
    await writeProjectsToBio([arbimonProject], biodiversitySequelize)

    // Assert
    const project = await models.LocationProject.findOne({ where: { idArbimon: arbimonProject.idArbimon } })
    expect(project).not.toBeNull()
    expect(project?.status).toBe('unlisted')
  })

  test('can write new project with public version', async () => {
    // Arrange
    const arbimonProject = { ...projectInput, idCore: '807cuoi3cv96', idArbimon: 9996, slug: 'rfcx-96', name: 'RFCx 96', isPrivate: 0 }

    // Act
    await writeProjectsToBio([arbimonProject], biodiversitySequelize)

    // Assert
    const project = await models.LocationProject.findOne({ where: { idArbimon: arbimonProject.idArbimon } })
    expect(project).not.toBeNull()
    expect(project?.status).toBe('published')
  })

  test.skip('can update project from unlisted to listed', async () => {
    // Arrange
    const arbimonProject = { ...projectInput, idCore: '807cuoi3cv95', idArbimon: 9995, slug: 'rfcx-95', name: 'RFCx 95' }
    await writeProjectsToBio([arbimonProject], biodiversitySequelize)
    // TODO: add at least 1000 recordings

    // Act
    await writeProjectsToBio([{ ...arbimonProject, isPrivate: 0 }], biodiversitySequelize)

    // Assert
    const project = await models.LocationProject.findOne({ where: { idArbimon: arbimonProject.idArbimon } })
    expect(project?.status).toBe('listed')
  })
})
