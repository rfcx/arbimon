import { describe, expect, test } from 'vitest'

import { type ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/project/project-filters'
import { type Site, type TaxonClass } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { fromQuery, toQuery } from '@/_services/filters/comparison-list/query-string'
import { FilterImpl } from '../classes'
import { type FilterPropertyEquals, type SiteGroup } from '../types'

function singleSiteGroup (id: number, name: string): SiteGroup {
  return { label: name, value: [{ id, name }] as Site[] }
}
function wildcardSiteGroup (count: number, startingId: number, prefix: string): SiteGroup {
  return { label: prefix + '*', value: Array.from(Array(count).keys()).map(i => ({ id: startingId + i, name: `${prefix}${i}` })) as Site[] }
}
function taxon (value: number): FilterPropertyEquals {
  return { propertyName: 'taxon', value }
}
const exampleStartDate = dayjs.utc('2022-03-01T00:00Z')
const exampleEndDate = dayjs.utc('2022-08-31T23:59Z')

describe('comparison-list > query-string > toQuery', () => {
  test('empty filters', async () => {
    // Act
    const query = toQuery([])

    // Assert
    expect(query).toBeDefined()
    expect(query).toBeTypeOf('object')
    expect(query).toEqual({})
  })

  test('1 filter with site and taxon', async () => {
    // Arrange
    const startDate = '2022-03-01'
    const endDate = '2022-08-31'
    const siteId = 5
    const taxonId = 200
    const filter: FilterImpl = new FilterImpl(
      dayjs.utc(startDate + 'T00:00Z'),
      dayjs.utc(endDate + 'T23:59Z'),
      [singleSiteGroup(siteId, 'ABC')],
      [taxon(taxonId)]
    )

    // Act
    const query = toQuery([filter])

    // Assert
    expect(Object.keys(query)).toHaveLength(5) // dss, ab, ae, as, at
    Object.values(query).forEach(value => { expect(value).toBeTypeOf('string') })
    expect(query.dss).toBe('1')
    expect(query.ab).toBe(startDate)
    expect(query.ae).toBe(endDate)
    expect(query.as).toBe(siteId.toString())
    expect(query.at).toBe(taxonId.toString())
  })

  test('1 filter without taxon', async () => {
    // Arrange
    const filter = new FilterImpl(exampleStartDate, exampleEndDate, [singleSiteGroup(5, 'ABC')])

    // Act
    const query = toQuery([filter])

    // Assert
    expect(Object.keys(query)).toHaveLength(4) // dss, ab, ae, as
    expect(query).not.toHaveProperty('at')
  })

  test('1 filter with a list of single sites', async () => {
    // Arrange
    const siteIds = [5, 6, 7]
    const filter = new FilterImpl(exampleStartDate, exampleEndDate, siteIds.map(i => singleSiteGroup(i, `ABC_${i}`)))

    // Act
    const query = toQuery([filter])

    // Assert
    expect(query.as).toBe(siteIds.join(','))
  })

  test('1 filter with a multiple sites using wildcard', async () => {
    // Arrange
    const wildcardPrefix = 'AB_'
    const filter = new FilterImpl(exampleStartDate, exampleEndDate, [wildcardSiteGroup(100, 1001, wildcardPrefix)])

    // Act
    const query = toQuery([filter])

    // Assert
    expect(query.as).toBe(wildcardPrefix + '*')
  })

  test('2 filters with dates, site and taxon', async () => {
    // Arrange
    const startDate = '2022-03-01'
    const endDate = '2022-08-31'
    const siteId1 = 5
    const siteId2 = 6
    const taxonId1 = 200
    const taxonId2 = 300
    const filters: FilterImpl[] = [
      new FilterImpl(
        dayjs.utc(startDate + 'T00:00Z'),
        dayjs.utc(endDate + 'T23:59Z'),
        [singleSiteGroup(siteId1, 'ABC')],
        [taxon(taxonId1)]
      ),
      new FilterImpl(
        dayjs.utc(startDate + 'T00:00Z'),
        dayjs.utc(startDate + 'T23:59Z'),
        [singleSiteGroup(siteId2, 'DEF')],
        [taxon(taxonId2)]
    )]
    const expectedKeys = ['dss', 'ab', 'ae', 'as', 'at', 'bb', 'be', 'bs', 'bt']

    // Act
    const query = toQuery(filters)

    // Assert
    expect(Object.keys(query)).toHaveLength(9) // dss, ab, ae, as, at, bb, be, bs, bt
    Object.values(query).forEach(value => { expect(value).toBeTypeOf('string') })
    Object.keys(query).forEach(key => { expectedKeys.includes(key) })
    expect(query.dss).toBe('2')
    expect(query.ab).toBe(startDate)
    expect(query.ae).toBe(endDate)
    expect(query.bb).toBe(startDate)
    expect(query.be).toBe(startDate)
    expect(query.as).toBe(siteId1.toString())
    expect(query.at).toBe(taxonId1.toString())
    expect(query.bs).toBe(siteId2.toString())
    expect(query.bt).toBe(taxonId2.toString())
  })

  test('2 filters with dates, multiple sites using wildcard, and taxons', async () => {
    // Arrange
    const startDate = '2022-03-01'
    const endDate = '2022-08-31'
    const wildcardPrefix1 = 'AB_'
    const wildcardPrefix2 = 'AB_'
    const siteIds1 = [5, 6, 7]
    const siteIds2 = [8, 9]
    const taxonIds1 = [200, 300]
    const taxonIds2 = [400, 500]
    const filters: FilterImpl[] = [
      new FilterImpl(
        dayjs.utc(startDate + 'T00:00Z'),
        dayjs.utc(endDate + 'T23:59Z'),
        [...new Set([wildcardSiteGroup(100, 1001, wildcardPrefix1)]), ...new Set(siteIds1.map(i => singleSiteGroup(i, `ABC_${i}`)))],
        taxonIds1.map(id => taxon(id))
      ),
      new FilterImpl(
        dayjs.utc(startDate + 'T00:00Z'),
        dayjs.utc(startDate + 'T23:59Z'),
        [...new Set([wildcardSiteGroup(200, 2001, wildcardPrefix2)]), ...new Set(siteIds2.map(i => singleSiteGroup(i, `ABC_${i}`)))],
        taxonIds2.map(id => taxon(id))
    )]

    // Act
    const query = toQuery(filters)

    // Assert
    expect(query.as).toBe(wildcardPrefix1 + '*,' + siteIds1.join(','))
    expect(query.at).toBe(taxonIds1.join(','))
    expect(query.bs).toBe(wildcardPrefix2 + '*,' + siteIds2.join(','))
    expect(query.bt).toBe(taxonIds2.join(','))
  })
})

describe('comparison-list > query-string > fromQuery', () => {
  const SITE_1 = { id: 201, name: 'GH_1' }
  const TAXON_BIRD = { id: 200, slug: 'bird' }
  const projectFilters: ProjectFiltersResponse = {
    locationSites: [{ id: 101, name: 'DEF_1' }, { id: 102, name: 'DEF_2' }, { id: 103, name: 'DEF_3' }, SITE_1] as Site[],
    taxonClasses: [TAXON_BIRD, { id: 300, slug: 'mammal' }] as TaxonClass[],
    dateStartInclusiveUtc: '2021-01-01T00:00:00.000Z',
    dateEndInclusiveUtc: '2023-01-01T00:00:00.000Z'
  }

  test('empty query', async () => {
    // Act
    const query = fromQuery({}, projectFilters)

    // Assert
    expect(query).toBeDefined()
    expect(query).toEqual([])
  })

  test('1 filter with dates and site', async () => {
    // Arrange
    const query = {
      dss: '1',
      ab: '2022-04-01',
      ae: '2022-10-31',
      as: SITE_1.id.toString()
    }

    // Act
    const filters = fromQuery(query, projectFilters)

    // Assert
    expect(filters).toHaveLength(1)
    const filter = filters[0]
    expect(filter.startDate).toEqual(dayjs.utc(query.ab))
    expect(filter.endDate).toEqual(dayjs.utc(query.ae))
    expect(filter.sites).toHaveLength(1)
    expect(filter.sites[0].label).toBe(SITE_1.name)
    expect(filter.sites[0].value).toHaveLength(1)
    expect(filter.sites[0].value[0].id).toBe(SITE_1.id)
  })

  test('1 filter including taxon', async () => {
    // Arrange
    const query = {
      dss: '1',
      ab: '2022-04-01',
      ae: '2022-10-31',
      as: SITE_1.id.toString(),
      at: TAXON_BIRD.id.toString()
    }

    // Act
    const filters = fromQuery(query, projectFilters)

    // Assert
    expect(filters[0].otherFilters).toHaveLength(1)
    expect(filters[0].otherFilters[0].propertyName).toBe('taxon')
    expect(filters[0].otherFilters[0].value).toBe(TAXON_BIRD.id)
  })

  test('1 filter without dates (use default from project)', async () => {
    // Arrange
    const query = {
      dss: '1',
      as: SITE_1.id.toString()
    }

    // Act
    const filters = fromQuery(query, projectFilters)

    // Assert
    const filter = filters[0]
    expect(filter.startDate).toEqual(dayjs.utc(projectFilters.dateStartInclusiveUtc))
    expect(filter.endDate).toEqual(dayjs.utc(projectFilters.dateEndInclusiveUtc))
  })

  test('2 filters with default project dates, site and taxon', async () => {
    // Arrange
    const query = {
      dss: '2',
      ab: '2021-01-01',
      ae: '2023-01-01',
      as: '101',
      at: '200',
      bb: '2023-01-01',
      be: '2023-01-01',
      bs: '102',
      bt: '300'
    }
    // Act
    const filters = fromQuery(query, projectFilters)

    // Assert
    expect(filters).toHaveLength(2)
    expect(filters[0].startDate).toEqual(dayjs.utc(projectFilters.dateStartInclusiveUtc))
    expect(filters[0].endDate).toEqual(dayjs.utc(projectFilters.dateEndInclusiveUtc))
    expect(filters[1].startDate).toEqual(dayjs.utc(projectFilters.dateEndInclusiveUtc))
    expect(filters[1].endDate).toEqual(dayjs.utc(projectFilters.dateEndInclusiveUtc))
    expect(filters[0].sites[0].label).toBe(projectFilters.locationSites.find(site => site.id === Number(query.as))?.name)
    expect(filters[1].sites[0].label).toBe(projectFilters.locationSites.find(site => site.id === Number(query.bs))?.name)
    expect(filters[0].otherFilters[0].value).toBe(projectFilters.taxonClasses.find(taxon => taxon.id === Number(query.at))?.id)
    expect(filters[1].otherFilters[0].value).toBe(projectFilters.taxonClasses.find(taxon => taxon.id === Number(query.bt))?.id)
  })

  test('2 filters with dates, multiple sites using wildcard, and taxons', async () => {
    // Arrange
    const query = {
      dss: '2',
      ab: '2022-01-01',
      ae: '2022-03-01',
      as: '101,DEF*',
      at: '200,300',
      bb: '2022-05-01',
      be: '2022-06-01',
      bs: '102,GH*',
      bt: '200,300'
    }
    // Act
    const filters = fromQuery(query, projectFilters)

    // Assert
    expect(filters[0].startDate).toEqual(dayjs.utc(query.ab))
    expect(filters[0].endDate).toEqual(dayjs.utc(query.ae))
    expect(filters[1].startDate).toEqual(dayjs.utc(query.bb))
    expect(filters[1].endDate).toEqual(dayjs.utc(query.be))
    expect((filters[0].sites.map(siteGroup => siteGroup.value)).reduce((r, a) => r.concat(a), [])).toHaveLength(3)
    expect((filters[1].sites.map(siteGroup => siteGroup.value)).reduce((r, a) => r.concat(a), [])).toHaveLength(2)
    expect(filters[0].otherFilters).toHaveLength(2)
    expect(filters[1].otherFilters).toHaveLength(2)
  })
})
