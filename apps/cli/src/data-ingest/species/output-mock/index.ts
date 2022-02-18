import { Species, SPECIES_SOURCE_IUCN, SPECIES_SOURCE_WIKI, SpeciesCall } from '@rfcx-bio/common/api-bio/species/types'
import { EXTINCTION_RISK_NOT_EVALUATED } from '@rfcx-bio/common/iucn'

import { ArbimonSpeciesData } from '../input-from-mock-detections'
import { IucnSpecies, IucnSpeciesNarrative } from '../input-iucn'
import { RfcxSpeciesData } from '../input-rfcx'
import { WikiSummary } from '../input-wiki'

export const getMergedSpecies = async (
  scientificNames: string[],
  arbimonSpeciesKeyed: Record<string, ArbimonSpeciesData>,
  arbimonSpeciesCallsKeyed: Record<string, SpeciesCall[]>,
  iucnSpeciesKeyed: Record<string, IucnSpecies>,
  iucnSpeciesNarrativesKeyed: Record<string, IucnSpeciesNarrative>,
  rfcxSpeciesKeyed: Record<string, RfcxSpeciesData>,
  wikiSpeciesKeyed: Record<string, WikiSummary>
): Promise<Species[]> => {
  // Merge data
  // TODO: @nui fix this - when there is no species call data, the species call field isn't included in the object
  const species = scientificNames.map(scientificName => {
    const arbimonSpecies = arbimonSpeciesKeyed[scientificName]
    const arbimonSpeciesCall = arbimonSpeciesCallsKeyed[scientificName]
    const iucnSpecies = iucnSpeciesKeyed[scientificName]
    const iucnSpeciesNarrative = iucnSpeciesNarrativesKeyed[scientificName]
    const rfcxSpecies = rfcxSpeciesKeyed[scientificName]
    const wikiSpecies = wikiSpeciesKeyed[scientificName]

    const information = [
      ...(iucnSpeciesNarrative?.habitat ? [{ description: iucnSpeciesNarrative.habitat, sourceType: SPECIES_SOURCE_IUCN, sourceUrl: iucnSpeciesNarrative.sourceUrl, sourceCite: iucnSpeciesNarrative.sourceCitation }] : []),
      ...(wikiSpecies?.content ? [{ description: wikiSpecies.content, sourceType: SPECIES_SOURCE_WIKI, sourceUrl: wikiSpecies.contentUrls.desktop }] : [])
    ]

    return {
      ...arbimonSpecies,
      speciesCalls: arbimonSpeciesCall,
      commonName: rfcxSpecies?.commonName ?? iucnSpecies?.main_common_name ?? '',
      extinctionRisk: rfcxSpecies?.extinctionRisk?.code ?? iucnSpecies?.category ?? EXTINCTION_RISK_NOT_EVALUATED.code,
      externalLinks: information.map(({ sourceType, sourceUrl }) => ({ sourceType, sourceUrl, title: sourceType })),
      thumbnailImageUrl: wikiSpecies?.thumbnailImage ?? '',
      imageCaption: wikiSpecies?.title ?? '',
      information
    }
  })

  return species
}
