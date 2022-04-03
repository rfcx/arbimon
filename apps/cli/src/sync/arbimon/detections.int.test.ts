import { beforeAll, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'

import { getPopulatedArbimonInMemorySequelize } from '@/data-ingest/_testing/arbimon'
import { getSequelize } from '@/db/connections'
import { syncAllBasedOnDetectionsForProject, syncProjects } from '@/sync/arbimon'

// Arrange
const testProjectIdArbimon = 1920
let testProjectId = 1
const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = getSequelize()

beforeAll(async () => {
  // adding test project to the database
  await syncProjects(arbimonSequelize, biodiversitySequelize)

  // sync all data for a test project
  const project = await ModelRepository.getInstance(biodiversitySequelize)
    .Project
    .findOne({
      where: { idArbimon: testProjectIdArbimon },
      raw: true
    })

  if (!project) { return }
  testProjectId = project.id
  await syncAllBasedOnDetectionsForProject(arbimonSequelize, biodiversitySequelize, project)
})

test('Site: Test project has 2 sites - based on validated data', async () => {
  const numberOfSites = await ModelRepository.getInstance(biodiversitySequelize)
    .ProjectSite
    .count({ where: { projectId: testProjectId } })

  expect(numberOfSites).toBe(2)
})

test('Species: Test project has 10 species - based on validated data', async () => {
  const numberOfSpecies = await ModelRepository.getInstance(biodiversitySequelize)
    .SpeciesInProject
    .count({ where: { projectId: testProjectId } })

  expect(numberOfSpecies).toBe(10)
})

test('Detections: Test project has 14 row of detection summaries', async () => {
  const numberOfDetectionSummariesRows = await ModelRepository.getInstance(biodiversitySequelize)
    .DetectionBySiteSpeciesHour
    .count({ where: { projectId: testProjectId } })
  expect(numberOfDetectionSummariesRows).toBe(14)
})

test('Detections: Test project summaries counts match with manual calculation', async () => {
  // manual calculation: https://docs.google.com/spreadsheets/d/1poi_Ir_Di77kDY_h69-MdQy2Yi7dpxJTy5WOumxEQ-g/
  const detectionSummariesCountRows = await ModelRepository.getInstance(biodiversitySequelize)
    .DetectionBySiteSpeciesHour
    .findAll({
      where: { projectId: testProjectId },
      order: [['timePrecisionHourLocal', 'ASC'], ['locationSiteId', 'ASC'], ['taxonSpeciesId', 'ASC']]
    }).then(result => {
      return result.map(r => r.count)
    })
  expect(detectionSummariesCountRows).toEqual([3, 1, 3, 2, 2, 4, 1, 1, 1, 1, 2, 1, 2, 2])
})

test('Detections: Test site (NU - Eng) has 13 row of detection summaries', async () => {
  const locationSiteId = await getSiteIdFromIdArbimon(88526)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const numberOfDetectionSummariesRows = await ModelRepository.getInstance(biodiversitySequelize)
    .DetectionBySiteSpeciesHour
    .count({ where: { locationSiteId } })
  expect(numberOfDetectionSummariesRows).toBe(13)
})

test('Detections: detected hemidactylium-scutatum 4 times at NU - Eng between 10am (Local time) on 06/12/2020', async () => {
  const speciesId = await getSpeciesIdFromSlug('hemidactylium-scutatum')
  const siteId = await getSiteIdFromIdArbimon(88526)
  const date = '2020-12-06 10:00:00'

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detection = await getDetectionBySiteSpeciesHour(speciesId!, siteId!, date)
  const detectionCount = detection?.count ?? 0
  expect(detectionCount).toBe(4)
})

test('Create new datasource', async () => {})

test('Update existing datasource', async () => {})

// Helper

const getSpeciesIdFromSlug = async (slug: string): Promise<number | undefined> => {
  return await ModelRepository.getInstance(biodiversitySequelize)
    .TaxonSpecies
    .findOne({
      where: { slug },
      raw: true
    }).then(v => {
      return v?.id
    })
}

const getSiteIdFromIdArbimon = async (idArbimon: number): Promise<number | undefined> => {
  return await ModelRepository.getInstance(biodiversitySequelize)
    .ProjectSite
    .findOne({
      where: { idArbimon: idArbimon },
      raw: true
    }).then(v => {
      return v?.id
    })
}

const getDetectionBySiteSpeciesHour = async (taxonSpeciesId: number, locationSiteId: number, time: string): Promise<DetectionBySiteSpeciesHour | null> => {
  return await ModelRepository.getInstance(biodiversitySequelize)
    .DetectionBySiteSpeciesHour
    .findOne({
      where: {
        taxonSpeciesId,
        locationSiteId,
        timePrecisionHourLocal: time
      },
      raw: true
    })
}
