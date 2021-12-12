import { Dayjs } from 'dayjs'
import { groupBy, mapValues } from 'lodash-es'

import { Site } from '@rfcx-bio/common/api-bio-types/sites'
import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { useStore } from '~/store'
import { ComparisonFilter, DatasetParameters } from './types'

export function filterToDataset ({ startDate, endDate, sites, otherFilters }: ComparisonFilter): DatasetParameters {
  const start = startDate.toISOString()
  const end = endDate.add(1, 'days').toISOString()
  return { start, end, sites, otherFilters }
}

export const filterMocksByParameters = (detections: MockHourlyDetectionSummary[], datasetParams: DatasetParameters): MockHourlyDetectionSummary[] => {
  const { start, end, sites, otherFilters } = datasetParams

  // TODO - Extract this to UI filter package
  const propertyEqualFilters = mapValues(groupBy(otherFilters, 'propertyName'), f => f.map(v => v.value))
  const siteIds = sites.map(s => s.siteId)
  const taxonClasses = propertyEqualFilters.taxon ?? []
  const taxonSpecies = propertyEqualFilters.species ?? []

  // TODO - Move to API
  return detections.filter(r =>
    r.date >= start &&
    r.date < end &&
    (sites.length === 0 || siteIds.includes(r.stream_id)) &&
    (taxonClasses.length === 0 || taxonClasses.includes(r.taxon)) &&
    (taxonSpecies.length === 0 || taxonSpecies.includes(r.species_id.toString()))
  )
}

export const filterMocksBySpecies = (detections: MockHourlyDetectionSummary[], speciesId: number): MockHourlyDetectionSummary[] => {
  // TODO - Move to API
  return detections.filter(r => r.species_id === speciesId)
}

export function getFilterFriendlyName (filter: ComparisonFilter): string {
  const { startDate, endDate, sites } = filter

  const siteName = getSiteName(sites)
  const date = getDateFormatted(startDate, endDate, 'DD MMM YY')

  return `${siteName} (${date})`
}

export function getExportGroupName (prefix: string, exportDatetime: string = getExportDateTime()): string {
  const project = useStore().selectedProject
  const projectName = project?.name?.replaceAll(' ', '-') ?? 'None'
  return `${projectName}--${prefix.replaceAll(' ', '-')}--${exportDatetime}`
}

export function getExportFilterName (startDate: Dayjs, endDate: Dayjs, prefix: string, dateGroup?: string, sites?: Site[]): string {
  const project = useStore().selectedProject

  const projectName = project?.name?.replaceAll(' ', '-') ?? 'None'
  const siteName = sites ? `--${getSiteName(sites).replaceAll(' ', '_')}` : ''
  const date = dateGroup ? getDateFormatted(startDate, endDate, 'YYMMDD').replaceAll(' ', '') : `${getExportDateTime()}`

  // TODO: 271 add optional filter in the file name

  return `${projectName}--${prefix}${siteName}--${date}${dateGroup ? '--' + dateGroup : ''}`
}

export function getExportDateTime (): string {
  return dayjs().format('YYMMDDHHmmss')
}

function getDateFormatted (startDate: Dayjs, endDate: Dayjs, dateFormat: string): string {
  const start = startDate.format(dateFormat)
  const end = endDate.format(dateFormat)
  return startDate.isSame(endDate, 'date') ? start : `${start} - ${end}`
}

function getSiteName (sites: Site[]): string {
  const siteLength = sites.length
  switch (siteLength) {
    case 0: return 'All sites'
    case 1: return sites[0].name
    default: return `${sites[0].name} + ${siteLength - 1} other sites`
  }
}
