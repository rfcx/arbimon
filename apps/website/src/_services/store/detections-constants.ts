import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

export interface ValidationResultFilterInner {
  label: string
  value: ArbimonReviewStatus | 'all'
}

export interface ResultFilterInner {
  label: string
  value: string
}

export type ResultFilterList = Array<{ label: string, items: ResultFilterInner[] }>

export const validationStatus: ValidationResultFilterInner[] = [
  {
    label: 'All',
    value: 'all'
  },
  {
    label: 'Not Present',
    value: 'notPresent'
  },
  {
    label: 'Unknown',
    value: 'unknown'
  },
  {
    label: 'Present',
    value: 'present'
  },
  {
    label: 'Unvalidated',
    value: 'unvalidated'
  }
]

export const sortByOptions: ResultFilterInner[] = [
  {
    label: 'Low to high',
    value: 'asc'
  },
  {
    label: 'High to low',
    value: 'desc'
  }
]
