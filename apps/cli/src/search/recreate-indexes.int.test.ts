import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { makeProject } from '@/../../../packages/testing/src/model-builders/project-model-builder'
import { getSequelize } from '@/db/connections'
import * as mappings from './opensearch/mappings'
import { getOpenSearchClient } from './opensearch/utilities'
import { recreateIndexes } from './recreate-index'

const client = getOpenSearchClient()
const sequelize = getSequelize()
const { LocationProject, SyncStatus } = ModelRepository.getInstance(sequelize)

beforeAll(async () => {
  const project1 = makeProject(594854, 'Selma Squirrel Towns', 'published')
  const project2 = makeProject(594855, 'Anchorage City Biodiversity', 'published')

  await LocationProject.create(project1)
  await LocationProject.create(project2)
})

afterAll(async () => {
  await LocationProject.destroy({ where: { id: 594854 }, force: true })
  await LocationProject.destroy({ where: { id: 594855 }, force: true })
})

describe('delete and recreating the index', async () => {
  test('the newly created projects should get synced over', async () => {
    // Act
    await recreateIndexes(client, sequelize)

    // Assert
    const project = await client.get({ index: 'projects', id: '594854' })
    expect(project.body).toBeDefined()
  })

  test('the sync_status should get set after index gets recreated', async () => {
    // Arrange
    await SyncStatus.destroy({ where: { syncSourceId: 300, syncDataTypeId: 800 }, force: true })

    // Act
    await recreateIndexes(client, sequelize)

    // Assert
    const status = await SyncStatus.findOne({ where: { syncSourceId: 300, syncDataTypeId: 800 } })
    expect(status).toBeDefined()
  })

  test('updated mappings should get reflected', async () => {
    // Arrange
    // @ts-expect-error this is needed to shut tsc up
    const spy = vi.spyOn(mappings, 'getMappings').mockReturnValue({ properties: { some_weird_column: { type: 'keyword', ignore_above: 256 } } })

    // Act
    await recreateIndexes(client, sequelize)

    // Assert
    expect(spy).toHaveBeenCalled()
    const indexInfo = await client.indices.get({ index: 'projects' })
    // INFO: The reason behind why we cannot directly compare 2 keys is because of
    // (dynamic mapping)[https://opensearch.org/docs/latest/field-types/#dynamic-mapping]
    // Basically opensearch can infer the types from the incoming data if there is a new property in the document.
    expect(indexInfo.body.projects.mappings.properties).toHaveProperty('some_weird_column')
  })
})
