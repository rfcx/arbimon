import { rawDetections } from '@rfcx-bio/common/mock-data'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { FileData, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { ColoredFilter, DatasetParameters, filterMocksByParameters, getExportDateTime, getExportFilterName, getExportGroupName } from '@/_services/filters'

export interface ReportData {
  species: string
  site: string
  latitude: number
  longitude: number
  day: string
  month: string
  year: string
  date: string
  hour: number
}

export const downloadCsvReports = async (filters: ColoredFilter[], reportPrefix: string): Promise<void> => {
  const exportDateTime = getExportDateTime()

  const files = await Promise.all(
    filters.map(async (filter) => await getCsvFile(filter, reportPrefix, exportDateTime)))

  const groupName = getExportGroupName(reportPrefix, exportDateTime)
  await zipAndDownload(files, groupName)
}

const getCsvFile = async ({ startDate, endDate, sites, otherFilters }: ColoredFilter, reportPrefix: string, exportTime: string): Promise<FileData> => {
  const start = startDate.toISOString()
  const end = endDate.add(1, 'days').toISOString()
  const filename = getExportFilterName(startDate, endDate, reportPrefix, exportTime, sites) + '.csv'

  const dataAsJson = await getCsvForDataset({ start, end, sites, otherFilters })
  const data = await toCsv(dataAsJson)

  return { filename, data }
}

const getCsvForDataset = async (dataset: DatasetParameters): Promise<ReportData[]> => {
  return (await filterMocksByParameters(rawDetections, dataset))
    .map(({ scientific_name: species, name: site, lat: latitude, lon: longitude, alt: altitude, date, hour }) => {
      const newDate = dayjs.utc(date)
      return {
        species,
        site,
        latitude,
        longitude,
        altitude,
        day: newDate.format('D'),
        month: newDate.format('M'),
        year: newDate.format('YYYY'),
        date: newDate.format('M/DD/YYYY'),
        hour
      }
    })
}
