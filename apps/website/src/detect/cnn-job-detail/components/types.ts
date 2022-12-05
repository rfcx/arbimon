export interface ValidationFilterConfig {
  threshold: number
  validationStatus: string
  taxonClass: string
  siteIds: string[]
  sortBy: string
}

export interface DetectionMedia {
  spectrogramUrl: string | null
  audioUrl: string | null
  id: number
  checked?: boolean
  validation: string
}

export interface DetectionValidationStatus {
  value: string
  label: string
  checked: boolean
}
