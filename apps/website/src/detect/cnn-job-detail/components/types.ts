import { type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-cnn-detections'

export interface ValidationFilterConfig {
  threshold: number
  validationStatus: ReviewStatus | 'all'
  taxonClass: string
  siteIds: string[]
  sortBy: 'asc' | 'desc'
}

export interface DetectionMedia {
  spectrogramUrl: string | null
  audioUrl: string | null
  id: string
  checked?: boolean
  validation: ReviewStatus
}

export interface DetectionValidationStatus {
  value: string
  label: string
  checked: boolean
}

export interface DetectionEvent {
  isSelected: boolean
  isShiftKeyHolding: boolean
  isCtrlKeyHolding: boolean
}
