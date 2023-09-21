import { type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'

export interface ValidationFilterConfig {
  threshold: number
  validationStatus: ReviewStatus | 'all'
  classification: string
  siteIds: string[]
  sortBy: 'asc' | 'desc'
  range: string
}

export interface DetectionMedia {
  spectrogramUrl: string
  audioUrl: string
  id: string
  checked?: boolean
  validation: ReviewStatus
}

export interface DetectionValidationStatus {
  value: ReviewStatus
  label: string
  checked: boolean
}

export interface DetectionEvent {
  isSelected: boolean
  isShiftKeyHolding: boolean
  isCtrlKeyHolding: boolean
}
