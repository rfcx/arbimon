import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncError, TaxonSpeciesCall } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { mapSpeciesCallArbimonWithBioFk, SpeciesCallArbimon, transformTemplateArbimonToSpeciesCallBio } from '../parsers/parse-species-call-arbimon-to-bio'

const loopUpsert = async (speciesCalls: Array<Omit<TaxonSpeciesCall, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const sp of speciesCalls) {
    try {
      await ModelRepository.getInstance(sequelize).TaxonSpeciesCall.upsert(transformTemplateArbimonToSpeciesCallBio(sp))
    } catch (e: any) {
      // store insert errors
      failedToInsertItems.push({
        externalId: `${sp.idArbimon}`,
        error: e.message
      })
    }
  }
  return failedToInsertItems
}

export const writeSpeciesCallsToBio = async (speciesCalls: SpeciesCallArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[Array<Omit<TaxonSpeciesCall, 'id'>>, Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const calls = await Promise.all(await mapSpeciesCallArbimonWithBioFk(speciesCalls, sequelize))
  const filteredCalls = calls.filter(isDefined)
  try {
    await ModelRepository.getInstance(sequelize)
      .TaxonSpeciesCall
      .bulkCreate(filteredCalls.map(transformTemplateArbimonToSpeciesCallBio), {
        ...transaction && { transaction }
      })
    return [filteredCalls, []]
  } catch (batchInsertError) {
    console.info('⚠️ Batch insert of species calls failed... try loop insert', (batchInsertError as any).errors)
    const failedToInsertItems = await loopUpsert(filteredCalls, sequelize)
    return [
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      filteredCalls.filter(call => !failedToInsertItems.find(error => error.externalId === `${call.idArbimon}`)),
      failedToInsertItems
    ]
  }
}
