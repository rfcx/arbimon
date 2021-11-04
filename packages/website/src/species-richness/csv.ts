import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { FileData, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { ColoredFilter } from '@/_services/dataset-filters'
import { getExportDateTime, getExportFilterName, getExportGroupName } from '@/_services/dataset-filters/functions'
import { DatasetDefinition } from '~/api'
import { getAllDetections } from '~/api/detections-service'

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

const getCsvFile = async ({ startDate, endDate, sites }: ColoredFilter, reportPrefix: string, exportTime: string): Promise<FileData> => {
  const start = startDate.toISOString()
  const end = endDate.add(1, 'days').toISOString()
  const filename = getExportFilterName(startDate, endDate, reportPrefix, exportTime, sites) + '.csv'

  const dataAsJson = await getCsvForDataset({ start, end, sites })
  const data = await toCsv(dataAsJson)

  return { filename, data }
}

const getCsvForDataset = async (dataset: DatasetDefinition): Promise<ReportData[]> => {
  return (await getAllDetections(dataset))
    .map(({ speciesName, siteName, latitude, longitude, date, hour }) => {
      const newDate = dayjs.utc(date)
      return {
        species: speciesName,
        site: siteName,
        latitude,
        longitude,
        day: newDate.format('D'),
        month: newDate.format('M'),
        year: newDate.format('YYYY'),
        date: newDate.format('M/DD/YYYY'),
        hour
      }
    })
}
