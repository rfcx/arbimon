import { Species, SPECIES_SOURCE_IUCN, SPECIES_SOURCE_WIKI } from '@rfcx-bio/common/domain'
import { EXTINCTION_RISK_NOT_EVALUATED } from '@rfcx-bio/common/iucn'
import { getSequentially } from '@rfcx-bio/utils/async'

import { getArbimonSpeciesCalls } from '../input-arbimon-species-call'
import { getArbimonSpeciesFromMock } from '../input-from-mock-detections'
import { getIucnSpecies, getIucnSpeciesNarrative } from '../input-iucn'
import { getRfcxSpecies } from '../input-rfcx'
import { getWikiSpecies } from '../input-wiki'

export const getMergedSpecies = async (scientificNames: string[]): Promise<Species[]> => {
  // Get data from other sources
  const [arbimonSpeciesKeyed, arbimonSpeciesCallsKeyed, iucnSpeciesKeyed, iucnSpeciesNarrativesKeyed, rfcxSpeciesKeyed, wikiSpeciesKeyed] = await Promise.all([
    getArbimonSpeciesFromMock(),
    getArbimonSpeciesCalls(),
    getSequentially(scientificNames, getIucnSpecies),
    getSequentially(scientificNames, getIucnSpeciesNarrative),
    getRfcxSpecies(),
    getSequentially(scientificNames, getWikiSpecies)
  ])

  // Merge data
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
      speciesCall: arbimonSpeciesCall,
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
