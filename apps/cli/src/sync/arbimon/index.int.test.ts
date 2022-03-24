import { beforeAll, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getPopulatedArbimonInMemorySequelize } from '@/data-ingest/_testing/arbimon'
import { getSequelize } from '@/db/connections'
import { syncProjects } from './index'

// Arrange
const testProjectSlug = 'rfcx-th'
const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = getSequelize()

beforeAll(async () => {
  await syncProjects(arbimonSequelize, biodiversitySequelize)
})
test('New project created', async () => {
  // Assert
  const models = ModelRepository.getInstance(biodiversitySequelize)
  const project = await models.LocationProject.findOne({ where: { slugArbimon: testProjectSlug } })
  expect(project).toBeDefined()
})

test('Project name updated', async () => {
  const projectName = 'Kitty at NU'
  void arbimonSequelize.query(`update projects set name = '${projectName}'`)

  // Act
  await syncProjects(arbimonSequelize, biodiversitySequelize)

  // Assert
  const project = await ModelRepository.getInstance(biodiversitySequelize)
    .LocationProject
    .findOne({ where: { slugArbimon: testProjectSlug } })
    expect(project?.name).toBe(projectName)
})
