import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'
import { criticallyEndangeredSpeciesIds } from '@rfcx-bio/common/mock-data/critically-endangered-species'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { JsZipFile, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { getCSVDatasetMetadata } from '~/export'
import { ColoredFilter, getExportDateTime, getExportFilterName, getExportGroupName } from '~/filters'

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

export const downloadCsvReports = async (filters: ColoredFilter[], datasets: MockHourlyDetectionSummary[][], reportPrefix: string): Promise<void> => {
  const exportDateTime = getExportDateTime()

  const files = await Promise.all(
    filters.map(async (filter, idx) => await getCsvFile(filter, datasets[idx], reportPrefix, exportDateTime, idx)))

  const metadataFile = await getCSVDatasetMetadata(filters)
  files.push(metadataFile)

  const groupName = getExportGroupName(reportPrefix, exportDateTime)
  await zipAndDownload(files, groupName)
}

const getCsvFile = async ({ startDate, endDate, sites: siteGroups, otherFilters }: ColoredFilter, dataset: MockHourlyDetectionSummary[], reportPrefix: string, exportTime: string, datasetIndex: number): Promise<JsZipFile> => {
  // const sites = siteGroups.flatMap(sg => sg.value)
  const taxonFilter = otherFilters.filter(({ propertyName }) => propertyName === 'taxon').map(({ value }) => value)
  const filename = getExportFilterName(startDate, endDate, reportPrefix, datasetIndex, exportTime, siteGroups, taxonFilter) + '.csv'

  const dataAsJson = await getCsvForDataset(dataset)
  const data = await toCsv(dataAsJson)

  return { filename, data }
}

const getCsvForDataset = async (dataset: MockHourlyDetectionSummary[]): Promise<ReportData[]> => {
  return dataset
    .map(({ species_id: speciesId, scientific_name: species, name: site, lat: latitude, lon: longitude, alt: altitude, date, hour }) => {
      const newDate = dayjs.utc(date)
      const siteData = criticallyEndangeredSpeciesIds.has(speciesId)
        ? { site: 'redacted', latitude: 0, longitude: 0, altitude: 0 }
        : { site, latitude, longitude, altitude }

      return {
        species,
        ...siteData,
        day: newDate.format('D'),
        month: newDate.format('M'),
        year: newDate.format('YYYY'),
        date: newDate.format('M/DD/YYYY'),
        hour
      }
    })
}
