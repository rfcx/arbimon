import { isEmpty } from 'lodash-es'
import { type LocationQuery } from 'vue-router'

import { type ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/project/project-filters'
import { type Site, type TaxonClass } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { type FilterPropertyEquals, type SiteGroup } from '..'
import { FilterImpl } from '../classes'

const DATE_FORMAT = 'YYYY-MM-DD'

export function toQuery (filters: FilterImpl[]): LocationQuery {
  if (filters.length === 0) {
    return {}
  }
  const query: LocationQuery = {
    dss: filters.length.toString()
  }
  filters.forEach((filter: FilterImpl, i: number) => {
    const datasetPrefix = String.fromCharCode(97 + i)
    query[`${datasetPrefix}b`] = filter.startDate.format(DATE_FORMAT)
    query[`${datasetPrefix}e`] = filter.endDate.format(DATE_FORMAT)
    query[`${datasetPrefix}s`] = formatSites(filter.sites)
    query[`${datasetPrefix}t`] = filter.otherFilters.filter(f => f.propertyName === 'taxon').map(f => f.value.toString()).join(',')
  })
  return query
}

export function fromQuery (query: LocationQuery, projectFilters: ProjectFiltersResponse | undefined): FilterImpl[] {
  if (isEmpty(query.dss)) {
    return []
  }
  const numberOfDatasets = Number(query.dss)
  const results: FilterImpl[] = []
  for (let i = 0; i < numberOfDatasets; i++) {
    const datasetPrefix = String.fromCharCode(97 + i)
    const queryStartDate = (query[`${datasetPrefix}b`] as string | null) ?? projectFilters?.dateStartInclusiveUtc
    const queryEndDate = query[`${datasetPrefix}e`] as string | null ?? projectFilters?.dateEndInclusiveUtc
    const querySites = query[`${datasetPrefix}s`] as string | undefined
    const queryTaxons = query[`${datasetPrefix}t`] as string | undefined // as LocationQueryValue

    const startDate = dayjs.utc(queryStartDate).startOf('day')
    const endDate = dayjs.utc(queryEndDate).startOf('day')
    const sites = parseSiteGroups(querySites, projectFilters?.locationSites)
    const taxons = parseTaxons(queryTaxons, projectFilters?.taxonClasses)

    results.push(new FilterImpl(startDate, endDate, sites, taxons))
  }
  return results
}

function parseTaxons (queryTaxons: string | undefined, allTaxons: TaxonClass[] | undefined): FilterPropertyEquals[] | undefined {
  if (queryTaxons === undefined) return undefined
  const querySitesArr = queryTaxons.split(',')
  const taxons = querySitesArr.map(taxon => Number(taxon))
  return (allTaxons ?? []).filter(taxon => taxons.includes(taxon.id)).map(item => { return { propertyName: 'taxon', value: item.id } })
}

function parseSiteGroups (querySites: string | undefined, allSites: Site[] | undefined): SiteGroup[] | undefined {
  if (querySites === undefined) return undefined
  const siteGroup: SiteGroup[] = []
  const querySitesArr = querySites.split(',')
  const existingIds: number[] = []
  querySitesArr.forEach((label: string) => {
    if (Number(label)) {
      const [site] = (allSites ?? []).filter(site => site.id === Number(label))
      siteGroup.push({ label: site.name, value: [site] })
      existingIds.push(site.id)
    } else {
      const prefix = label.toLocaleLowerCase().substring(0, label.length - 1)
      const sites = (allSites ?? []).filter(site => site.name.toLocaleLowerCase().startsWith(prefix) && !existingIds.includes(site.id))
      siteGroup.push({ label, value: sites })
    }
  })
  return siteGroup
}

function formatSites (siteGroups: SiteGroup[]): string {
  const siteIds: string[] = []
  siteGroups.forEach((group: SiteGroup) => {
    if (group.value.length > 1) {
      siteIds.push(group.label)
    } else group.value.forEach(site => siteIds.push(site.id.toString()))
  })
  return siteIds.join(',')
}
