import { RichnessByExportReport } from '@rfcx-bio/common/api-bio/richness/richness-export'
import { TAXONOMY_CLASSES } from '@rfcx-bio/common/mock-data'
import { JsZipFile, toCsv, zipAndDownload } from '@rfcx-bio/utils/file'

import { getCSVDatasetMetadata } from '~/export'
import { ColoredFilter, getExportDateTime, getExportFilterName, getExportGroupName } from '~/filters'

export const downloadCsvReports = async (filters: ColoredFilter[], datasets: RichnessByExportReport[][], reportPrefix: string): Promise<void> => {
  const exportDateTime = getExportDateTime()

  const files = await Promise.all(
    filters.map(async (filter, idx) => await getCsvFile(filter, datasets[idx], reportPrefix, exportDateTime, idx)))

  const metadataFile = await getCSVDatasetMetadata(filters)
  files.push(metadataFile)

  const groupName = getExportGroupName(reportPrefix, exportDateTime)
  await zipAndDownload(files, groupName)
}

const getCsvFile = async ({ startDate, endDate, sites: siteGroups, otherFilters }: ColoredFilter, dataAsJson: RichnessByExportReport[], reportPrefix: string, exportTime: string, datasetIndex: number): Promise<JsZipFile> => {
  // const sites = siteGroups.flatMap(sg => sg.value)
  const taxonFilterIds = otherFilters.filter(({ propertyName }) => propertyName === 'taxon').map(({ value }) => value) as number[]
  const taxonFilter = TAXONOMY_CLASSES.filter(({ id }) => taxonFilterIds.includes(id)).map(({ name }) => name)
  const filename = getExportFilterName(startDate, endDate, reportPrefix, datasetIndex, exportTime, siteGroups, taxonFilter) + '.csv'
  const data = await toCsv(dataAsJson)

  return { filename, data }
}
