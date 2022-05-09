import { JsZipFile, toCsv } from '@rfcx-bio/utils/file'

import { DetectionFilter } from '~/filters'
import { DatasetMetadata } from './types'

const META_DATE_FORMAT = 'YYYY/MM/DD'

export async function getCSVDatasetMetadata (filters: DetectionFilter[]): Promise<JsZipFile> {
  const data = await toCsv(getDatasetMetadata(filters))
  return {
    filename: 'metadata.csv',
    data
  }
}

export function getDatasetMetadata (filters: DetectionFilter[]): DatasetMetadata[] {
  return filters.map(({ siteGroups, dateStartLocal, dateEndLocal, taxonClasses }, datasetIdx) => {
    const sites = siteGroups.map(({ sites }) => sites)
    const sitesNames = [...new Set(sites.flatMap(group => group.map(({ name }) => name)))]
      .sort((a, b) => a.localeCompare(b))
    const taxonNames = taxonClasses.map(({ commonName }) => commonName)

    return {
      name: `Dataset ${datasetIdx + 1}`,
      start: dateStartLocal.format(META_DATE_FORMAT),
      end: dateEndLocal.format(META_DATE_FORMAT),
      sites: sitesNames.length > 0 ? sitesNames.join(',') : 'All sites',
      taxons: taxonNames.length > 0 ? taxonNames.join(',') : 'All taxons'
    }
  })
}
