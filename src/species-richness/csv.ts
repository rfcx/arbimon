import { ColoredFilter } from '@/_services/dataset-filters'
import { getFilterExportGroupName, getFilterExportName } from '@/_services/dataset-filters/functions'
import { downloadZip, FileData, toCsv, zipFiles } from '@/_services/utils/file'
import { DatasetDefinition } from '~/api'
import { getAllDetections } from '~/api/detections-service'
import { dayjs } from '~/dayjs'

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
  const { name, exportTime } = getFilterExportGroupName(filters, reportPrefix)
  const zipUrl = await createSpeciesRichnessCsvZip(filters, reportPrefix, name, exportTime)
  downloadZip(zipUrl, name)
}

const getSpeciesRichnessCsvData = async (dataset: DatasetDefinition): Promise<ReportData[]> => {
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

const createSpeciesRichnessCsvZip = async (filters: ColoredFilter[], reportPrefix: string, name: string, exportTime: string): Promise<string> => {
  const csvData = await Promise.all(filters.map(async ({ startDate, endDate, sites, color }) => {
    const start = startDate.toISOString()
    const end = endDate.add(1, 'days').toISOString()
    return await getSpeciesRichnessCsvData({ start, end, sites })
  }))

  const filenames = filters.map(({ startDate, endDate, sites }) => getFilterExportName(startDate, endDate, reportPrefix, exportTime, sites))

  const files: FileData[] = await Promise.all(csvData.map(async (csvDatum, idx) => ({
    filename: `${filenames[idx]}.csv`,
    data: await toCsv(csvDatum)
  })))

  return await zipFiles(files, name)
}
