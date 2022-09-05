import { beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, Site, TaxonSpecies } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import { DetectionArbimon } from '../parsers/parse-detection-arbimon-to-bio'
import { writeDetectionsToBio } from './detection-by-site-species-hour'

const biodiversitySequelize = await getSequelize()
const DetectionBySiteSpeciesHour = ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour

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

const DETECTION_INPUT: DetectionArbimon = {
  idArbimon: 2391043,
  datetime: '2020-12-06 10:06:19',
  siteId: 88528,
  recordingDuration: 90.24,
  speciesId: 1050,
  present: 1,
  presentReview: 0,
  presentAed: 0,
  updatedAt: '2022-01-03T01:00:00.000Z'
}

describe('ingest > outputs > detection by site species hour', async () => {
  beforeEach(async () => {
    // Delete detections before tests
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon=1050')
    await deleteOutputProjects(biodiversitySequelize)

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

  test('can write a single new detection', async () => {
    // Act
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(1)
    expect(dayjs(detections[0]?.timePrecisionHourLocal).toDate()).toEqual(dayjs('2020-12-06T10:00:00.000Z').toDate())
    expect(detections[0].count).toBe(1)
    expect(detections[0].detectionMinutes).toEqual([6])
  })

  test('can add a detection in an existing hour', async () => {
    // Arrange
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Act
    await writeDetectionsToBio([{ ...DETECTION_INPUT, idArbimon: 2391044, datetime: '2020-12-06 10:30:19' }], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(1)
    expect(detections[0].count).toBe(2)
    expect(detections[0].detectionMinutes).toEqual([6, 30])
  })

  test('can update the detections in an existing hour and insert a new detection hour', async () => {
    // Arrange
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Act
    await writeDetectionsToBio([
      { ...DETECTION_INPUT, idArbimon: 2391044, datetime: '2020-12-06 10:30:19' }, // Existing
      { ...DETECTION_INPUT, idArbimon: 2391045, datetime: '2020-12-06 11:35:19' } // New
    ], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(2)
    expect(detections[0].count).toBe(2)
    expect(detections[1].count).toBe(1)
    expect(detections[0].detectionMinutes).toEqual([6, 30])
    expect(detections[1].detectionMinutes).toEqual([35])
  })

  test('can remove a detection hour (and remove the row)', async () => {
    // Arrange
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Act
    await writeDetectionsToBio([
      { ...DETECTION_INPUT, idArbimon: 2391044, datetime: '2020-12-06 11:30:19' },
      { ...DETECTION_INPUT, present: null } // Remove
    ], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(1)
    expect(detections[0].detectionMinutes).toEqual([30])
  })

  test('can remove a detection hour (without removing the row)', async () => {
    // Arrange
    await writeDetectionsToBio([
      DETECTION_INPUT,
      { ...DETECTION_INPUT, idArbimon: 2391044, datetime: '2020-12-06 10:30:19' }
    ], biodiversitySequelize)
    await writeDetectionsToBio([], biodiversitySequelize)

    // Act
    await writeDetectionsToBio([
      { ...DETECTION_INPUT, present: null } // Remove
    ], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(1)
    expect(detections[0].detectionMinutes).toEqual([30])
  })

  test('can update presentReview without removal (when present=1)', async () => {
    // Arrange
    const detection = { ...DETECTION_INPUT, present: 1, presentReview: 3 }
    await writeDetectionsToBio([detection], biodiversitySequelize)

    // Act
    await writeDetectionsToBio([{ ...detection, presentReview: 0 }], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(1)
    expect(detections[0].detectionMinutes).toEqual([6])
  })

  test('can ignore new not present and null validations', async () => {
    // Act
    await writeDetectionsToBio([
      { ...DETECTION_INPUT, present: 0 },
      { ...DETECTION_INPUT, present: null }
    ], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(0)
  })

  test('can create new detection when presentReview only', async () => {
    // Act
    await writeDetectionsToBio([{ ...DETECTION_INPUT, present: null, presentReview: 1 }], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(1)
  })

  test('can repeat remove existing detection twice', async () => {
    // Arrange
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)
    const detection = { ...DETECTION_INPUT, present: null }
    await writeDetectionsToBio([detection], biodiversitySequelize)

    // Act
    await writeDetectionsToBio([detection], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(0)
  })

  test('can add more than 1 site', async () => {
    // Arrange
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: PROJECT_INPUT.idArbimon } })
    const site: Omit<Site, 'id'> = { idCore: 'cydwrzz91cby', idArbimon: 88535, locationProjectId: project?.id ?? -1, name: 'Site 3-2', latitude: 16.74, longitude: 100.19, altitude: 0.0 }
    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([site])

    // Act
    await writeDetectionsToBio([
      DETECTION_INPUT,
      { ...DETECTION_INPUT, siteId: 88535, idArbimon: 2391044 }
    ], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(2)
    detections.forEach(item => expect(item.count).toBe(1))
    detections.forEach(item => expect(item.detectionMinutes).toEqual([6]))
  })

  test('ignore duplicate/overlapping detections', async () => {
    // Act
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)
    const duplicateDetection = { ...DETECTION_INPUT, idArbimon: 2391044 }

    // Act
    await writeDetectionsToBio([duplicateDetection], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(1)
    expect(detections[0].count).toBe(1)
    expect(detections[0].detectionMinutes).toEqual([6])
  })

  // TODO Remove?
  test('do not calculate the same durationMinutes and detectionMinutes - next batch', async () => {
    // Arrange
    const DETECTION_INPUT_2: DetectionArbimon[] = [{
      idArbimon: 2391043,
      datetime: '2020-12-06 10:06:19', // repeating datetime
      siteId: 88528,
      recordingDuration: 90.24,
      speciesId: 1050,
      present: 1,
      presentReview: 2,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    },
    {
      idArbimon: 2391044,
      datetime: '2020-12-06 10:30:19',
      siteId: 88528,
      recordingDuration: 90.24,
      speciesId: 1050,
      present: 1,
      presentReview: 0,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    }]
    await writeDetectionsToBio([DETECTION_INPUT, DETECTION_INPUT_2[1]], biodiversitySequelize)

    // Act
    await writeDetectionsToBio([DETECTION_INPUT, DETECTION_INPUT_2[0]], biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(1)
    expect(detections[0].count).toBe(2)
    expect(detections[0].durationMinutes).toBe(3.01)
    expect(detections[0].detectionMinutes).toEqual([6, 30])
  })

  // TODO Remove?
  test('check logic with detections from the one "site/species/date/hour" group, but different songtypes', async () => {
    // Arrange
    const DETECTION_INPUT_2: DetectionArbimon[] = [{
      idArbimon: 2391043,
      datetime: '2020-12-06 10:00:19',
      siteId: 88528,
      recordingDuration: 90.24,
      speciesId: 1050,
      present: 1,
      presentReview: 2,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    },
    {
      idArbimon: 2391044,
      datetime: '2020-12-06 10:30:19',
      siteId: 88528,
      recordingDuration: 90.24,
      speciesId: 1050,
      present: 1,
      presentReview: 0,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    },
    {
      idArbimon: 2391045,
      datetime: '2020-12-06 10:20:50',
      siteId: 88528,
      recordingDuration: 90,
      speciesId: 1050,
      present: 0,
      presentReview: 1,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    }]

    // Act
    await writeDetectionsToBio(DETECTION_INPUT_2, biodiversitySequelize)

    // Assert
    const detections = await DetectionBySiteSpeciesHour.findAll()
    expect(detections).toHaveLength(1)
    expect(detections[0].count).toBe(3)
    expect(detections[0].durationMinutes).toBe(4.51)
    expect(detections[0].detectionMinutes).toEqual([0, 30, 20])
  })

  // TODO Remove?
  test('check logic with detections from the the one group, but different songtypes - insert, upsert and delete', async () => {
    // Act
    const DETECTION_INPUT_2: DetectionArbimon[] = [{
      idArbimon: 2391043,
      datetime: '2020-12-06 10:00:19',
      siteId: 88528,
      recordingDuration: 90.24,
      speciesId: 1050,
      present: 1,
      presentReview: 2,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    },
    {
      idArbimon: 2391044,
      datetime: '2020-12-06 10:30:19',
      siteId: 88528,
      recordingDuration: 90.24,
      speciesId: 1050,
      present: 1,
      presentReview: 0,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    },
    {
      idArbimon: 2391045,
      datetime: '2020-12-06 10:20:50',
      siteId: 88528,
      recordingDuration: 90,
      speciesId: 1050,
      present: 0,
      presentReview: 1,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    },
    {
      idArbimon: 2391045,
      datetime: '2020-12-06 10:20:50',
      siteId: 88528,
      recordingDuration: 90,
      speciesId: 1050,
      present: 0,
      presentReview: 1,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    }]

    // Write first detections
    await writeDetectionsToBio([DETECTION_INPUT_2[0], DETECTION_INPUT_2[2]], biodiversitySequelize)

    // Write a final detection
    await writeDetectionsToBio([DETECTION_INPUT_2[1]], biodiversitySequelize)
    const detections = await DetectionBySiteSpeciesHour.findAll()

    // Reset one detection from the group
    await writeDetectionsToBio([{ ...DETECTION_INPUT_2[2], presentReview: 0, updatedAt: '2022-01-03T01:10:00.000Z' }], biodiversitySequelize)
    const detections2 = await DetectionBySiteSpeciesHour.findAll()

    // Assert

    // Expected results for insert-upsert
    expect(detections).toHaveLength(1)
    expect(detections[0].count).toBe(3)
    expect(detections[0].durationMinutes).toBe(4.52)
    expect(detections[0].detectionMinutes).toEqual([0, 20, 30])

    // Expected result for reset
    expect(detections2).toHaveLength(1)
    expect(detections2[0].count).toBe(2)
    expect(detections2[0].durationMinutes).toBe(3.02)
    expect(detections2[0].detectionMinutes).toEqual([0, 30])
  })

  // TODO: fix this case - how to catch/calculate repeating datetime (2 recordings in the one site with the same datetime)
  // (2391015,7047504,1920,1017,12675,1,1,0,'2022-07-14 10:00:00'),
  // (2391016,7047505,1920,1017,12675,2,1,0,'2022-07-14 10:30:00'),
  // (2391017,7047506,1920,1017,12675,1,0,1,'2022-07-14 10:00:00'),

  // site 123, species 12675, date 2022-07-14, hour 10 <- group
  // count - 3
  // duration minutes based on detection minutes which we filter by duplicate values
  // detection minutes '0,30'
  // duration minutes 90 + 90 / 60

  // TODO Remove?
  test('transformDetectionArbimonToBio works correct', async () => {
    // Arrange
    const TEST_DETECTIONS = [
      {
        idArbimon: 147132,
        datetime: '2008-03-11T18:44:00Z',
        siteId: 88528,
        recordingDuration: 60.0,
        speciesId: 1050,
        present: 1,
        presentReview: 1,
        presentAed: 0,
        updatedAt: '2022-06-23T18:03:47Z'
      },
      {
        idArbimon: 147133,
        datetime: '2008-03-11T18:54:00Z',
        siteId: 88528,
        recordingDuration: 60.0,
        speciesId: 1050,
        present: 1,
        presentReview: 1,
        presentAed: 0,
        updatedAt: '2022-06-23T18:03:47Z'
      },
      {
        idArbimon: 147134,
        datetime: '2008-03-11T19:04:00Z',
        siteId: 88528,
        recordingDuration: 17.29,
        speciesId: 1050,
        present: 1,
        presentReview: 1,
        presentAed: 0,
        updatedAt: '2022-06-23T18:03:47Z'
      },
      {
        idArbimon: 147135,
        datetime: '2008-03-11T20:09:00Z',
        siteId: 88528,
        recordingDuration: 60.0,
        speciesId: 1050,
        present: 1,
        presentReview: 1,
        presentAed: 0,
        updatedAt: '2022-06-23T18:03:47Z'
      }
    ]

    // Act
    await writeDetectionsToBio(TEST_DETECTIONS, biodiversitySequelize)
    const detections = await DetectionBySiteSpeciesHour.findAll()

    // Assert
    expect(detections).toHaveLength(3)
    expect(detections[0].count).toBe(2)
    expect(detections[0].durationMinutes).toBe(2)
    expect(detections[0].detectionMinutes).toEqual([44, 54]) // {44,54}
  })
})
