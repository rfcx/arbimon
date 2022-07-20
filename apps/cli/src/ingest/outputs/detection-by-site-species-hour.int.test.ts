import { beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, Site, TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import { DetectionArbimon } from '../parsers/parse-detection-arbimon-to-bio'
import { writeDetectionsToBio } from './detection-by-site-species-hour'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > detection by site species hour', async () => {
  beforeEach(async () => {
    // Delete detections before tests
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
    await biodiversitySequelize.query('DELETE FROM taxon_species WHERE id_arbimon=1050')
    await deleteOutputProjects(biodiversitySequelize)

    // Batch project data before tests
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

  const DETECTION_INPUT: DetectionArbimon = {
    idArbimon: 2391043,
    datetime: '2020-12-06 10:06:19',
    date: '2020-12-06',
    hour: '10',
    siteId: 88528,
    recordingDuration: 90.24,
    speciesId: 1050,
    present: 1,
    presentReview: 2,
    presentAed: 0,
    updatedAt: '2022-01-03T01:00:00.000Z'
  }

  test('can write a new detection', async () => {
    // Act
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(1)
    expect(detections[0].detectionMinutes).toEqual('6')
  })

  test('can update existing detection', async () => {
    // Act
    // Write the first detection
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Update the detection
    await writeDetectionsToBio([{
      ...DETECTION_INPUT,
      idArbimon: 2391044,
      datetime: '2020-12-06 10:30:19'
    }], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(2)
    expect(detections[0].detectionMinutes).toEqual('6,30')
  })

  test('can update existing detection and insert new detection', async () => {
    // Act
    // Write the first detection
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Update the existing detection + insert a new one
    await writeDetectionsToBio([
      {
        ...DETECTION_INPUT,
        idArbimon: 2391044,
        datetime: '2020-12-06 10:30:19'
      },
      {
        ...DETECTION_INPUT,
        idArbimon: 2391045,
        datetime: '2020-12-06 11:30:19',
        hour: '11'
      }
    ], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    expect(detections.length).toBe(2)
    expect(detections[0].count).toBe(2)
    expect(detections[1].count).toBe(1)
    expect(detections[0].detectionMinutes).toEqual('6,30')
    expect(detections[1].detectionMinutes).toEqual('30')
  })

  test('can insert a new detection and remove the old one', async () => {
    // Act
    // Write the first detection
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Insert a new detection + remove not validated detection
    await writeDetectionsToBio([
      {
        ...DETECTION_INPUT,
        idArbimon: 2391044,
        datetime: '2020-12-06 11:30:19',
        hour: '11'
      },
      {
        ...DETECTION_INPUT,
        idArbimon: 2391043,
        datetime: '2020-12-06 10:06:19',
        present: null,
        presentReview: 0
      }
    ], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(1)
    expect(detections[0].detectionMinutes).toEqual('30')
  })

  test('can insert new detections, update the first one and remove the second one', async () => {
    // Act
    // Write the first detection
    await writeDetectionsToBio([
      DETECTION_INPUT,
      {
        ...DETECTION_INPUT,
        idArbimon: 2391044,
        datetime: '2020-12-06 11:30:19',
        hour: '11'
      }
    ], biodiversitySequelize)

    // Update the existing detection + remove not validated detection
    await writeDetectionsToBio([
      {
        ...DETECTION_INPUT,
        idArbimon: 2391044,
        datetime: '2020-12-06 11:55:00',
        hour: '11'
      },
      {
        ...DETECTION_INPUT,
        idArbimon: 2391043,
        datetime: '2020-12-06 10:06:19',
        present: null,
        presentReview: 0
      }
    ], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(2)
    expect(detections[0].detectionMinutes).toEqual('30,55')
  })

  test('reset existing detection twice', async () => {
    // Act
    // Write the first detection
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Reset the detection 1st time
    await writeDetectionsToBio([{
      ...DETECTION_INPUT,
      present: null,
      presentReview: 0
    }], biodiversitySequelize)

    // Reset the detection 2nd time
    await writeDetectionsToBio([{
      ...DETECTION_INPUT,
      present: null,
      presentReview: 0
    }], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    expect(detections.length).toBe(0)
  })

  test('check grouping detections for different sites', async () => {
    // Act
    // Batch site data
    const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: 1920 } })
    const SITE_INPUT: Omit<Site, 'id'> = {
      idCore: 'cydwrzz91cby',
      idArbimon: 88535,
      locationProjectId: project?.id ?? -1,
      name: 'Site 3-2',
      latitude: 16.74,
      longitude: 100.19,
      altitude: 0.0
    }
    await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([SITE_INPUT])

    // Write detections
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)
    await writeDetectionsToBio([{ ...DETECTION_INPUT, siteId: 88535 }], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    expect(detections.length).toBe(2)
    detections.forEach(item => expect(item.count).toBe(1))
    detections.forEach(item => expect(item.detectionMinutes).toEqual('6'))
  })

  test('do not calculate the same durationMinutes and detectionMinutes - first batch', async () => {
    // Act
    const DETECTION_INPUT_2: DetectionArbimon[] = [{
      idArbimon: 2391044,
      // !!! repeating datetime, 2 recordings in the one site with the same datetime OR
      // the same recording with different songtypes in detections
      datetime: '2020-12-06 10:06:19',
      date: '2020-12-06',
      hour: '10',
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
      datetime: '2020-12-06 10:07:19',
      date: '2020-12-06',
      hour: '10',
      siteId: 88528,
      recordingDuration: 90,
      speciesId: 1050,
      present: 1,
      presentReview: 0,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    }]

    await writeDetectionsToBio([DETECTION_INPUT, ...DETECTION_INPUT_2], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(3) // 3 detections in the group
    expect(detections[0].durationMinutes).toBe(3)
    expect(detections[0].detectionMinutes).toBe('6,7')
    // TODO: fix this case - how to catch/calculate repeating datetime (2 recordings in the one site with the same datetime OR)
  })

  test('do not calculate the same durationMinutes and detectionMinutes - next batch', async () => {
    // Act
    const DETECTION_INPUT_2: DetectionArbimon[] = [{
      idArbimon: 2391043,
      datetime: '2020-12-06 10:06:19', // repeating datetime
      date: '2020-12-06',
      hour: '10',
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
      date: '2020-12-06',
      hour: '10',
      siteId: 88528,
      recordingDuration: 90.24,
      speciesId: 1050,
      present: 1,
      presentReview: 0,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    }]

    // Write first detections
    await writeDetectionsToBio([DETECTION_INPUT, DETECTION_INPUT_2[1]], biodiversitySequelize)
    // Write a detection with duplicate detectionMinutes
    await writeDetectionsToBio([DETECTION_INPUT, DETECTION_INPUT_2[0]], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(2)
    expect(detections[0].durationMinutes).toBe(3)
    expect(detections[0].detectionMinutes).toBe('6,30')
  })

  test('check logic with detections from the one "site/species/date/hour" group, but different songtypes', async () => {
    // Act
    const DETECTION_INPUT_2: DetectionArbimon[] = [{
      idArbimon: 2391043,
      datetime: '2020-12-06 10:00:19',
      date: '2020-12-06',
      hour: '10',
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
      date: '2020-12-06',
      hour: '10',
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
      date: '2020-12-06',
      hour: '10',
      siteId: 88528,
      recordingDuration: 90,
      speciesId: 1050,
      present: 0,
      presentReview: 1,
      presentAed: 0,
      updatedAt: '2022-01-03T01:00:00.000Z'
    }]

    // Write detections
    await writeDetectionsToBio(DETECTION_INPUT_2, biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(3)
    expect(detections[0].durationMinutes).toBe(5)
    expect(detections[0].detectionMinutes).toBe('0,30,20')
  })

  test('check logic with detections from the the one group, but different songtypes - insert, upsert and delete', async () => {
    // Act
    const DETECTION_INPUT_2: DetectionArbimon[] = [{
      idArbimon: 2391043,
      datetime: '2020-12-06 10:00:19',
      date: '2020-12-06',
      hour: '10',
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
      date: '2020-12-06',
      hour: '10',
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
      date: '2020-12-06',
      hour: '10',
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
      date: '2020-12-06',
      hour: '10',
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
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    // Reset one detection from the group
    await writeDetectionsToBio([{ ...DETECTION_INPUT_2[2], presentReview: 0, updatedAt: '2022-01-03T01:10:00.000Z' }], biodiversitySequelize)
    const detections2 = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll()

    // Assert

    // Expected results for insert-upsert
    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(3)
    expect(detections[0].durationMinutes).toBe(5)
    expect(detections[0].detectionMinutes).toBe('0,20,30')

    // Expected result for reset
    expect(detections2.length).toBe(1)
    expect(detections2[0].count).toBe(2)
    expect(detections2[0].durationMinutes).toBe(4)
    expect(detections2[0].detectionMinutes).toBe('0,30')
  })

  // TODO: fix this case - how to catch/calculate repeating datetime (2 recordings in the one site with the same datetime OR)
  // (2391015,7047504,1920,1017,12675,1,1,0,'2022-07-14 10:00:00'),
  // (2391016,7047505,1920,1017,12675,2,1,0,'2022-07-14 10:30:00'),
  // (2391016,7047506,1920,1017,12675,1,0,1,'2022-07-14 10:00:00'),

  // site 123, species 12675, date 2022-07-14, hour 10 <- group
  // count - 3
  // duration minutes based on detection minutes which we filter by duplicate values
  // detection minutes '0,30'
  // duration minutes 90 + 90 / 60
})
