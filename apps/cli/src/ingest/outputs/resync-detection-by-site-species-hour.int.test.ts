import { sum } from 'lodash-es'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Project, type Site, type TaxonSpecies } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import { type DetectionArbimon } from '../parsers/parse-detection-arbimon-to-bio'
import { mapDetectionBySiteSpeciesHourArbimonWithPrevSync, writeDetectionBySiteSpeciesHourToBio } from './resync-detection-by-site-species-hour'

const biodiversitySequelize = getSequelize()

describe('ingest > output > resync detection by site, species, hour', () => {
  beforeAll(async () => {
    // Delete detections before tests
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon=1050')
    await deleteOutputProjects(biodiversitySequelize)

    const PROJECT_INPUT: Omit<Project, 'id'> = {
      idArbimon: 1920,
      idCore: '807cuoi3cvw0',
      slug: 'rfcx-1',
      name: 'rfcx 1',
      latitudeNorth: 0,
      latitudeSouth: 0,
      longitudeEast: 0,
      longitudeWest: 0
    }

    // Batch project data before tests
    await ModelRepository.getInstance(biodiversitySequelize).LocationProject.bulkCreate([PROJECT_INPUT])
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: PROJECT_INPUT.idArbimon } })

    // Batch site data
    const SITE_INPUT: Omit<Site, 'id'> = {
      idCore: 'cydwrzz91cbz',
      idArbimon: 88528,
      locationProjectId: project?.id ?? -1,
      name: 'Site 3',
      latitude: 16.742010693566815,
      longitude: 100.1923308193772,
      altitude: 0.0
    }
    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([SITE_INPUT])

    // Batch species if it takes
    const SPECIES_INPUT: Omit<TaxonSpecies, 'id'> = {
      idArbimon: 1050,
      slug: 'falco-amurensis',
      taxonClassId: 300,
      scientificName: 'Falco amurensis'
    }

    await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate([SPECIES_INPUT])
  })

  afterAll(async () => {
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon=1050')
    await deleteOutputProjects(biodiversitySequelize)
  })

  const DETECTION_INPUT: DetectionArbimon = {
    idArbimon: 2391043,
    datetime: '2020-12-06 10:06:19',
    siteId: 88528,
    recordingDuration: 20,
    speciesId: 1050,
    present: 1,
    presentReview: 0,
    presentAed: 0,
    updatedAt: '2022-01-03T01:00:00.000Z'
  }

  // ------------ Group detection by site species hour ----------

  test('can group first detection by site species hour', async () => {
    // Act
    const detectionBySiteSpeciesHour = await mapDetectionBySiteSpeciesHourArbimonWithPrevSync([DETECTION_INPUT], biodiversitySequelize)
    // Assert
    expect(detectionBySiteSpeciesHour).toHaveLength(1)
    expect(detectionBySiteSpeciesHour[0].countsByMinute).toEqual([[6, 1]])
    expect(detectionBySiteSpeciesHour[0].count).toEqual(1)
    expect(dayjs(detectionBySiteSpeciesHour[0].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T10:00:00.000Z'))
  })

  test('can group next detection by site species hour', async () => {
    // Arrange
    const NEW_DETECTION: DetectionArbimon[] = [
      {
        idArbimon: 2391043,
        datetime: '2020-12-06 10:07:00',
        siteId: 88528,
        recordingDuration: 90.24,
        speciesId: 1050,
        present: 1,
        presentReview: 1,
        presentAed: 0,
        updatedAt: '2022-01-03T01:10:00.000Z'
      },
      {
        idArbimon: 2391043,
        datetime: '2020-12-08 18:00:00',
        siteId: 88528,
        recordingDuration: 90.24,
        speciesId: 1050,
        present: 1,
        presentReview: 1,
        presentAed: 0,
        updatedAt: '2022-01-03T01:10:00.000Z'
      }
    ]

    // Act
    const detectionBySiteSpeciesHour = await mapDetectionBySiteSpeciesHourArbimonWithPrevSync(NEW_DETECTION, biodiversitySequelize)

    // Assert
    expect(detectionBySiteSpeciesHour).toHaveLength(2)
    expect(dayjs(detectionBySiteSpeciesHour[0].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T10:00:00.000Z'))
    expect(dayjs(detectionBySiteSpeciesHour[1].timePrecisionHourLocal)).toEqual(dayjs('2020-12-08T18:00:00.000Z'))
    expect(detectionBySiteSpeciesHour[0].countsByMinute).toEqual([[6, 1], [7, 1]])
    expect(detectionBySiteSpeciesHour[1].countsByMinute).toEqual([[0, 1]])
    expect(sum(detectionBySiteSpeciesHour.map(item => item.count))).toBe(3)
  })

  test('can group new recordings by site hour for different sites', async () => {
    // Arrange
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: 1920 } })
    // Batch site data
    const SITE_INPUT: Omit<Site, 'id'> = {
      idCore: 'cydwrzz91yyy',
      idArbimon: 88530,
      locationProjectId: project?.id ?? -1,
      name: 'Site 4',
      latitude: 16.742010693566815,
      longitude: 100.1923308193772,
      altitude: 0.0
    }
    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([SITE_INPUT])

    const NEW_DETECTION: DetectionArbimon[] = [
      {
        idArbimon: 2391043,
        datetime: '2020-12-06 09:00:00',
        siteId: 88530,
        recordingDuration: 30,
        speciesId: 1050,
        present: 1,
        presentReview: 0,
        presentAed: 0,
        updatedAt: '2022-01-03T01:00:00.000Z'
      },
      {
        idArbimon: 2391043,
        datetime: '2020-12-06 09:00:30',
        siteId: 88530,
        recordingDuration: 30,
        speciesId: 1050,
        present: 1,
        presentReview: 0,
        presentAed: 0,
        updatedAt: '2022-01-03T01:00:00.000Z'
      }
    ]

    // Act
    const detectionBySiteSpeciesHour = await mapDetectionBySiteSpeciesHourArbimonWithPrevSync(NEW_DETECTION, biodiversitySequelize)
    // Assert
    expect(detectionBySiteSpeciesHour).toHaveLength(3)
    expect(dayjs(detectionBySiteSpeciesHour[0].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T10:00:00.000Z'))
    expect(dayjs(detectionBySiteSpeciesHour[1].timePrecisionHourLocal)).toEqual(dayjs('2020-12-08T18:00:00.000Z'))
    expect(dayjs(detectionBySiteSpeciesHour[2].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T09:00:00.000Z'))
    expect(detectionBySiteSpeciesHour[0].countsByMinute).toEqual([[6, 1], [7, 1]])
    expect(detectionBySiteSpeciesHour[1].countsByMinute).toEqual([[0, 1]])
    expect(detectionBySiteSpeciesHour[2].countsByMinute).toEqual([[0, 2]])
    expect(sum(detectionBySiteSpeciesHour.map(item => item.count))).toBe(4)
  })

  test('can count overlapping detections in the same batch', async () => {
    // Arrange
    const overlappingDetection = { ...DETECTION_INPUT, idArbimon: 2391044 }

    // Act
    const detectionBySiteSpeciesHour = await mapDetectionBySiteSpeciesHourArbimonWithPrevSync([overlappingDetection], biodiversitySequelize)

    // Assert
    expect(detectionBySiteSpeciesHour).toHaveLength(3)
    expect(dayjs(detectionBySiteSpeciesHour[0].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T10:00:00.000Z'))
    expect(detectionBySiteSpeciesHour[0].countsByMinute).toEqual([[6, 2], [7, 1]])
    expect(sum(detectionBySiteSpeciesHour.map(item => item.count))).toBe(4)
  })

  test.todo('can count duplicate/overlapping detections in the different batches', async () => {
    // Arrange
    const NEW_DETECTION: DetectionArbimon[] = [
      {
        idArbimon: 2391043,
        datetime: '2020-12-06 18:00:00',
        siteId: 88530,
        recordingDuration: 30,
        speciesId: 1050,
        present: 1,
        presentReview: 0,
        presentAed: 0,
        updatedAt: '2022-01-03T01:00:00.000Z'
      },
      {
        idArbimon: 2391043,
        datetime: '2020-12-06 18:00:30',
        siteId: 88530,
        recordingDuration: 30,
        speciesId: 1050,
        present: 1,
        presentReview: 0,
        presentAed: 0,
        updatedAt: '2022-01-03T01:00:00.000Z'
      }
    ]

    // Act
    const detectionBySiteSpeciesHour = await mapDetectionBySiteSpeciesHourArbimonWithPrevSync(NEW_DETECTION, biodiversitySequelize)

    // Assert
    expect(detectionBySiteSpeciesHour).toHaveLength(4)
    expect(dayjs(detectionBySiteSpeciesHour[3].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T18:00:00.000Z'))
    expect(detectionBySiteSpeciesHour[3].countsByMinute).toEqual([[18, 2]])
    expect(sum(detectionBySiteSpeciesHour.map(item => item.count))).toBe(5)
  })

  // ------------ Write recordings by by site hour ----------

  test.todo('can write grouped recordings to the bio db', async () => {
    // Arrange
    const NEW_DETECTION = [
      {
        idArbimon: 2391043,
        datetime: '2020-12-06 20:00:30',
        siteId: 88530,
        recordingDuration: 30,
        speciesId: 1050,
        present: 1,
        presentReview: 0,
        presentAed: 0,
        updatedAt: '2022-01-03T01:00:00.000Z'
      }
    ]

    // Act
    const detectionBySiteSpeciesHour = await mapDetectionBySiteSpeciesHourArbimonWithPrevSync(NEW_DETECTION, biodiversitySequelize)
    await writeDetectionBySiteSpeciesHourToBio(detectionBySiteSpeciesHour, biodiversitySequelize)
    const detectionBySiteSpeciesHourBio = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    // Assert
    expect(detectionBySiteSpeciesHourBio).toHaveLength(5)
    expect(dayjs(detectionBySiteSpeciesHourBio[0].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T10:00:00.000Z'))
    expect(dayjs(detectionBySiteSpeciesHourBio[1].timePrecisionHourLocal)).toEqual(dayjs('2020-12-08T18:00:00.000Z'))
    expect(dayjs(detectionBySiteSpeciesHourBio[2].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T09:00:00.000Z'))
    expect(dayjs(detectionBySiteSpeciesHourBio[3].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T18:00:00.000Z'))
    expect(dayjs(detectionBySiteSpeciesHourBio[4].timePrecisionHourLocal)).toEqual(dayjs('2020-12-06T20:00:00.000Z'))
    expect(detectionBySiteSpeciesHour[0].countsByMinute).toEqual([[6, 2], [7, 1]])
    expect(detectionBySiteSpeciesHour[1].countsByMinute).toEqual([[0, 1]])
    expect(detectionBySiteSpeciesHour[2].countsByMinute).toEqual([[0, 2]])
    expect(detectionBySiteSpeciesHour[3].countsByMinute).toEqual([[18, 2]])
    expect(detectionBySiteSpeciesHour[4].countsByMinute).toEqual([[20, 1]])
    expect(sum(detectionBySiteSpeciesHourBio.map(item => item.count))).toBe(6)
  })
})
