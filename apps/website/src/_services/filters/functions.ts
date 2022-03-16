import { Dayjs } from 'dayjs'
import { groupBy, mapValues } from 'lodash-es'

import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { SiteGroup } from '~/filters'
import { useStore } from '~/store'
import { ComparisonFilter, DatasetParameters } from './types'

export function filterToDataset ({ startDate, endDate, sites, otherFilters }: ComparisonFilter): DatasetParameters {
  return {
    startDate: startDate,
    endDate: endDate,
    sites: sites.flatMap(sg => sg.value),
    otherFilters
  }
}

// ! TO BE REMVOE AFTER MOVE ALL RELATED FUNCTIONS TO API
export const filterMocksByParameters = (detections: MockHourlyDetectionSummary[], datasetParams: DatasetParameters): MockHourlyDetectionSummary[] => {
  const { startDate, endDate, sites, otherFilters } = datasetParams
  const start = startDate.toISOString()
  const end = endDate.add(1, 'day').toISOString()

  // TODO - Extract this to UI filter package
  const propertyEqualFilters = mapValues(groupBy(otherFilters, 'propertyName'), f => f.map(v => v.value))
  const siteIds = sites.map(s => s.id)
  const taxons = propertyEqualFilters.taxon ?? []
  const species = propertyEqualFilters.species ?? []

  // TODO - Move to API
  return detections.filter(r =>
    r.date >= start &&
    r.date < end &&
    (sites.length === 0 || siteIds.includes(r.site_id)) &&
    (taxons.length === 0 || taxons.includes(r.taxon)) &&
    (species.length === 0 || species.includes(r.species_id.toString()))
  )
}

// ! TO BE REMVOE AFTER MOVE ALL RELATED FUNCTIONS TO API
export const filterMocksBySpecies = (detections: MockHourlyDetectionSummary[], speciesId: number): MockHourlyDetectionSummary[] => {
  // TODO - Move to API
  return detections.filter(r => r.species_id === speciesId)
}

export function getFilterFriendlyName (filter: ComparisonFilter): string {
  const { startDate, endDate, sites } = filter

  const siteName = getSiteGroupName(sites)
  const date = getDateFormatted(startDate, endDate, 'DD MMM YY')

  return `${siteName} (${date})`
}

export function getExportGroupName (prefix: string, exportDatetime: string = getExportDateTime()): string {
  const project = useStore().selectedProject
  const projectName = project?.name?.replaceAll(' ', '-') ?? 'None'
  return `${projectName}--${prefix.replaceAll(' ', '-')}--${exportDatetime}`
}

export function getExportFilterName (startDate: Dayjs, endDate: Dayjs, prefix: string, datasetIndex: number, dateGroup?: string, sites?: SiteGroup[], taxonFilter?: string[]): string {
  const project = useStore().selectedProject

  const projectName = project?.name?.replaceAll(' ', '-') ?? 'None'
  const siteName = sites ? `--${getSiteName(sites).replaceAll(' ', '_')}` : ''
  const date = dateGroup ? getDateFormatted(startDate, endDate, 'YYMMDD').replaceAll(' ', '') : `${getExportDateTime()}`
  const indexPrefix = `${(datasetIndex + 1).toString() + '-'}`
  const taxonFilterName = getTaxonFilterName(taxonFilter ?? [])

  // TODO: 271 add optional filter in the file name

  return `${indexPrefix}${projectName}--${prefix}${siteName}--${taxonFilterName}${date}${dateGroup ? '--' + dateGroup : ''}`
}

export function getExportDateTime (): string {
  return dayjs().format('YYMMDDHHmmss')
}

function getDateFormatted (startDate: Dayjs, endDate: Dayjs, dateFormat: string): string {
  const start = startDate.format(dateFormat)
  const end = endDate.format(dateFormat)
  return startDate.isSame(endDate, 'date') ? start : `${start} - ${end}`
}

function getSiteName (sites: SiteGroup[]): string {
  const siteLength = sites.length
  switch (siteLength) {
    case 0: return 'All sites'
    case 1: return sites[0].label
    default: return `${sites[0].label} + ${siteLength - 1} other sites`
  }
}

function getSiteGroupName (sites: SiteGroup[]): string {
  const siteLength = sites.length
  switch (siteLength) {
    case 0: return 'All sites'
    case 1: return sites[0].label
    default: return `${sites[0].label} + ${siteLength - 1} other groups`
  }
}

function getTaxonFilterName (taxonFilter: string[]): string {
  switch (taxonFilter.length) {
    case 0: return ''
    case 1: return `Taxon=${taxonFilter[0]}--`
    case 2: return `Taxon=${taxonFilter[0]}&${taxonFilter[1]}--`
    default: return `Taxon=${taxonFilter?.[0]}+ ${taxonFilter.length - 1} other taxons--`
  }
}

export function generateFilterQuery (rawFilter: DatasetParameters): string {
  const siteIdsStringArray = (new URLSearchParams(rawFilter.sites.map(({ id }) => ['siteIds', id.toString()]))).toString()
  const taxonsStringArray = (new URLSearchParams(rawFilter.otherFilters.filter(({ propertyName }) => propertyName === 'taxon').map(({ value }) => ['taxons', value.toString()]))).toString()

  let params = Object.entries({ startDate: rawFilter.startDate.toISOString(), endDate: rawFilter.endDate.toISOString() }).map(([key, value]) => `${key}=${value}`).join('&')

  if (siteIdsStringArray) {
    params = `${params}&${siteIdsStringArray}`
  }

  if (taxonsStringArray) {
    params = `${params}&${taxonsStringArray}`
  }

  return params
}
