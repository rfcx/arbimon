import { type Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type TaxonSpeciesCall } from '@rfcx-bio/node-common/dao/types'

export const getSpeciesCalls = async (sequelize: Sequelize, locationProjectId: number): Promise<TaxonSpeciesCall[]> => {
  const { TaxonSpeciesCall } = ModelRepository.getInstance(sequelize)
  const result = await TaxonSpeciesCall.findAll({ where: { callProjectId: locationProjectId }, order: [['id_arbimon', 'ASC']] })
  return result.map(s => s.toJSON())
}
