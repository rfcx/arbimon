import { type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'

export interface ValidationResultFilterInner {
  label: string
  value: ReviewStatus | 'all'
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
    value: 'rejected'
  },
  {
    label: 'Unknown',
    value: 'uncertain'
  },
  {
    label: 'Present',
    value: 'confirmed'
  },
  {
    label: 'Unvalidated',
    value: 'unreviewed'
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
