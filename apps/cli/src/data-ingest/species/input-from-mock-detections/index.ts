import { keyBy } from 'lodash-es'

import { Species } from '@rfcx-bio/common/domain'
import { rawDetections } from '@rfcx-bio/common/mock-data'
import { urlify } from '@rfcx-bio/utils/url-helpers'

export type ArbimonSpeciesData = Pick<Species, 'speciesId' | 'speciesSlug' | 'scientificName' | 'taxonId' | 'taxon'>

export const getScientificNamesFromMock = (data = rawDetections): string[] =>
  Object.keys(getArbimonSpeciesFromMock(data))
    .sort((a, b) => a.localeCompare(b))

export const getArbimonSpeciesFromMock = (data = rawDetections): Record<string, ArbimonSpeciesData> => {
  // Get unique species from detections
  const splitter = '-----'
  const rawSpeciesList: string[] = Array.from(new Set(data.map(r => `${r.species_id}${splitter}${r.scientific_name}${splitter}${r.taxon_id}${splitter}${r.taxon}`)))

  // Convert to Species type
  return keyBy(
    rawSpeciesList
      .map(s => s.split(splitter))
      .map(tuple => ({
        speciesId: Number(tuple[0]),
        speciesSlug: urlify(tuple[1]),
        scientificName: tuple[1],
        taxonId: Number(tuple[2]),
        taxon: tuple[3]
      })),
    'scientificName'
  )
}
