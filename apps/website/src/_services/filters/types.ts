import { Dayjs } from 'dayjs'

import { Site, TaxonClass } from '@rfcx-bio/common/dao/types'

export interface DetectionFilterSiteGroup {
  label: string
  sites: Site[]
}

export interface DetectionFilter {
  dateStartLocal: Dayjs
  dateEndLocal: Dayjs
  siteGroups: DetectionFilterSiteGroup[]
  taxonClasses: TaxonClass[]
}
