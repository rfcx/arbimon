import { Dayjs } from 'dayjs'

import { Filter } from '~/dataset-filters'
import { dayjs } from '~/dayjs'
import { VuexProject } from '~/store'
import { Site } from '../api'

export const EXPORT_DATE_FORMAT = 'YYMMDD'

interface ExportGroupName {
  name: string
  exportTime: string
}

export function formatDate (date: Dayjs, dateFormat: string = EXPORT_DATE_FORMAT): string {
  return date.format(dateFormat)
}

function getDateFormatted (startDate: Dayjs, endDate: Dayjs, dateFormat: string): string {
  const start = formatDate(startDate, dateFormat)
  const end = formatDate(endDate, dateFormat)
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

export function getFilterExportGroupName (filters: Filter[], prefix: string): ExportGroupName {
  const project = VuexProject.selectedProject.get()
  const projectName = project?.name?.replaceAll(' ', '-') ?? 'None'

  return { name: `${projectName}--${prefix.replaceAll(' ', '-')}--${getExportDateTime()}`, exportTime: getExportDateTime() }
}

export function getFilterExportName (startDate: Dayjs, endDate: Dayjs, prefix: string, dateGroup?: string, sites?: Site[]): string {
  const project = VuexProject.selectedProject.get()

  const projectName = project?.name?.replaceAll(' ', '-') ?? 'None'
  const siteName = sites ? `--${getSiteName(sites).replaceAll(' ', '_')}` : ''
  const date = dateGroup ? getDateFormatted(startDate, endDate, 'YYMMDD').replaceAll(' ', '') : `${getExportDateTime()}`

  return `${projectName}--${prefix}${siteName}--${date}${dateGroup ? '--' + dateGroup : ''}`
}

export function getFilterFriendlyName (filter: Filter): string {
  const { startDate, endDate, sites } = filter

  const siteName = getSiteName(sites)
  const date = getDateFormatted(startDate, endDate, 'DD MMM YY')

  return `${siteName} (${date})`
}

export function getExportDateTime (): string {
  return dayjs().format('YYMMDDHHmmss')
}
