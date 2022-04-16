import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { ArbimonSpecies } from '../inputs/arbimon-species'

export const speciesArbimonToBio = ({ taxonSlug, ...rest }: ArbimonSpecies, taxonClassSlugToId: Record<string, number>): Omit<TaxonSpecies, 'id'> | undefined => {
  const taxonClassId = taxonClassSlugToId[taxonSlug]
  if (!taxonClassId) return undefined

  return { ...rest, taxonClassId }
}
