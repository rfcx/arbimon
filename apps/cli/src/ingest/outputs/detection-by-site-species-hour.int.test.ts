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
    projectId: 1920,
    date: '2020-12-06',
    hour: '03',
    siteId: 88528,
    speciesId: 1050,
    detectionCount: 1,
    detectionMinutes: '06',
    detectionId: '123',
    updatedAt: '2022-03-22 07:31:11'
  }

  test('can write species calls', async () => {
    // Act
    await writeDetectionsToBio([DETECTION_INPUT], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll({
      where: {
        locationProjectId: ID_PROJECT
      }
    })
    expect(detections.length).toBe(1)
  })

  test('fail for duplicate species calls', async () => {
    // Act
    await writeDetectionsToBio([{ ...DETECTION_INPUT, detectionCount: 2 }], biodiversitySequelize)

    // Assert
    const detections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.findAll({
      where: {
        locationProjectId: ID_PROJECT
      }
    })
    expect(detections.length).toBe(1)
    expect(detections[0].count).toBe(2)
  })
})
