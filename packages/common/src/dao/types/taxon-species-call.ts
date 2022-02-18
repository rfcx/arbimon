export interface TaxonSpeciesCall {
  id: number
  taxonSpeciesId: number
  callProjectId: number
  callSiteId: number
  callType: string
  callRecordedAt: Date
  callTimezone: string
  callMediaWavUrl: string
  callMediaSpecUrl: string
  callMediaRedirectUrl: string
}
