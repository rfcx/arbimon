import { Sequelize } from 'sequelize'

import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getArbimonSpeciesIncremental } from '@/ingest/inputs/arbimon-species'
import { ArbimonSpecies } from '../../inputs/arbimon-species'

export const syncArbimonSpecies = async (sequelizeArbimon: Sequelize, models: AllModels): Promise<void> => {
  // Lookups
  const taxonClassSlugToId = await models.TaxonClass.findAll({ attributes: ['id', 'slug'], raw: true })
    .then(res => Object.fromEntries(res.map(t => [t.slug, t.id])))

  // Data
  const species = await getArbimonSpeciesIncremental(sequelizeArbimon)
    .then(res => res.map(speciesArbimonToBio(taxonClassSlugToId)).filter(isDefined))

  // Save
  await models.TaxonSpecies.bulkCreate(species)
}

export const speciesArbimonToBio = (taxonClassSlugToId: Record<string, number>) => ({ taxonSlug, ...rest }: ArbimonSpecies): Omit<TaxonSpecies, 'id'> | undefined => {
  const taxonClassId = taxonClassSlugToId[taxonSlug]
  if (!taxonClassId) return undefined

  return { ...rest, taxonClassId }
}
