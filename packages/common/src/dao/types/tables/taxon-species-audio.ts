import { AttributeConstants } from '../../type-helpers'

export interface TaxonSpeciesAudio {
  taxonSpeciesId: number
  order: number
  recordingProjectId: number
  recordingSiteId: number
  sourceUrl: string
  audioUrl: string
  spectrogramUrl: string
  songType: string
  recordedAt: Date
  timezone: string
}

export type TaxonSpeciesCallLight = Pick<TaxonSpeciesAudio,
  'sourceUrl' |
  'audioUrl' |
  'spectrogramUrl' |
  'songType'
>

export const ATTRIBUTES_TAXON_SPECIES_CALL: AttributeConstants<TaxonSpeciesAudio> = {
  light: ['sourceUrl', 'audioUrl', 'spectrogramUrl', 'songType']
}
