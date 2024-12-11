import dayjs from 'dayjs'
import { type Sequelize, Op } from 'sequelize'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { type SearchResponseProject, searchRoute, xSearchTotalCountHeaderName } from '@rfcx-bio/common/api-bio/search/search'
import { literalizeCountsByMinute } from '@rfcx-bio/node-common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type DetectionBySiteSpeciesHour, type RecordingBySiteHour } from '@rfcx-bio/node-common/dao/types'
import { modelRepositoryWithElevatedPermissions } from '@rfcx-bio/testing/dao'
import { makeApp } from '@rfcx-bio/testing/handlers'
import { makeIndexRequest, makeProject } from '@rfcx-bio/testing/model-builders/project-model-builder'

import { GET } from '~/api-helpers/types'
import { env } from '~/env'
import { getOpenSearchClient } from '~/opensearch'
import { routesSearch } from './index'

const EXPECTED_PROPS = [
  'type',
  'avgLatitude',
  'avgLongitude',
  'id',
  'idCore',
  'idArbimon',
  'name',
  'slug',
  'status',
  'image',
  'objectives',
  'summary',
  'readme',
  'speciesCount',
  'recordingMinutesCount',
  'countryCodes'
]

function zeroToN (n: number): number[] {
  return [...Array(n + 1).keys()]
}

function makeRecordingBySiteHour (locationProjectId: number, locationSiteId: number, startDate: string, hourOffset: number): RecordingBySiteHour {
  return {
    timePrecisionHourLocal: dayjs(startDate, 'YYYY-MM-DD').add(hourOffset, 'hour').toDate(),
    locationProjectId,
    locationSiteId,
    count: 60,
    countsByMinute: zeroToN(59).map(i => [i, 1]),
    totalDurationInMinutes: 60
  }
}

function makeDetectionBySiteSpeciesHour (locationProjectId: number, locationSiteId: number, taxonClassId: number, taxonSpeciesId: number, startDate: string, hourOffset: number): DetectionBySiteSpeciesHour {
  return {
    timePrecisionHourLocal: dayjs(startDate, 'YYYY-MM-DD').add(hourOffset, 'hour').toDate(),
    locationProjectId,
    locationSiteId,
    taxonClassId,
    taxonSpeciesId,
    count: 1,
    countsByMinute: [[5, 1]]
  }
}

const { LocationProject, LocationSite, RecordingBySiteHour: RecordingBySiteHourModel, DetectionBySiteSpeciesHour: DetectionBySiteSpeciesHourModel, TaxonSpecies } = modelRepositoryWithElevatedPermissions
const sequelize = RecordingBySiteHourModel.sequelize as Sequelize
const opensearch = getOpenSearchClient()

const [p1id, p2id, p3id, p4id, p5id] = [2345001, 2345002, 2345003, 2345004, 2345005]

describe('Local search', async () => {
  beforeAll(async () => {
    env.OPENSEARCH_ENABLED = 'false'

    const p1 = makeProject(p1id, 'Listed khaokho 1', 'listed')
    const p2 = makeProject(p2id, 'Listed sukhothai 2', 'published')
    const p3 = makeProject(p3id, 'Listed sukhothai 3', 'published')
    const p4 = makeProject(p4id, 'Unlisted khaokho 1', 'hidden') // user requested hidden
    const p5 = makeProject(p5id, 'Unlisted khaokho 2', 'unlisted') // does not meet the criteria for listing
    await LocationProject.bulkCreate([p1, p2, p3, p4, p5], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })

    // p1 needs meet the listing critera (recordingsCount > 1000)
    const p1s1 = { id: 23450011, idCore: '23450011', idArbimon: 23450011, name: 'P1 Site 1', locationProjectId: p1.id, latitude: 0, longitude: 0, altitude: 0, countryCode: 'US' }
    await LocationSite.bulkCreate([p1s1])
    const p1s1recordings = zeroToN(20).map(i => literalizeCountsByMinute(makeRecordingBySiteHour(p1.id, p1s1.id, '2023-05-02', i), sequelize))
    await RecordingBySiteHourModel.bulkCreate(p1s1recordings)

    // p3 needs more species than p2
    const taxonSpecies = await TaxonSpecies.findOne()
    const p3s1 = { id: 23450031, idCore: '23450031', idArbimon: 23450031, name: 'P3 Site 1', locationProjectId: p3.id, latitude: 0, longitude: 0, altitude: 0, countryCode: 'US' }
    await LocationSite.bulkCreate([p3s1])
    const p3s1detections = [literalizeCountsByMinute(makeDetectionBySiteSpeciesHour(p3.id, p3s1.id, taxonSpecies?.taxonClassId ?? 0, taxonSpecies?.id ?? 0, '2023-05-02', 0), sequelize)]
    await DetectionBySiteSpeciesHourModel.bulkCreate(p3s1detections)

    await sequelize.query('REFRESH MATERIALIZED VIEW location_project_recording_metric')
    await sequelize.query('REFRESH MATERIALIZED VIEW location_project_detection_metric')
  })

  afterAll(async () => {
    const locationProjectIds = [p1id, p2id, p3id, p4id, p5id]
    await DetectionBySiteSpeciesHourModel.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
    await RecordingBySiteHourModel.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
    await LocationSite.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
    await LocationProject.destroy({ where: { id: { [Op.in]: locationProjectIds } }, force: true })
  })

  test(`GET ${searchRoute}?type=project returns projects`, async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: { type: 'project', q: 'khaokho' }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(results).toHaveLength(1)
    const project = results.find((p: { id: number }) => p.id === p1id)
    expect(project).toBeDefined()
    expect(project.name).toBeDefined()
    expect(project.recordingMinutesCount).toBe(1260)

    for (const prop of EXPECTED_PROPS) {
      expect(project).toHaveProperty(prop)
    }
  })

  test(`GET ${searchRoute}?type=project&q= will return projects which orders by recording minutes count`, async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: { type: 'project' }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    expect(response.headers?.[xSearchTotalCountHeaderName]).toBeDefined()
    const results = JSON.parse(response.body)
    const projectsUnderTest = results.filter((p: { id: number }) => [p1id, p2id, p3id, p4id, p5id].includes(p.id))
    expect(projectsUnderTest).toHaveLength(3)
    expect(projectsUnderTest[0].id).toBe(p3id) // Published, more species than p2
    expect(projectsUnderTest[1].id).toBe(p2id) // Published
    expect(projectsUnderTest[2].id).toBe(p1id) // Listed
  })
})

describe('OpenSearch search', async () => {
  beforeAll(async () => {
    env.OPENSEARCH_ENABLED = 'true'
    const p1 = makeProject(7689921, 'Alton planet', 'published')
    const p2 = makeProject(7689922, 'Kristiansand planet', 'published')
    const p3 = makeProject(7689923, 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch planet', 'published')
    const p4 = makeProject(7689924, 'Cairo planet', 'published')

    const opensearchp1 = makeIndexRequest('projects', p1, 'wait_for', '', [], ['GB'])
    const opensearchp2 = makeIndexRequest('projects', p2, 'wait_for', 'Filled with such diverse terrain, this place is a bliss for all species', ['bio-baseline'], ['SE', 'NO', 'DK'])
    const opensearchp3 = makeIndexRequest('projects', p3, 'wait_for', 'What could the longest town name of all England could have in their forest???', ['bio-baseline', 'monitor-species'], ['GB'])
    const opensearchp4 = makeIndexRequest('projects', p4, 'wait_for', 'a cool Cairo biodviersity project to help all the travellers', ['Helping camels'], ['EG'])

    await opensearch.index(opensearchp1)
    await opensearch.index(opensearchp2)
    await opensearch.index(opensearchp3)
    await opensearch.index(opensearchp4)
  })

  afterAll(async () => {
    await Promise.all([
      await opensearch.delete({ index: 'projects', id: '7689921' }),
      await opensearch.delete({ index: 'projects', id: '7689922' }),
      await opensearch.delete({ index: 'projects', id: '7689923' }),
      await opensearch.delete({ index: 'projects', id: '7689924' })
    ])
  })

  test(`GET ${searchRoute}?type=project returns projects`, async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: { type: 'project', q: 'Alton' }
    })

    // Assert
    expect(response.headers?.[xSearchTotalCountHeaderName]).toBe(1)
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body)
    expect(results).toHaveLength(1)
    const project = results.find((p: { id: number }) => p.id === 7689921)
    expect(project).toBeDefined()
    expect(project.name).toBeDefined()
    expect(project.recordingMinutesCount).toBe(13994)
  })

  // TODO: Hopefully figure out the cause of this test not running in CI.
  // This test runs perfectly locally and the search indexing works.
  test.skip('opensearch can search for projects based on their objective alias', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'biodiversity'
      }
    })

    // Assert
    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    expect(results.findIndex(r => r.id === 7689922)).not.toBe(-1)
  })

  // TODO: Hopefully figure out the cause of this test not running in CI.
  // This test runs perfectly locally and the search indexing works.
  test.skip('opensearch can search for custom objectives', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'Helping camels'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    expect(results.findIndex(r => r.id === 7689924)).not.toBe(-1)
  })

  // TODO: Hopefully figure out the cause of this test not running in CI.
  // This test runs perfectly locally and the search indexing works.
  test.todo('opensearch can search for country name alias', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'Norway'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    expect(results.findIndex(r => r.id === 7689922)).not.toBe(-1)
  })

  test('opensearch can search based on text inside summary field', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'help all the travellers'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    expect(results.findIndex(r => r.id === 7689924)).not.toBe(-1)
  })

  test('opensearch response provides correct fields', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'Kris'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    const index = results.findIndex(r => r.id === 7689922)
    expect(index).not.toBe(-1)
    const result = results[index]

    for (const prop of EXPECTED_PROPS) {
      expect(result).toHaveProperty(prop)
    }
  })
})

describe('OpenSearch - search projects by species', async () => {
  beforeAll(async () => {
    env.OPENSEARCH_ENABLED = 'true'

    const project1 = makeProject(7689925, 'Scottish Highlands project', 'published')
    const project2 = makeProject(7689926, 'Large carnivores', 'published')
    const project3 = makeProject(7689927, 'Ground squirrel communication calls', 'published')
    const project4 = makeProject(7689928, 'Birds in the Mediterranean region', 'published')
    const project5 = makeProject(7689929, 'Butterflies in mountainous regions', 'published')

    const species2 = [
        {
          scientific_name: 'Ursus arctos',
          common_name: 'Eurasian brown bear',
          taxon_class: 'mammals',
          is_threatened: false,
          risk_category: '',
          risk_rating: 'Least Concern',
          countries: ['Bulgaria']
        }
    ]
    const species3 = [
      {
        scientific_name: 'Spermophilus citellus',
        common_name: 'European ground squirrel',
        taxon_class: 'mammals',
        is_threatened: true,
        risk_category: 'threatened',
        risk_rating: 'Endangered',
        countries: ['Bulgaria']
      }
    ]
    const species4 = [
      {
        scientific_name: 'Ciconia ciconia',
        common_name: 'White stork',
        taxon_class: 'birds',
        is_threatened: false,
        risk_category: '',
        risk_rating: 'Least Concern',
        countries: ['Greece']
      },
      {
        scientific_name: 'Ciconia nigra',
        common_name: 'Black stork',
        taxon_class: 'birds',
        is_threatened: false,
        risk_category: '',
        risk_rating: 'Least Concern',
        countries: ['Bulgaria']
      },
      {
        scientific_name: 'Emberiza aureola',
        common_name: 'Yellow-breasted Bunt',
        taxon_class: 'birds',
        is_threatened: true,
        risk_category: 'threatened',
        risk_rating: 'Critically Endangered',
        countries: ['Greece']
      },
      {
        scientific_name: 'Platalea leucorodia',
        common_name: 'Eurasian Spoonbill',
        taxon_class: 'birds',
        is_threatened: false,
        risk_category: '',
        risk_rating: 'Least Concern',
        countries: ['Greece']
      }
    ]
    const species5 = [
        {
        scientific_name: 'Coenonympha orientalis',
        common_name: 'Balkan Heath',
        taxon_class: 'insects',
        is_threatened: true,
          risk_category: 'threatened',
        risk_rating: 'Vulnerable',
        countries: ['Bosnia and Herzegovina']
      }
    ]

    const opensearchp1 = makeIndexRequest('projects', project1, 'wait_for', '', [], ['GB'])
    const opensearchp2 = makeIndexRequest('projects', project2, 'wait_for', 'Explore acoustic aspects of large carnivore communication', ['Improve conservation measures'], ['BG'], { species: species2 })
    const opensearchp3 = makeIndexRequest('projects', project3, 'wait_for', 'Communication patterns in ground squirrel colonies', [], ['BG'], { species: species3 })
    const opensearchp4 = makeIndexRequest('projects', project4, 'wait_for', 'Birds in border regions', ['Improve conservation measures'], ['BG', 'GR'], { species: species4 })
    const opensearchp5 = makeIndexRequest('projects', project5, 'wait_for', '', ['Plan reintroduction'], ['GR'], { species: species5 })

    await opensearch.index(opensearchp1)
    await opensearch.index(opensearchp2)
    await opensearch.index(opensearchp3)
    await opensearch.index(opensearchp4)
    await opensearch.index(opensearchp5)
  })

  afterAll(async () => {
    await Promise.all([
      await opensearch.delete({ index: 'projects', id: '7689925' }),
      await opensearch.delete({ index: 'projects', id: '7689926' }),
      await opensearch.delete({ index: 'projects', id: '7689927' }),
      await opensearch.delete({ index: 'projects', id: '7689928' }),
      await opensearch.delete({ index: 'projects', id: '7689929' })
    ])
  })

  // Test search for species
  test('returns projects based on common name', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'bear'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    expect(results).toHaveLength(1)
    expect(results.findIndex(r => r.id === 7689926)).not.toBe(-1)
  })

  test('returns projects based on scientific name', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'spermophilus citellus'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    expect(results).toHaveLength(1)
    expect(results.findIndex(r => r.id === 7689927)).not.toBe(-1)
  })

  test('returns projects based on IUCN status', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'vulneRable'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    expect(results).toHaveLength(1)
    expect(results.findIndex(r => r.id === 7689929)).not.toBe(-1)
  })

  test('returns projects based on taxon', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'insects'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    expect(results).toHaveLength(1)
    expect(results.findIndex(r => r.id === 7689929)).not.toBe(-1)
  })

  test('returns projects that have threatened species', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'ThreateneD sPecies'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    expect(results).toHaveLength(3)
    expect(results.findIndex(r => r.id === 7689927)).not.toBe(-1)
    expect(results.findIndex(r => r.id === 7689928)).not.toBe(-1)
    expect(results.findIndex(r => r.id === 7689929)).not.toBe(-1)
  })

  test('returns projects based on species status and taxon', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'vulnerable butterflies'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    expect(results).toHaveLength(1)
    const mostRelevant = results[0]
    expect(mostRelevant.id).toBe(7689929)
  })

  test('returns projects based on a combination of species status, taxon and country', async () => {
    // Arrange
    const app = await makeApp(routesSearch)

    // Act
    const response = await app.inject({
      method: GET,
      url: searchRoute,
      query: {
        type: 'project',
        q: 'endangered birds in Greece'
      }
    })

    expect(response.statusCode).toBe(200)
    const results = JSON.parse(response.body) as SearchResponseProject[]
    const mostRelevant = results[0]
    expect(mostRelevant.id).toBe(7689928)
  })
})
