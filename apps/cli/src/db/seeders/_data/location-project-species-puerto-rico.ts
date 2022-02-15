import { LocationProjectSpecies } from '@rfcx-bio/common/dao/types/location-project-species'

export const projectSpeciesPuertoRico: Array<Partial<LocationProjectSpecies> & { slug: string }> = [
  { slug: 'amazona-vittata', highlightedOrder: 0 },
  { slug: 'accipiter-striatus-venator', highlightedOrder: 1, riskRatingLocalCode: 'CR', riskRatingLocalLevel: 600, riskRatingLocalSource: 'PRDNER 2016' },
  { slug: 'agelaius-xanthomus', highlightedOrder: 2 },
  { slug: 'setophaga-angelae', highlightedOrder: 3 },
  { slug: 'antrostomus-noctitherus', highlightedOrder: 4 }
]
