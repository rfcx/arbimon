import { describe, test } from 'vitest'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getSequelize } from '@/db/connections'
import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { syncArbimonProjects } from './sync-arbimon-project'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()
const biodiversitySequelize = await getSequelize()

describe('sync arbimon project', () => {
  test('can sync first project', async () => {
    // Act
    await syncArbimonProjects(arbimonSequelize, biodiversitySequelize, dayjs.utc('1980-01-01 00:00:00').toDate())

    // Assert
    const projectsInBio = await ModelRepository.getInstance(biodiversitySequelize).Project.findAll()
    expect(projectsInBio.length).toBe(1)
    expect(projectsInBio[0].idArbimon).toBe(1920)
  })

  /*
  sync limit: 2
  Project A -- already sync
  Project B
  Project C
  Project D

  Correct: BC
  Incorrect: AB or BCD or ABCD or CD
  */

  /*
    pnpm test-int -- -t "sync arbimon project"
   */
  test.todo('respects limit') // Set limit to 2, add 3 projects to Arbimon, sync, check exactly 2 were syncd
  test.todo('syncs projects in order') // Check syncs BC (and not D)
})
