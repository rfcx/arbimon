import dayjs from 'dayjs'
import { Op } from 'sequelize'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR } from '@rfcx-bio/node-common/dao/models/detection-by-site-species-hour-model'
import { UPDATE_ON_DUPLICATE_RECORDING_BY_SITE_HOUR } from '@rfcx-bio/node-common/dao/models/recording-by-site-hour-model'
import { literalIntegerArray2D, reducedAndSortedPairs } from '@rfcx-bio/node-common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type Site, type TaxonSpecies } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '@/db/connections'
import { deleteOutputProjects } from '../_testing/helper'
import type { SiteArbimon } from '../parsers/parse-site-arbimon-to-bio'
import { writeSitesToBio } from './sites'

const biodiversitySequelize = getSequelize()

const SQL_INSERT_PROJECT = `
  INSERT INTO location_project (id, id_core, id_arbimon, name, slug, latitude_north, latitude_south, longitude_east, longitude_west, created_at, updated_at)
  VALUES ($id, $idCore, $idArbimon, $name, $slug, $latitudeNorth, $latitudeSouth, $longitudeEast, $longitudeWest, $createdAt, $updatedAt);
`

const DEFAULT_PROJECT = { id: 1, idCore: '807cuoi3cvwx', idArbimon: 1920, name: 'My Project', slug: 'my-project-1', latitudeNorth: 1, latitudeSouth: 1, longitudeEast: 1, longitudeWest: 1, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z' }
const DEFAULT_ARB_SITE = { idCore: '807cuoi3uopi', idArbimon: 9999, projectIdArbimon: DEFAULT_PROJECT.idArbimon, name: 'RFCx 99', latitude: 1, longitude: 1, altitude: 1, createdAt: '2021-03-18T11:00:00.000Z', updatedAt: '2021-03-18T11:00:00.000Z', countryCode: null, deletedAt: null, hidden: 0 }

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
    }) as unknown as Site[]
    expect(sites).toHaveLength(arbimonSites.length)
  })

  test('can write site with null lat/lng', async () => {
    // Arrange
    const newArbimonSite = { ...DEFAULT_ARB_SITE, latitude: null, longitude: null }

    // Act
    await writeSitesToBio([newArbimonSite], biodiversitySequelize)

    // Assert
    const newSite = await ModelRepository.getInstance(biodiversitySequelize).LocationSite
      .findOne({ where: { idArbimon: newArbimonSite.idArbimon } })
    expect(newSite).not.toBeNull()
    expect(newSite?.latitude).toBeNull()
    expect(newSite?.longitude).toBeNull()
  })

  test('can update site name, core id, latitude, longitude, hidden', async () => {
    // Arrange
    await writeSitesToBio([DEFAULT_ARB_SITE], biodiversitySequelize)
    const updatedArbimonSite = {
      ...DEFAULT_ARB_SITE,
      name: 'RFCx 99-1',
      idCore: '807cuoi3cv9s',
      latitude: 2,
      longitude: 2,
      altitude: 2,
      hidden: 0
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
    expect(updatedSite?.hidden).toBe(false)
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
  })

  test('can move recordings and detections if site moves to another project', async () => {
    // Arrange

    // Insert project
    const arbimonProject = { ...DEFAULT_PROJECT, id: 2, idCore: '807cuoi3cvwx', idArbimon: 1921, slug: 'my-project-2' }
    await biodiversitySequelize.query(SQL_INSERT_PROJECT, { bind: arbimonProject })
    const bioProject = await ModelRepository.getInstance(biodiversitySequelize).LocationProject
      .findOne({ where: { idArbimon: arbimonProject.idArbimon } })
    // Insert site
    await writeSitesToBio([DEFAULT_ARB_SITE], biodiversitySequelize)
    const site = await ModelRepository.getInstance(biodiversitySequelize).LocationSite
      .findOne({ where: { idArbimon: DEFAULT_ARB_SITE.idArbimon } })
    // Insert specie
    const SPECIES_INPUT: Omit<TaxonSpecies, 'id'> = {
      idArbimon: 1050,
      slug: 'falco-amurensis',
      taxonClassId: 300,
      scientificName: 'Falco amurensis'
    }
    let specie = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies
      .findOne({ where: { idArbimon: SPECIES_INPUT.idArbimon } })
    if (!specie) {
      await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate([SPECIES_INPUT])
      specie = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies
      .findOne({ where: { idArbimon: SPECIES_INPUT.idArbimon } })
    }
    // Insert recordings
    const RECORDING_INPUT = [
      {
        locationSiteId: site?.id ?? -1,
        timePrecisionHourLocal: dayjs('2022-07-06 07:00:00+00').toDate(),
        locationProjectId: bioProject?.id ?? -1,
        count: 1,
        countsByMinute: [[0, 1]],
        totalDurationInMinutes: 1
      },
      {
        locationSiteId: site?.id ?? -1,
        timePrecisionHourLocal: dayjs('2022-07-06 08:00:00+00').toDate(),
        locationProjectId: bioProject?.id ?? -1,
        count: 2,
        countsByMinute: [[10, 1], [20, 1]],
        totalDurationInMinutes: 2
      }
    ]
    const recordings = RECORDING_INPUT.map(group => {
      return { ...group, countsByMinute: literalIntegerArray2D(reducedAndSortedPairs(group.countsByMinute), biodiversitySequelize) }
    })
    // @ts-expect-error: countsByMinute in rows has incompatible type (but it seems to be accepted by sequelize)
    await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.bulkCreate(recordings, {
      updateOnDuplicate: UPDATE_ON_DUPLICATE_RECORDING_BY_SITE_HOUR
    })
    // Insert detections
    const DETECTION_INPUT = [
      {
        locationSiteId: site?.id ?? -1,
        timePrecisionHourLocal: dayjs('2022-07-06 07:00:00+00').toDate(),
        locationProjectId: bioProject?.id ?? -1,
        count: 1,
        countsByMinute: [[0, 1]],
        taxonSpeciesId: specie?.id ?? -1,
        taxonClassId: 300
      },
      {
        locationSiteId: site?.id ?? -1,
        timePrecisionHourLocal: dayjs('2022-07-06 08:00:00+00').toDate(),
        locationProjectId: bioProject?.id ?? -1,
        count: 2,
        countsByMinute: [[10, 1], [20, 1]],
        taxonSpeciesId: specie?.id ?? -1,
        taxonClassId: 300
      }
    ]
    const detections = DETECTION_INPUT.map(group => {
      return { ...group, countsByMinute: literalIntegerArray2D(reducedAndSortedPairs(group.countsByMinute), biodiversitySequelize) }
    })
    // @ts-expect-error: countsByMinute in rows has incompatible type (but it seems to be accepted by sequelize)
    await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.bulkCreate(detections, {
      updateOnDuplicate: UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR
    })
    // Update site
    const updatedArbimonSite = {
      ...DEFAULT_ARB_SITE,
      projectIdArbimon: arbimonProject.idArbimon
    }

    // Act
    await writeSitesToBio([updatedArbimonSite], biodiversitySequelize)

    // Assert
    const updatedSite = await ModelRepository.getInstance(biodiversitySequelize).LocationSite
      .findOne({ where: { idArbimon: updatedArbimonSite.idArbimon } })
    expect(updatedSite?.locationProjectId).toBe(bioProject?.id)
    // Check moved recordings
    const oldRecordings = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour
      .findAll({ where: { locationProjectId: site?.locationProjectId, locationSiteId: site?.id } })
    const updatedRecordings = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour
      .findAll({ where: { locationProjectId: updatedSite?.locationProjectId, locationSiteId: updatedSite?.id } })
    expect(oldRecordings).toHaveLength(0)
    expect(updatedRecordings).toHaveLength(2)
    updatedRecordings.forEach(rec => { expect(rec.locationSiteId).toBe(updatedSite?.id) })
    // Check moved detections
    const oldDetections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour
      .findAll({ where: { locationProjectId: site?.locationProjectId, locationSiteId: site?.id } })
    const updatedDetections = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour
      .findAll({ where: { locationProjectId: updatedSite?.locationProjectId, locationSiteId: updatedSite?.id } })
    expect(oldDetections).toHaveLength(0)
    expect(updatedDetections).toHaveLength(2)
    updatedDetections.forEach(det => { expect(det.locationSiteId).toBe(updatedSite?.id) })
  })

  test('recordings and detections keep original project if site doesnt move to another project', async () => {
    // Arrange

    // Insert site
    const bioProject = await ModelRepository.getInstance(biodiversitySequelize).LocationProject
      .findOne({ where: { idArbimon: DEFAULT_PROJECT.idArbimon } })
    await writeSitesToBio([DEFAULT_ARB_SITE], biodiversitySequelize)
    const bioSite = await ModelRepository.getInstance(biodiversitySequelize).LocationSite
      .findOne({ where: { idArbimon: DEFAULT_ARB_SITE.idArbimon } })
    // Insert specie
    const SPECIES_INPUT: Omit<TaxonSpecies, 'id'> = {
      idArbimon: 1050,
      slug: 'falco-amurensis',
      taxonClassId: 300,
      scientificName: 'Falco amurensis'
    }
    const specie = await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies
      .findOne({ where: { idArbimon: SPECIES_INPUT.idArbimon } })
    if (!specie) await ModelRepository.getInstance(biodiversitySequelize).TaxonSpecies.bulkCreate([SPECIES_INPUT])
    // Insert recordings
    const RECORDING_INPUT = [
      {
        locationSiteId: bioSite?.id ?? -1,
        timePrecisionHourLocal: dayjs('2022-07-06 07:00:00+00').toDate(),
        locationProjectId: bioProject?.id ?? -1,
        count: 1,
        countsByMinute: [[0, 1]],
        totalDurationInMinutes: 1
      },
      {
        locationSiteId: bioSite?.id ?? -1,
        timePrecisionHourLocal: dayjs('2022-07-06 08:00:00+00').toDate(),
        locationProjectId: bioProject?.id ?? -1,
        count: 2,
        countsByMinute: [[10, 1], [20, 1]],
        totalDurationInMinutes: 2
      }
    ]
    const recordings = RECORDING_INPUT.map(group => {
      return { ...group, countsByMinute: literalIntegerArray2D(reducedAndSortedPairs(group.countsByMinute), biodiversitySequelize) }
    })
    // @ts-expect-error: countsByMinute in rows has incompatible type (but it seems to be accepted by sequelize)
    await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour.bulkCreate(recordings, {
      updateOnDuplicate: UPDATE_ON_DUPLICATE_RECORDING_BY_SITE_HOUR
    })
    // Insert detections
    const DETECTION_INPUT = [
      {
        locationSiteId: bioSite?.id ?? -1,
        timePrecisionHourLocal: dayjs('2022-07-06 07:00:00+00').toDate(),
        locationProjectId: bioProject?.id ?? -1,
        count: 1,
        countsByMinute: [[0, 1]],
        taxonSpeciesId: specie?.id ?? -1,
        taxonClassId: 300
      },
      {
        locationSiteId: bioSite?.id ?? -1,
        timePrecisionHourLocal: dayjs('2022-07-06 08:00:00+00').toDate(),
        locationProjectId: bioProject?.id ?? -1,
        count: 2,
        countsByMinute: [[10, 1], [20, 1]],
        taxonSpeciesId: specie?.id ?? -1,
        taxonClassId: 300
      }
    ]
    const detections = DETECTION_INPUT.map(group => {
      return { ...group, countsByMinute: literalIntegerArray2D(reducedAndSortedPairs(group.countsByMinute), biodiversitySequelize) }
    })
    // @ts-expect-error: countsByMinute in rows has incompatible type (but it seems to be accepted by sequelize)
    await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour.bulkCreate(detections, {
      updateOnDuplicate: UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR
    })

    // Assert
    expect(bioSite?.locationProjectId).toBe(bioProject?.id)
    // Check recordings
    const recordingResult = await ModelRepository.getInstance(biodiversitySequelize).RecordingBySiteHour
      .findAll({ where: { locationProjectId: bioSite?.locationProjectId, locationSiteId: bioSite?.id } })
    expect(recordingResult).toHaveLength(2)
    recordingResult.forEach(rec => { expect(rec.locationSiteId).toBe(bioSite?.id) })
    // Check moved detections
    const detectionResult = await ModelRepository.getInstance(biodiversitySequelize).DetectionBySiteSpeciesHour
      .findAll({ where: { locationProjectId: bioSite?.locationProjectId, locationSiteId: bioSite?.id } })
    expect(detectionResult).toHaveLength(2)
    detectionResult.forEach(det => { expect(det.locationSiteId).toBe(bioSite?.id) })
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
