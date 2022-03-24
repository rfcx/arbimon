import { expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { syncProjects } from './index'
import { getPopulatedArbimonInMemorySequelize } from '@/data-ingest/_testing/arbimon'


test('Contains 1 project', async () => {
  // Arrange
  const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
  const biodiversitySequelize = getSequelize()

  // Act
  await syncProjects(arbimonSequelize, biodiversitySequelize)

  // Assert
  const models = ModelRepository.getInstance(biodiversitySequelize)
  const projects = await models.LocationProject.findAll()
  expect(projects.length).toBe(1)
})
