import { FileData, toCsv } from '@rfcx-bio/utils/file'

import { ColoredFilter } from '~/filters'
import { DatasetMetadata } from './types'

const META_DATE_FORMAT = 'YYYY/MM/DD'

export async function getCSVDatasetMetadata (filters: ColoredFilter[]): Promise<FileData> {
  const data = await toCsv(getDatasetMetadata(filters))
  return {
    filename: 'metadata.csv',
    data
  }
}

export function getDatasetMetadata (filters: ColoredFilter[]): DatasetMetadata[] {
  return filters.map(({ sites, startDate, endDate, otherFilters }, datasetIdx) => {
    const sitesIds = sites.flatMap(({ value }) => value.flatMap(({ siteId }) => siteId))
    const taxons = otherFilters.filter(({ propertyName }) => propertyName === 'taxon').map(({ value }) => value)
    return {
      name: `Dataset ${datasetIdx + 1}`,
      start: startDate.format(META_DATE_FORMAT),
      end: endDate.format(META_DATE_FORMAT),
      sites: sitesIds.length > 0 ? sitesIds.join(',') : 'All sites',
      taxons: taxons.length > 0 ? taxons.join(',') : 'All taxons'
    }
  })
}
