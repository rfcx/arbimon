import { beforeAll, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

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
    .LocationProject
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
    .LocationSite
    .count({ where: { locationProjectId: testProjectId } })

  expect(numberOfSites).toBe(2)
})

test('Species: Test project has 10 species - based on validated data', async () => {
  const numberOfSpecies = await ModelRepository.getInstance(biodiversitySequelize)
    .SpeciesInProject
    .count({ where: { locationProjectId: testProjectId } })

  expect(numberOfSpecies).toBe(10)
})

test('Detections: detected hemidactylium-scutatum 4 times at NU - Eng between 10am', async () => {
  const speciesId = await ModelRepository.getInstance(biodiversitySequelize)
    .TaxonSpecies
    .findOne({
      where: { slug: 'hemidactylium-scutatum' },
      raw: true
    }).then(v => {
      return v?.id
    })

  expect(speciesId).toBeDefined()

  // TODO: continue on this
})

test('Create new datasource', async () => {})

test('Update existing datasource', async () => {})
