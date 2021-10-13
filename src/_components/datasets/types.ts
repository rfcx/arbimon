import { Dayjs } from 'dayjs'

import { Site } from '@/_services/api'

// TODO 93 - Remove colors & simplify
export interface Filter {
  sites: Site[]
  startDate: Dayjs
  endDate: Dayjs
}

export interface ColoredFilter extends Filter {
  color: string
}
