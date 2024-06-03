import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

export interface ValidationFilterConfig {
  threshold: number
  validationStatuses: ArbimonReviewStatus[]
  classification: string
  siteIds: string[]
  sortBy: 'asc' | 'desc'
  range: string
  minConfidence: number
}

export interface DetectionMedia {
  spectrogramUrl: string
  audioUrl: string
  id: number
  checked?: boolean
  validation: ArbimonReviewStatus
  score?: number
  site?: string
  siteIdCore?: string
  start?: string
}

export interface DetectionValidationStatus {
  value: ArbimonReviewStatus
  label: string
  checked: boolean
}

export interface DetectionEvent {
  isSelected: boolean
  isShiftKeyHolding: boolean
  isCtrlKeyHolding: boolean
}
