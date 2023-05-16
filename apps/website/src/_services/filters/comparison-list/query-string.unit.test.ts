import { describe, expect, test } from 'vitest'

import { type ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/project/project-filters'
import { type Site, type TaxonClass } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { fromQuery, toQuery } from '@/_services/filters/comparison-list/query-string'
import { FilterImpl } from '../classes'
import { type FilterPropertyEquals, type SiteGroup } from '../types'

const DEFAULT_START = dayjs.utc('1990-01-01T00:00:00.000Z').startOf('day')
const DEFAULT_END = dayjs().utc().startOf('day')

describe('comparison-list > query-string > toQuery', () => {
  const SITE_1: Site = {
    id: 111111,
    idCore: 'qwerty',
    idArbimon: 1234,
    locationProjectId: 111,
    name: 'SITE_1',
    latitude: 49,
    longitude: 25,
    altitude: 0
  }
  const sites: SiteGroup[] = [{
    label: 'SITE_1',
    value: [SITE_1]
  }]
  const taxons: FilterPropertyEquals[] = [{
    propertyName: 'taxon',
    value: 200
  }]
  const filters: FilterImpl[] = [new FilterImpl(
    DEFAULT_START,
    DEFAULT_END,
    sites,
    taxons
  )
]
  test('succeeds for empty filters', async () => {
    // Arrange
    const filters: FilterImpl[] = []

    // Act
    const query = toQuery(filters)

    // Assert
    expect(query).toBeDefined()
    expect(query).toBeTypeOf('object')
    expect(query).toEqual({})
  })

  test('succeeds for filled filters', async () => {
    // Arrange
    const EXPECTED_PROPS = ['dss', 'ab', 'ae', 'as', 'at']
    const EXPECTED_QUERY = {
      dss: '1',
      ab: '1990-01-01',
      ae: '2023-05-16',
      as: ['111111'],
      at: ['200']
    }
    // Act
    const query = toQuery(filters)

    // Assert
    expect(query).toBeDefined()
    EXPECTED_PROPS.forEach(expectedProp => { expect(query).toHaveProperty(expectedProp) })
    expect(Object.keys(query)).toHaveLength(5)
    expect(query.dss).toBeTypeOf('string')
    expect(query).toEqual(EXPECTED_QUERY)
  })
})

describe('comparison-list > query-string > fromQuery', () => {
  const SITE_1: Site = {
    id: 111111,
    idCore: 'qwerty',
    idArbimon: 1234,
    locationProjectId: 111,
    name: 'SITE_1',
    latitude: 49,
    longitude: 25,
    altitude: 0
  }

  const sites: SiteGroup[] = [{
    label: 'SITE_1',
    value: [SITE_1]
  }]

  const taxons: FilterPropertyEquals[] = [{
    propertyName: 'taxon',
    value: 200
  }]

  const EXPECTED_FILTERS: FilterImpl[] = [new FilterImpl(
    dayjs.utc('2021-01-01T00:00:00.000Z').startOf('day'),
    dayjs.utc('2023-01-01T00:00:00.000Z').startOf('day'),
    sites,
    taxons
  )]

  const taxon: TaxonClass = {
    id: 200,
    idArbimon: 123,
    slug: 'bird',
    commonName: 'Bird'
  }

  const projectFilter: ProjectFiltersResponse = {
    locationSites: [SITE_1],
    taxonClasses: [taxon],
    dateStartInclusiveUtc: '2021-01-01T00:00:00.000Z',
    dateEndInclusiveUtc: '2023-01-01T00:00:00.000Z'
  }
  test('succeeds for empty query', async () => {
    // Act
    const query = fromQuery({}, undefined)

    // Assert
    expect(query).toBeDefined()
    expect(query).toEqual([])
  })

  test('succeeds for filled query', async () => {
    // Arrange
    const QUERY = {
      dss: '1',
      ab: '2021-01-01',
      ae: '2023-01-01',
      as: ['111111'],
      at: ['200']
    }
    // Act
    const filters = fromQuery(QUERY, projectFilter)

    // Assert
    expect(filters).toBeDefined()
    expect(filters).toEqual(EXPECTED_FILTERS)
  })
})
