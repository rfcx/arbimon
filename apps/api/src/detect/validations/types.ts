export interface DetectionFilter {
  jobId: number
  siteIds: string[]
  statusId?: string
  classifierId?: string
  confidence?: string
}
