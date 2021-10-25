import { Dayjs } from 'dayjs'

import { Filter } from '~/dataset-filters'
import { dayjs } from '~/dayjs'
import { useStore } from '~/store'
import { Site } from '../api'

export const EXPORT_DATE_FORMAT = 'YYMMDD'

export function getFilterFriendlyName (filter: Filter): string {
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
