import { attributes, AttributeTypes } from '../type-helpers'

export interface TaxonSpeciesCall {
  id: number
  idArbimon: number
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

export const ATTRIBUTES_TAXON_SPECIES_CALL = attributes<TaxonSpeciesCall>()({
  light: ['callType', 'callMediaSpecUrl', 'callMediaWavUrl', 'callMediaRedirectUrl']
})

export type TaxonSpeciesCallTypes = AttributeTypes< TaxonSpeciesCall, typeof ATTRIBUTES_TAXON_SPECIES_CALL>
