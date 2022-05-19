import { describe, expect, test } from 'vitest'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { getPopulatedArbimonInMemorySequelize } from '@/ingest/_testing/arbimon'
import { getArbimonProjects } from '@/ingest/inputs/arbimon-projects'

const arbimonSequelize = await getPopulatedArbimonInMemorySequelize()

describe('getArbimonProjects', () => {
  test('can get oldest project', async () => {
    // Act
    const actual = await getArbimonProjects(arbimonSequelize, dayjs.utc('1980-01-01 00:00:00').toDate())

    // Assert
    expect(actual.length).toBe(1)
    expect(actual[0].projectId).toBe(1920)
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
