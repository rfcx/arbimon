import dayjs from 'dayjs'
import { Op } from 'sequelize'
import { afterAll, afterEach, beforeEach, describe, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { literalizeCountsByMinute } from '@rfcx-bio/node-common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type RecordingBySiteHour } from '@rfcx-bio/node-common/dao/types'

import { makeProject } from '@/../../../packages/testing/src/model-builders/project-model-builder'
import { getSequelize } from '@/db/connections'
import { syncAllProjects } from './all'
import { getOpenSearchClient } from './opensearch/utilities'

const opensearchClient = getOpenSearchClient()
const sequelize = getSequelize()
const { LocationProject, LocationProjectProfile, LocationSite, RecordingBySiteHour: RecordingBySiteHourModel, SyncStatus, DetectionBySiteSpeciesHour, TaxonSpecies } = ModelRepository.getInstance(sequelize)

const SPECIES_REQUIRED_FIELDS = ['scientific_name', 'common_name', 'taxon_class', 'is_threatened', 'risk_rating', 'countries']

const makeRecordingBySiteHour = (locationProjectId: number, locationSiteId: number, startDate: string, hourOffset: number): RecordingBySiteHour => {
  return {
    timePrecisionHourLocal: dayjs(startDate, 'YYYY-MM-DD').add(hourOffset, 'hour').toDate(),
    locationProjectId,
    locationSiteId,
    count: 60,
    countsByMinute: Array.from({ length: 59 }, (_, i) => [i, 1]),
    totalDurationInMinutes: 60
  }
}

// Before any test we recreate data in postgres
beforeEach(async () => {
  // Create projects
  const project1 = makeProject(2431213, 'Fullham Diversity', 'listed')
  const project2 = makeProject(2431214, 'Nottingham Diversity', 'hidden') // hidden by user
  const project3 = makeProject(2431215, 'Westham Diversity', 'unlisted') // not enough recordings to be existed on the page
  const project4 = makeProject(2431216, 'Aberdeen Diversity', 'published') // published project
  await LocationProject.create(project1)
  await LocationProject.create(project2)
  await LocationProject.create(project3)
  await LocationProject.create(project4)

  // Create sites for two projects that are going to be in the index
  const project1Site = {
    id: 99221144,
    idCore: 'alskdmfiiee',
    idArbimon: 99221144,
    name: 'North Fullham 121e',
    locationProjectId: project1.id,
    latitude: 0,
    longitude: 0,
    altitude: 0,
    countryCode: 'US'
  }
  await LocationSite.create(project1Site)
  const p1s1recordings = Array.from({ length: 20 }, (_, i) => {
    return literalizeCountsByMinute(makeRecordingBySiteHour(project1.id, project1Site.id, '2024-01-01', i), sequelize)
  })
  await RecordingBySiteHourModel.bulkCreate(p1s1recordings)

  const project4Site = {
    id: 84958833,
    idCore: 'lk499gsdf0i',
    idArbimon: 84958833,
    name: 'E1199',
    locationProjectId: project4.id,
    latitude: 0,
    longitude: 0,
    altitude: 0,
    countryCode: 'US'
  }
  await LocationSite.create(project4Site)
  const p4s1recordings = Array.from({ length: 30 }, (_, i) => {
    return literalizeCountsByMinute(makeRecordingBySiteHour(project4.id, project4Site.id, '2024-01-02', i), sequelize)
  })
  await RecordingBySiteHourModel.bulkCreate(p4s1recordings)

  // Create detections to be able to add species to indexed documents
  const taxonSpecies = await TaxonSpecies.findOne()
  const detections = [
    {
      locationSiteId: 99221144,
      locationProjectId: 2431213,
      timePrecisionHourLocal: new Date(),
      taxonSpeciesId: taxonSpecies?.id ?? 0,
      taxonClassId: taxonSpecies?.taxonClassId ?? 0,
      count: 2,
      countsByMinute: [[11, 1], [14, 1]]
    },
    {
      locationSiteId: 84958833,
      locationProjectId: 2431216,
      timePrecisionHourLocal: new Date(),
      taxonSpeciesId: taxonSpecies?.id ?? 0,
      taxonClassId: taxonSpecies?.taxonClassId ?? 0,
      count: 2,
      countsByMinute: [[11, 1], [14, 1]]
    }
  ]
  await DetectionBySiteSpeciesHour.bulkCreate(detections.map(r => literalizeCountsByMinute(r, sequelize)))

  // Refresh views
  await sequelize.query('REFRESH MATERIALIZED VIEW location_project_recording_metric')
  await sequelize.query('REFRESH MATERIALIZED VIEW location_project_detection_metric')
})

// destroy data in postgres
afterEach(async () => {
  const locationProjectIds = [2431213, 2431214, 2431215, 2431216]
  await DetectionBySiteSpeciesHour.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } }, force: true })
  await RecordingBySiteHourModel.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
  await LocationProjectProfile.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
  await LocationSite.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
  await LocationProject.destroy({ where: { id: { [Op.in]: locationProjectIds } }, force: true })
})

afterAll(async () => {
  await SyncStatus.destroy({ where: { syncSourceId: 300, syncDataTypeId: 800 } })
})

describe('index all data from postgres to opensearch', () => {
  test('connect and create indexes', async () => {
    // Act
    await syncAllProjects(opensearchClient, sequelize)

    // Assert
    const indices = await opensearchClient.cat.indices({ format: 'json' }).then(response => (response.body as Array<{ index: string }>).map(i => i.index))
    expect(indices).toContain('projects')
  })

  test('an entry inside sync_status table will get created after the reindex', async () => {
    // Act
    await syncAllProjects(opensearchClient, sequelize)

    // Assert
    const { SyncStatus } = ModelRepository.getInstance(sequelize)
    const status = await SyncStatus.findOne({ where: { [Op.and]: { syncSourceId: 300, syncDataTypeId: 800 } } })
    expect(status).not.toBe(null)
  })

  test('reindex updates the sync until date', async () => {
    // Arrange
    const { SyncStatus } = ModelRepository.getInstance(sequelize)
    await syncAllProjects(opensearchClient, sequelize)
    const latestSyncDate1 = await SyncStatus.findOne({ where: { [Op.and]: { syncSourceId: 300, syncDataTypeId: 800 } } })

    // Act
    await syncAllProjects(opensearchClient, sequelize)

    // Assert
    const latestSyncDate2 = await SyncStatus.findOne({ where: { [Op.and]: { syncSourceId: 300, syncDataTypeId: 800 } } })
    expect(latestSyncDate1?.syncUntilDate).not.toEqual(null)
    expect(latestSyncDate2?.syncUntilDate).not.toEqual(null)
    expect(dayjs(latestSyncDate1?.syncUntilDate).isBefore(latestSyncDate2?.syncUntilDate)).toBe(true)
  }, 10_000)

  test('a reindex will sync the passed criteria projects over', async () => {
    // Arrange
    await syncAllProjects(opensearchClient, sequelize)

    // Act
    const response = await opensearchClient.search({
      index: 'projects',
      body: {
        query: {
          match: {
            name: {
              query: 'Fullham'
            }
          }
        }
      }
    })

    // Assert
    expect(response.body.hits.hits.length).toBe(1)
    expect(response.body.hits.hits[0]._id).toBe('2431213')
  })

  test('a reindex will not sync unpassed criteria projects over', async () => {
    // Arrange
    await syncAllProjects(opensearchClient, sequelize)

    // Act
    const response = await opensearchClient.search({
      index: 'projects',
      body: {
        query: {
          match: {
            name: {
              query: 'Nottingham'
            }
          }
        }
      }
    })

    // Assert
    expect(response.body?.hits?.hits?.length).toBe(0)
  })

  test('a reindex will resync the projects after their contents are edited', async () => {
    // Arrange
    await syncAllProjects(opensearchClient, sequelize)
    const summary = '## Welcome to Fullham diversity'
    await LocationProjectProfile.create({ summary, locationProjectId: 2431213, image: '', readme: '', methods: '', keyResult: '', objectives: [], resources: '', dateStart: null, dateEnd: null })

    // Act
    await syncAllProjects(opensearchClient, sequelize)
    const response = await opensearchClient.search({
      index: 'projects',
      body: {
        query: {
          match: {
            name: {
              query: 'Fullham'
            }
          }
        }
      }
    })

    // Assert
    expect(response.body.hits.hits[0]._source.summary).toBe(summary)
  })

  test('a reindex will remove deleted projects', async () => {
    // Arrange
    await syncAllProjects(opensearchClient, sequelize)
    await LocationProject.destroy({ where: { id: 2431216 } })

    // Act
    await syncAllProjects(opensearchClient, sequelize)
    const response = await opensearchClient.search({
      index: 'projects',
      body: {
        query: {
          match: {
            name: {
              query: 'Aberdeen'
            }
          }
        }
      }
    })

    // Assert
    expect(response.body.hits.hits.length).toBe(0)
  })

  test('a project that its status went to hidden/unlisted will get removed from opensearch', async () => {
    // Arrange
    await syncAllProjects(opensearchClient, sequelize)
    await LocationProject.update({ status: 'hidden', statusUpdatedAt: new Date() }, { where: { id: 2431216 } })

    // Act
    await syncAllProjects(opensearchClient, sequelize)

    // Assert
    await expect(opensearchClient.get({ index: 'projects', id: '2431216' })).rejects.toThrow()
  })

  test('indexed projects include species array', async () => {
    // Arrange
    await syncAllProjects(opensearchClient, sequelize)

    // Act
    const response = await opensearchClient.search({
      index: 'projects'
    })

    // Assert - check for species in response
    expect(response.body.hits.hits).toBeDefined()
    expect(response.body.hits.hits[0]._source.species).toBeDefined()
  })

  test('species array within indexed documents contains the correct data', async () => {
    // Arrange
    await syncAllProjects(opensearchClient, sequelize)

    // Act
    const response = await opensearchClient.search({
      index: 'projects'
    })

    // Assert - check for species data in response
    expect(response.body.hits.hits).toBeDefined()
    const hits = response.body.hits.hits
    const speciesReduced = hits.reduce((acc: Array<Record<string, any>>, hit: { _source: { species: Array<Record<string, any>> } }) => {
      const species = hit._source.species
      acc.push(...species)
      return acc
    }, [])
    speciesReduced.forEach((sp: Array<Record<string, any>>) => {
      SPECIES_REQUIRED_FIELDS.forEach(field => { expect(sp).toHaveProperty(field) })
    })
  })
})
