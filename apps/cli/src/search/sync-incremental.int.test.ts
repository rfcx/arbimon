import minMax from 'dayjs/plugin/minMax'
import { Op } from 'sequelize'
import { afterEach, beforeEach, describe, expect, it, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { makeProject } from '@/../../../packages/testing/src/model-builders/project-model-builder'
import { getSequelize } from '@/db/connections'
import { syncAllProjectsIncrementally } from './incremental'
import { getOpenSearchClient } from './opensearch/utilities'

dayjs.extend(minMax)

const opensearchClient = getOpenSearchClient()
const sequelize = getSequelize()
const { LocationProject, SyncStatus, LocationProjectProfile } = ModelRepository.getInstance(sequelize)

beforeEach(async () => {
  const p1 = makeProject(839483, 'Acton diversities', 'published')
  const p2 = makeProject(849483, 'Alford diversities', 'published')
  const p3 = makeProject(859483, 'Amble diversities', 'published')

  await LocationProject.create(p1)
  await LocationProject.create(p2)
  await LocationProject.create(p3)
})

afterEach(async () => {
  await LocationProjectProfile.destroy({ where: { locationProjectId: { [Op.in]: [839483, 849483, 859483] } }, force: true })
  await LocationProject.destroy({ where: { id: { [Op.in]: [839483, 849483, 859483] } }, force: true })
})

describe('incremental reindex from postgres to opensearch', async () => {
  it('incremental reindex do a full reindex when there\'s no sync_status entry', async () => {
    // Arrange
    await SyncStatus.destroy({ where: { syncSourceId: 300, syncDataTypeId: 800 }, force: true })

    // Act
    await syncAllProjectsIncrementally(opensearchClient, sequelize)

    // Assert
    const status = await SyncStatus.findOne({ where: { syncSourceId: 300, syncDataTypeId: 800 } })
    expect(status).toBeDefined()
  })

  it('a deleted project is also deleted from opensearch', async () => {
    // Arrange
    await syncAllProjectsIncrementally(opensearchClient, sequelize)
    await LocationProject.destroy({ where: { id: 839483 } })

    // Act
    await syncAllProjectsIncrementally(opensearchClient, sequelize)

    // Assert
    await expect(opensearchClient.get({ index: 'projects', id: '839483' })).rejects.toThrow()
  })

  it('sync until date should be different between each incremental index', async () => {
    // Act
    await syncAllProjectsIncrementally(opensearchClient, sequelize)
    const status1 = await SyncStatus.findOne({ where: { syncSourceId: 300, syncDataTypeId: 800 } })

    await syncAllProjectsIncrementally(opensearchClient, sequelize)
    const status2 = await SyncStatus.findOne({ where: { syncSourceId: 300, syncDataTypeId: 800 } })

    // Assert
    expect(dayjs(status1?.syncUntilDate).isBefore(dayjs(status2?.syncUntilDate))).toBe(true)
  })

  it('updates project that have the description inside the location_project_profile table updated', async () => {
    // Arrange
    await LocationProjectProfile.create({ locationProjectId: 859483, summary: 'welcome guys', image: '', readme: '', methods: '', keyResult: '', resources: '', objectives: [], dateStart: null, dateEnd: null })

    // Act
    await syncAllProjectsIncrementally(opensearchClient, sequelize)

    // Assert
    const result = await opensearchClient.get({ index: 'projects', id: '859483' })
    expect(result.body._source.summary).toBe('welcome guys')
  })

  test('previously published projects that got hidden will get removed from opensearch', async () => {
    // Arrange
    await syncAllProjectsIncrementally(opensearchClient, sequelize)
    await LocationProject.update({ status: 'hidden', statusUpdatedAt: new Date() }, { where: { id: 839483 } })

    // Act
    await syncAllProjectsIncrementally(opensearchClient, sequelize)

    // Assert
    await expect(opensearchClient.get({ index: 'projects', id: '839483' })).rejects.toThrow()
  })
})
