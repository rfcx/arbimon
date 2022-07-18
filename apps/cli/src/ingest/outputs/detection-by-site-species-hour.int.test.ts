import { beforeAll, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project, Site, TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '@/db/connections'
import { DetectionArbimon } from '../parsers/parse-detection-arbimon-to-bio'
import { writeDetectionsToBio } from './detection-by-site-species-hour'
import { writeProjectsToBio } from './projects'

const biodiversitySequelize = await getSequelize()

describe('ingest > outputs > detection by site species hour', async () => {
  beforeAll(async () => {
    // Delete detections before tests
    await biodiversitySequelize.query('DELETE FROM detection_by_site_species_hour')
  })

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
  await writeProjectsToBio([PROJECT_INPUT], biodiversitySequelize)
  const project = await ModelRepository.getInstance(biodiversitySequelize).LocationProject.findOne({ where: { idArbimon: PROJECT_INPUT.idArbimon } })

  if (!project) return

  const ID_PROJECT = project.id

  // Batch site data
  const SITE_INPUT: Omit<Site, 'id'> = {
    idCore: 'cydwrzz91cbz',
    idArbimon: 88528,
    locationProjectId: ID_PROJECT,
    name: 'Site 3',
    latitude: 16.742010693566815,
    longitude: 100.1923308193772,
    altitude: 0.0
  }

  const site = await ModelRepository.getInstance(biodiversitySequelize).LocationSite.findOne({ where: { idArbimon: SITE_INPUT.idArbimon } })

  if (!site) await ModelRepository.getInstance(biodiversitySequelize).LocationSite.bulkCreate([SITE_INPUT])

  // Batch species if it takes
  const SPECIES_INPUT: Omit<TaxonSpecies, 'id'> = {
    idArbimon: 1050,
    slug: 'falco-amurensis',
    taxonClassId: 300,
    scientificName: 'Falco amurensis'
  }

  const species = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.findOne({ where: { idArbimon: SPECIES_INPUT.idArbimon } })

  if (!species) await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate([SPECIES_INPUT])

  const DETECTION_INPUT: DetectionArbimon = {
    idArbimon: 2391043,
    datetime: '2020-12-06 10:06:19',
    date: '2020-12-06',
    hour: '10',
    siteId: 88528,
    speciesId: 1050,
    present: 1,
    presentReview: 2,
    presentAed: 0,
    updatedAt: '2022-01-03T01:00:00.000Z'
  }

  test.todo('can write a new detection', async () => {
    // Act
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll({
      where: {
        locationProjectId: ID_PROJECT
      }
    })

    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(1)
    expect(detections[0].detectionMinutes).toEqual('6')
  })

  test.todo('can update existing detection', async () => {
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
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll({
      where: {
        locationProjectId: ID_PROJECT
      }
    })

    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(2)
    expect(detections[0].detectionMinutes).toEqual('6,30')
  })

  test.todo('can update existing detection and insert new detection', async () => {
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
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll({
      where: {
        locationProjectId: ID_PROJECT
      }
    })

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
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll({
      where: {
        locationProjectId: ID_PROJECT
      }
    })

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
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll({
      where: {
        locationProjectId: ID_PROJECT
      }
    })

    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(2)
    expect(detections[0].detectionMinutes).toEqual('30,55')
  })
})

// TODO test list
// check if count will be -1
// check if '' in the detectionMinutes will be something else
// check different sites
// check different species
// check different projects
// check if input detection is not validated , but there is not any previous rows in the bio db to decrease the count/detectionMinutes
