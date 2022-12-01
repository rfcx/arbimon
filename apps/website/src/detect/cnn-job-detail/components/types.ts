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
  id: number | null
  checked?: boolean
}
