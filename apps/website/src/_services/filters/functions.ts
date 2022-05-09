import { Dayjs } from 'dayjs'

import { FilterDatasetQuery } from '@rfcx-bio/common/api-bio/common/filter'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { useStore } from '~/store'
import { DetectionFilter, DetectionFilterSiteGroup } from './types'

export function getExportGroupName (prefix: string, exportDatetime: string = getExportDateTime()): string {
  const project = useStore().selectedProject
  const projectName = project?.name?.replaceAll(' ', '-') ?? 'None'
  return `${projectName}--${prefix.replaceAll(' ', '-')}--${exportDatetime}`
}

export function getExportFilterName (startDate: Dayjs, endDate: Dayjs, prefix: string, datasetIndex: number, dateGroup?: string, siteGroups?: DetectionFilterSiteGroup[], taxonFilter?: string[]): string {
  const project = useStore().selectedProject

  const projectName = project?.name?.replaceAll(' ', '-') ?? 'None'
  const siteName = siteGroups ? `--${getSiteName(siteGroups).replaceAll(' ', '_')}` : ''
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

function getSiteName (siteGroups: DetectionFilterSiteGroup[]): string {
  const siteLength = siteGroups.length
  switch (siteLength) {
    case 0: return 'All sites'
    case 1: return siteGroups[0].label
    default: return `${siteGroups[0].label} + ${siteLength - 1} other sites`
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

export function detectionFilterToDatasetQuery (filter: DetectionFilter): FilterDatasetQuery {
  return {
    startDate: filter.dateStartLocal.toISOString(),
    endDate: filter.dateEndLocal.toISOString(),
    siteIds: filter.siteGroups.flatMap(({ sites }) => sites.map(({ id }) => id.toString())),
    taxonClassIds: filter.taxonClasses.map(tc => tc.id.toString())
  }
}

export function generateFilterQuery (rawFilter: DetectionFilter): string {
  const rawQuery = detectionFilterToDatasetQuery(rawFilter)

  const siteIdsStringArray = (new URLSearchParams(rawQuery.siteIds.map(id => ['siteIds', id]))).toString()
  const taxonsStringArray = (new URLSearchParams(rawQuery.taxonClassIds.map(id => ['taxonClassIds', id]))).toString()

  let params = Object.entries({ startDate: rawQuery.startDate, endDate: rawQuery.endDate }).map(([key, value]) => `${key}=${value}`).join('&')

  if (siteIdsStringArray) {
    params = `${params}&${siteIdsStringArray}`
  }

  if (taxonsStringArray) {
    params = `${params}&${taxonsStringArray}`
  }

  return params
}
