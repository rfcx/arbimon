import dayjs from 'dayjs'
import { Op } from 'sequelize'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { literalizeCountsByMinute } from '@rfcx-bio/common/dao/query-helpers/sequelize-literal-integer-array-2d'
import { type RecordingBySiteHour } from '@rfcx-bio/common/dao/types'

import { makeProject } from '@/../../../packages/testing/src/model-builders/project-model-builder'
import { getSequelize } from '@/db/connections'
import { fullReindex } from './full-reindex'
import { getOpenSearchClient } from './opensearch'

const opensearchClient = getOpenSearchClient()
const sequelize = getSequelize()
const { LocationProject, LocationProjectProfile, ProjectVersion, LocationSite, RecordingBySiteHour: RecordingBySiteHourModel } = ModelRepository.getInstance(sequelize)

const makeRecordingBySiteHour = (locationProjectId: number, locationSiteId: number, startDate: string, hourOffset: number): RecordingBySiteHour => {
  return {
    timePrecisionHourLocal: dayjs(startDate, 'YYYY-MM-DD').add(hourOffset, 'hour').toDate(),
    locationProjectId,
    locationSiteId,
    count: 60,
    countsByMinute: Array.from({ length: 59 }, (_, i) => [i, 1]),
    totalDurationInMinutes: 60
  }
}

// Before any test we recreate data in postgres
beforeEach(async () => {
  const project1 = makeProject(2431213, 'Fullham Diversity')
  const project2 = makeProject(2431214, 'Nottingham Diversity') // hidden by user
  const project3 = makeProject(2431215, 'Westham Diversity') // not enough recordings to be existed on the page
  await LocationProject.bulkCreate([project1, project2, project3], { updateOnDuplicate: ['slug', 'name', 'idArbimon', 'idCore'] })
  await ProjectVersion.create({ locationProjectId: project1.id, isPublished: false, isPublic: true })
  await ProjectVersion.create({ locationProjectId: project2.id, isPublished: false, isPublic: false })
  await ProjectVersion.create({ locationProjectId: project3.id, isPublished: false, isPublic: true })

  const project1Site = { id: 99221144, idCore: 'alskdmfiiee', idArbimon: 99221144, name: 'North Fullham 121e', locationProjectId: project1.id, latitude: 0, longitude: 0, altitude: 0, countryCode: 'US' }
  await LocationSite.bulkCreate([project1Site])
  const p1s1recordings = Array.from({ length: 20 }, (_, i) => {
    return literalizeCountsByMinute(makeRecordingBySiteHour(project1.id, project1Site.id, '2024-01-01', i), sequelize)
  })
  await RecordingBySiteHourModel.bulkCreate(p1s1recordings)
  await sequelize.query('REFRESH MATERIALIZED VIEW location_project_recording_metric')
})

// destroy data in postgres
afterEach(async () => {
  const locationProjectIds = [2431213, 2431214, 2431215]
  await RecordingBySiteHourModel.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
  await LocationSite.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
  await ProjectVersion.destroy({ where: { locationProjectId: { [Op.in]: locationProjectIds } } })
  await LocationProject.destroy({ where: { id: { [Op.in]: locationProjectIds } }, force: true })
})

test('connect and create indexes ', async () => {
  await fullReindex(opensearchClient, sequelize)

  const indices = await opensearchClient.cat.indices({ format: 'json' }).then(response => (response.body as Array<{ index: string }>).map(i => i.index))
  expect(indices).toContain('projects')
})

test('a reindex will sync the passed criteria projects over', async () => {
  await fullReindex(opensearchClient, sequelize)

  const response = await opensearchClient.search({
    index: 'projects',
    body: {
      query: {
        match: {
          name: {
            query: 'Fullham'
          }
        }
      }
    }
  })

  expect(response.body.hits.hits.length).toBe(1)
})

test.todo('a reindex wont sync unpassed criteria over', async () => {
  await fullReindex(opensearchClient, sequelize)

  const response = await opensearchClient.search({
    index: 'projects',
    body: {
      query: {
        match: {
          name: {
            query: 'Nottingham'
          }
        }
      }
    }
  })

  expect(response.body.hits.hits).toBeUndefined()
})

test.todo('a reindex will resync the projects after their contents are edited', async () => {
  const summary = '## Welcome to Fullham diversity'
  await LocationProjectProfile.update({ summary }, { where: { locationProjectId: 2431213 } })

  await fullReindex(opensearchClient, sequelize)

  const response = await opensearchClient.search({
    index: 'projects',
    body: {
      query: {
        match: {
          name: {
            query: 'Fullham'
          }
        }
      }
    }
  })

  expect(response.body.hits.hits[0]._source.summary).toBe(summary)
})

test.todo('a reindex will remove deleted projects', async () => {
  await LocationProject.update({ deletedAt: dayjs().toDate() }, { where: { id: 2431213 } })

  await fullReindex(opensearchClient, sequelize)

  const response = await opensearchClient.search({
    index: 'projects',
    body: {
      query: {
        match: {
          name: {
            query: 'Fullham'
          }
        }
      }
    }
  })

  expect(response.body.hits.hits).toBeUndefined()
})
