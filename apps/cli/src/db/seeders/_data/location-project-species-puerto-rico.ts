import { ProjectProfileHighlightedSpecies } from '@rfcx-bio/common/dao/types'

export const projectSpeciesPuertoRico: Array<Partial<ProjectProfileHighlightedSpecies> & { slug: string }> = [
  { slug: 'amazona-vittata', highlightedOrder: 0 },
  { slug: 'accipiter-striatus-venator', highlightedOrder: 1, riskRatingLocalCode: 'CR', riskRatingLocalLevel: 600, riskRatingLocalSource: 'PRDNER 2016' },
  { slug: 'agelaius-xanthomus', highlightedOrder: 2 },
  { slug: 'setophaga-angelae', highlightedOrder: 3 },
  { slug: 'antrostomus-noctitherus', highlightedOrder: 4 }
]
