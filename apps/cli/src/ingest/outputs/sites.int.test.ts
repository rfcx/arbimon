import { Op } from 'sequelize'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import { SiteArbimon } from '../parsers/parse-site-arbimon-to-bio'
import { writeSitesToBio } from './sites'

const biodiversitySequelize = await getSequelize()

const SQL_INSERT_PROJECT = `
  INSERT INTO location_project (id, id_core, id_arbimon, name, slug, latitude_north, latitude_south, longitude_east, longitude_west, created_at, updated_at)
  VALUES ($id, $idCore, $idArbimon, $name, $slug, $latitudeNorth, $latitudeSouth, $longitudeEast, $longitudeWest, $createdAt, $updatedAt);
`

const DEFAULT_PROJECT = { id: 1, idCore: '807cuoi3cvwx', idArbimon: 1920, name: 'My Project', slug: 'my-project-1', latitudeNorth: 1, latitudeSouth: 1, longitudeEast: 1, longitudeWest: 1, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z' }
const DEFAULT_ARB_SITE = { idCore: '807cuoi3uopi', idArbimon: 9999, projectIdArbimon: DEFAULT_PROJECT.idArbimon, name: 'RFCx 99', latitude: 1, longitude: 1, altitude: 1, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', deletedAt: null }

describe('ingest > outputs > sites', () => {
  beforeEach(async () => {
    await deleteOutputProjects(biodiversitySequelize)
    await biodiversitySequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
  })

  test('can write new site', async () => {
    // Arrange
    const arbimonSites: SiteArbimon[] = [
      DEFAULT_ARB_SITE,
      { ...DEFAULT_ARB_SITE, idCore: '807cuoi3cv98', idArbimon: 9998, name: 'RFCx 98' }
    ]

    // Act
    await writeSitesToBio(arbimonSites, biodiversitySequelize)

    // Assert
    const sites = await ModelRepository.getInstance(biodiversitySequelize).LocationSite.findAll({
      where: { idArbimon: { [Op.in]: arbimonSites.map(i => i.idArbimon) } }
    })
    expect(sites).toHaveLength(arbimonSites.length)
  })

  test('can update site name, core id, latitude, longitude', async () => {
    // Arrange
    await writeSitesToBio([DEFAULT_ARB_SITE], biodiversitySequelize)
    const updatedArbimonSite = {
      ...DEFAULT_ARB_SITE,
      name: 'RFCx 99-1',
      idCore: '807cuoi3cv9s',
      latitude: 2,
      longitude: 2,
      altitude: 2
    }

    // Act
    await writeSitesToBio([updatedArbimonSite], biodiversitySequelize)

    // Assert
    const updatedSite = await ModelRepository.getInstance(biodiversitySequelize).LocationSite
      .findOne({ where: { idArbimon: updatedArbimonSite.idArbimon } })
    expect(updatedSite?.name).toBe(updatedArbimonSite.name)
    expect(updatedSite?.idCore).toBe(updatedArbimonSite.idCore)
    expect(updatedSite?.latitude).toBe(updatedArbimonSite.latitude)
    expect(updatedSite?.longitude).toBe(updatedArbimonSite.longitude)
    expect(updatedSite?.altitude).toBe(updatedArbimonSite.altitude)
  })

  test('can move site to another project', async () => {
    // Arrange
    const newProject = { ...DEFAULT_PROJECT, id: 2, idCore: '807cuoi3cvwx', idArbimon: 1921, slug: 'my-project-2' }
    await biodiversitySequelize.query(SQL_INSERT_PROJECT, { bind: newProject })
    await writeSitesToBio([DEFAULT_ARB_SITE], biodiversitySequelize)
    const updatedArbimonSite = {
      ...DEFAULT_ARB_SITE,
      projectIdArbimon: newProject.idArbimon
    }

    // Act
    await writeSitesToBio([updatedArbimonSite], biodiversitySequelize)

    // Assert
    const updatedSite = await ModelRepository.getInstance(biodiversitySequelize).LocationSite
      .findOne({ where: { idArbimon: updatedArbimonSite.idArbimon } })
    expect(updatedSite?.locationProjectId).toBe(newProject.id)
    // TODO Check that recordings and detections are moved too
  })

  test('log error when project does not exist', async () => {
    // Arrange
    const invalidArbimonSite = { ...DEFAULT_ARB_SITE, projectIdArbimon: 123456 }
    console.info = vi.fn() // Expecting batch insert to fail

    // Act
    const errors = await writeSitesToBio([invalidArbimonSite], biodiversitySequelize)

    // Assert
    const siteInDB = await ModelRepository.getInstance(biodiversitySequelize).LocationSite
      .findOne({ where: { idArbimon: DEFAULT_ARB_SITE.idArbimon } })
    expect(errors.length).toBeGreaterThan(0)
    expect(siteInDB).toBeNull()
    expect(console.info).toHaveBeenCalled()
  })

  test('returns successes and failures array', async () => {
    // Arrange
    const arbimonSites: SiteArbimon[] = [
      DEFAULT_ARB_SITE,
      { ...DEFAULT_ARB_SITE, projectIdArbimon: 123456, idCore: '807cuoi3cv97', idArbimon: 9997, name: 'RFCx 97' },
      { ...DEFAULT_ARB_SITE, idCore: '807cuoi3cv98', idArbimon: 9998, name: 'RFCx 98' }
    ]
    console.info = vi.fn()

    // Act
    const result = await writeSitesToBio(arbimonSites, biodiversitySequelize)

    // Assert
    expect(result).toHaveLength(2)
    const [successes, failures] = result
    expect(successes).toHaveLength(2)
    expect(failures).toHaveLength(1)
  })
})
