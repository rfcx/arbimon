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

export type TaxonSpeciesCallLight = Pick<TaxonSpeciesCall,
  'callType' |
  'callMediaSpecUrl' |
  'callMediaWavUrl' |
  'callMediaRedirectUrl'
>

export const ATTRIBUTES_TAXON_SPECIES_CALL: Record<string, Array<keyof TaxonSpeciesCall>> = {
  light: ['callType', 'callMediaSpecUrl', 'callMediaWavUrl', 'callMediaRedirectUrl']
}
