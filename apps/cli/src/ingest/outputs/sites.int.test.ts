import { Op } from 'sequelize'
import { beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Site } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import { writeSitesToBio } from './sites'

const biodiversitySequelize = await getSequelize()

const SQL_INSERT_PROJECT = `
  INSERT INTO location_project (id, id_core, id_arbimon, name, slug, latitude_north, latitude_south, longitude_east, longitude_west, created_at, updated_at)
  VALUES ($id, $idCore, $idArbimon, $name, $slug, $latitudeNorth, $latitudeSouth, $longitudeEast, $longitudeWest, $createdAt, $updatedAt);
`

const DEFAULT_PROJECT = { id: 1, idCore: '807cuoi3cvwx', idArbimon: 1920, name: 'RFCx 1', slug: 'rfcx-1', latitudeNorth: 1, latitudeSouth: 1, longitudeEast: 1, longitudeWest: 1, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z' }
const DEFAULT_SITE = { idCore: '807cuoi3cvwx', idArbimon: 9999, locationProjectId: 1, name: 'RFCx 99', latitude: 1, longitude: 1, altitude: 1, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z' }

describe('ingest > outputs > sites', () => {
  describe('ingest sites when project is exist', () => {
    beforeEach(async () => {
      // remove all data related to project
      await deleteOutputProjects(biodiversitySequelize)
      // add 1 project
      await biodiversitySequelize.query(SQL_INSERT_PROJECT, { bind: DEFAULT_PROJECT })
    })

    test('can write new site', async () => {
      // Arrange
      // prepare site
      const input: Array<Omit<Site, 'id'>> = [
        DEFAULT_SITE,
        {
          idCore: '807cuoi3cv98',
          idArbimon: 9998,
          locationProjectId: 1,
          name: 'RFCx 98',
          latitude: 1,
          longitude: 1,
          altitude: 1
        }
      ]

      // Act
      // insert site
      await writeSitesToBio(input, biodiversitySequelize)

      // Assert
      const sites = await ModelRepository.getInstance(biodiversitySequelize).LocationSite.findAll({
        where: {
          idArbimon: { [Op.in]: input.map(i => i.idArbimon) }
        }
      })
      expect(sites.length).toBe(input.length)
    })

    test('can update site (Name, IdCore, Latitude, Longitude)', async () => {
      // Arrange
      await writeSitesToBio([DEFAULT_SITE], biodiversitySequelize)
      const inputUpdatedSite = {
        ...DEFAULT_SITE,
        name: 'RFCx 99-1',
        idCore: '807cuoi3cv9s',
        latitude: 2,
        longitude: 2,
        altitude: 2
      }
      // Act
      await writeSitesToBio([inputUpdatedSite], biodiversitySequelize)

      // Assert
      const updatedSite = await ModelRepository.getInstance(biodiversitySequelize).LocationSite
        .findOne({ where: { idArbimon: inputUpdatedSite.idArbimon } })
      expect(updatedSite?.name).toBe(inputUpdatedSite.name)
      expect(updatedSite?.idCore).toBe(inputUpdatedSite.idCore)
      expect(updatedSite?.latitude).toBe(inputUpdatedSite.latitude)
      expect(updatedSite?.longitude).toBe(inputUpdatedSite.longitude)
      expect(updatedSite?.altitude).toBe(inputUpdatedSite.altitude)
    })
  })
})
