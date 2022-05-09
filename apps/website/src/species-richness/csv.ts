import { RichnessByExportReportRow } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { JsZipFile, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { getCSVDatasetMetadata } from '~/export'
import { DetectionFilter, getExportDateTime, getExportFilterName, getExportGroupName } from '~/filters'

export const downloadCsvReports = async (filters: DetectionFilter[], datasets: RichnessByExportReportRow[][], reportPrefix: string): Promise<void> => {
  const exportDateTime = getExportDateTime()

  const files = await Promise.all(
    filters.map(async (filter, idx) => await getCsvFile(filter, datasets[idx], reportPrefix, exportDateTime, idx)))

  const metadataFile = await getCSVDatasetMetadata(filters)
  files.push(metadataFile)

  const groupName = getExportGroupName(reportPrefix, exportDateTime)
  await zipAndDownload(files, groupName)
}

const getCsvFile = async ({ dateStartLocal, dateEndLocal, siteGroups, taxonClasses }: DetectionFilter, dataAsJson: RichnessByExportReportRow[], reportPrefix: string, exportTime: string, datasetIndex: number): Promise<JsZipFile> => {
  const taxonFilter = taxonClasses.map(({ commonName }) => commonName)
  const filename = getExportFilterName(dateStartLocal, dateEndLocal, reportPrefix, datasetIndex, exportTime, siteGroups, taxonFilter) + '.csv'
  const data = await toCsv(dataAsJson)

  return { filename, data }
}
