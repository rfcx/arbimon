import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

export interface ValidationResultFilterInner {
  label: string
  value: ArbimonReviewStatus
}

export interface ResultFilterInner {
  label: string
  value: string
}

export type ResultFilterList = Array<{ label: string, items: ResultFilterInner[] }>

export const validationStatus: ValidationResultFilterInner[] = [
  {
    label: 'Present',
    value: 'present'
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
