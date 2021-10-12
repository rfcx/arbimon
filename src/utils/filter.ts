import { Dayjs } from 'dayjs'

import { SiteModels, SpeciesRichnessFilter } from '@/models'
import { VuexService } from '@/services'

function getDateFormatted (startDate: Dayjs, endDate: Dayjs, dateFormat: string): string {
  const start = startDate.format(dateFormat)
  const end = endDate.format(dateFormat)
  return startDate.isSame(endDate, 'date') ? `${start} - ${end}` : start
}

export function getFilterExportName (startDate: Dayjs, endDate: Dayjs, sites: SiteModels.Site[], prefix: string): string {
  const project = VuexService.Project.selectedProject.get()

  let siteName = 'All_Sites'
  const siteLength = sites.length
  if (siteLength === 1) {
    siteName = sites[0].name
  } else if (siteLength > 1) {
    siteName = `${sites[0].name}+${siteLength - 1}-other-sites`
  }

  const date = getDateFormatted(startDate, endDate, 'YYMMDD')

  return `${project?.name ?? 'None'}--${prefix}--${siteName}--${date}`
}

export function getFilterFriendlyName (filter: SpeciesRichnessFilter): string {
  const { startDate, endDate, sites } = filter

  let siteName = 'All sites'
  const siteLength = sites.length
  if (siteLength === 1) {
    siteName = sites[0].name
  } else if (siteLength > 1) {
    siteName = `${sites[0].name} + ${siteLength - 1} other sites`
  }

  const date = getDateFormatted(startDate, endDate, 'DD MMM YY')

  return `${siteName} (${date})`
}
