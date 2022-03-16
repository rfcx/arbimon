import { RichnessByExportReportRow } from '@rfcx-bio/common/api-bio/richness/richness-dataset'
import { TaxonClass } from '@rfcx-bio/common/dao/types'
import { JsZipFile, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { getCSVDatasetMetadata } from '~/export'
import { ColoredFilter, getExportDateTime, getExportFilterName, getExportGroupName } from '~/filters'

export const downloadCsvReports = async (filters: ColoredFilter[], datasets: RichnessByExportReportRow[][], reportPrefix: string, taxonClasses: TaxonClass[]): Promise<void> => {
  const exportDateTime = getExportDateTime()

  const files = await Promise.all(
    filters.map(async (filter, idx) => await getCsvFile(filter, datasets[idx], reportPrefix, exportDateTime, idx, taxonClasses)))

  const metadataFile = await getCSVDatasetMetadata(filters)
  files.push(metadataFile)

  const groupName = getExportGroupName(reportPrefix, exportDateTime)
  await zipAndDownload(files, groupName)
}

const getCsvFile = async ({ startDate, endDate, sites: siteGroups, otherFilters }: ColoredFilter, dataAsJson: RichnessByExportReportRow[], reportPrefix: string, exportTime: string, datasetIndex: number, taxonClasses: TaxonClass[]): Promise<JsZipFile> => {
  // const sites = siteGroups.flatMap(sg => sg.value)
  const taxonFilterIds = otherFilters.filter(({ propertyName }) => propertyName === 'taxon').map(({ value }) => value) as number[]
  const taxonFilter = taxonClasses.filter(tc => taxonFilterIds.includes(tc.id)).map(tc => tc.commonName)
  const filename = getExportFilterName(startDate, endDate, reportPrefix, datasetIndex, exportTime, siteGroups, taxonFilter) + '.csv'
  const data = await toCsv(dataAsJson)

  return { filename, data }
}
