import { Dayjs } from 'dayjs'

import { Site } from '~/api'

// TODO 93 - Remove colors & simplify
export interface Filter {
  sites: Site[]
  startDate: Dayjs
  endDate: Dayjs
  otherFilters: OptionalFilter[]
}

export interface ColoredFilter extends Filter {
  color: string
}
