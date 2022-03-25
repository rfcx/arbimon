import { beforeAll, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getPopulatedArbimonInMemorySequelize } from '@/data-ingest/_testing/arbimon'
import { getSequelize } from '@/db/connections'
import { syncAllForProject } from '@/sync/all'
import { syncProjects } from '@/sync/arbimon'

// Arrange
const testProjectIdArbimon = 1920
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
  await syncAllForProject(arbimonSequelize, biodiversitySequelize, project)
})

test('Extract sites correctly', async () => {
  const project = await ModelRepository.getInstance(biodiversitySequelize)
  .LocationProject
  .findOne({
    where: { idArbimon: testProjectIdArbimon },
    raw: true
  })

  const sites = await ModelRepository.getInstance(biodiversitySequelize)
  .LocationSite
  .findAll({
    where: { locationProjectId: project?.id },
    raw: true
  })

  expect(sites.length).toBe(2)
})
