import { type Dayjs } from 'dayjs'

import { type DatasetQueryParams } from '@rfcx-bio/common/api-bio/_helpers'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { type SiteGroup } from '~/filters'
import { useStore } from '~/store'
import { type ComparisonFilter } from './types'

export function filterToQuery ({ startDate, endDate, sites, otherFilters }: ComparisonFilter): DatasetQueryParams {
  return {
    dateStartInclusiveLocalIso: startDate.toISOString(),
    dateEndInclusiveLocalIso: endDate.toISOString(),
    siteIds: sites.flatMap(sg => sg.value.map(s => s.id)),
    taxonClassIds: otherFilters.filter(f => f.propertyName === 'taxon').map(f => f.value as number)
  }
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

function getTaxonFilterName (taxonFilter: string[]): string {
  switch (taxonFilter.length) {
    case 0: return ''
    case 1: return `Taxon=${taxonFilter[0]}--`
    case 2: return `Taxon=${taxonFilter[0]}&${taxonFilter[1]}--`
    default: return `Taxon=${taxonFilter?.[0]}+ ${taxonFilter.length - 1} other taxons--`
  }
}
