import { expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '@/db/connections'
import { syncProjects } from './index'
import { Sequelize } from 'sequelize'

function arbimonTestDb (): Sequelize {
  const sequelize = new Sequelize('sqlite::memory:')
  // TODO Populate it
  return sequelize
}

test('Contains 1 project', async () => {
  // Arrange
  const arbimonSequelize = arbimonTestDb()
  const biodiversitySequelize = getSequelize()

  // Act
  await syncProjects(arbimonSequelize, biodiversitySequelize)

  // Assert
  const models = ModelRepository.getInstance(biodiversitySequelize)
  const projects = await models.LocationProject.findAll()
  expect(projects.length).toBe(1)
})
