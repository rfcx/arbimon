import { JsZipFile, toCsv } from '@rfcx-bio/utils/file'

import { ColoredFilter } from '~/filters'
import { DatasetMetadata } from './types'

const META_DATE_FORMAT = 'YYYY/MM/DD'

export async function getCSVDatasetMetadata (filters: ColoredFilter[]): Promise<JsZipFile> {
  const data = await toCsv(getDatasetMetadata(filters))
  return {
    filename: 'metadata.csv',
    data
  }
}

export function getDatasetMetadata (filters: ColoredFilter[]): DatasetMetadata[] {
  return filters.map(({ sites, startDate, endDate, otherFilters }, datasetIdx) => {
    const sitesNames = [...new Set(sites.flatMap(group => group.value.map(({ name }) => name)))]
      .sort((a, b) => a.localeCompare(b))
    const taxonNames = otherFilters.filter(({ propertyName }) => propertyName === 'taxon').map(({ value }) => value)

    return {
      name: `Dataset ${datasetIdx + 1}`,
      start: startDate.format(META_DATE_FORMAT),
      end: endDate.format(META_DATE_FORMAT),
      sites: sitesNames.length > 0 ? sitesNames.join(',') : 'All sites',
      taxons: taxonNames.length > 0 ? taxonNames.join(',') : 'All taxons'
    }
  })
}
