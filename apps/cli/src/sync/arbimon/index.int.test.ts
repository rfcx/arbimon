import { ConnectionOptions } from 'mysql2/promise'
import { expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { syncProjects } from './index'

function arbimonTestDb (): ConnectionOptions {
  const connection: ConnectionOptions = {}
  // TODO create the in-memory db and populate it
  return connection
}

test('Contains 1 project', async () => {
  // Arrange
  const connection = arbimonTestDb()
  const biodiversitySequelize = getSequelize()

  // Act
  await syncProjects(connection, biodiversitySequelize)

  // Assert
  const models = ModelRepository.getInstance(biodiversitySequelize)
  const projects = await models.LocationProject.findAll()
  expect(projects.length).toBe(1)
})
