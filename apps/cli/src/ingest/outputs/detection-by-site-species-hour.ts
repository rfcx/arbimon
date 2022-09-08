import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { SyncError } from '@rfcx-bio/common/dao/types'

import { DetectionArbimon, DetectionBySiteSpeciesHourBio, transformDetectionArbimonToBio } from '../parsers/parse-detection-arbimon-to-bio'
import { literalIntegerArray2D, literalizeCountsByMinute, reducedAndSortedPairs } from '@/db/seeders/_helpers/sequelize-literal-integer-array-2d'

const loopUpsert = async (detectionsBio: DetectionBySiteSpeciesHourBio[], detectionArbimon: DetectionArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const [dtIdx, dt] of detectionsBio.entries()) {
    try {
      await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.upsert(dt)
    } catch (e: any) {
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store insert errors
      failedToInsertItems.push({
        externalId: `${detectionArbimon[dtIdx].updatedAt}|project:${dt.locationProjectId}|site:${dt.locationSiteId}|species:${dt.taxonSpeciesId}|detectionsExternalId:${detectionArbimon[dtIdx].idArbimon}`,
        error: `InsertError: ${errorMessage}`
      })
    }
  }
  return failedToInsertItems
}

export const writeDetectionsToBio = async (detections: DetectionArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[DetectionBySiteSpeciesHourBio[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const [itemsToInsertOrUpsert, itemsToReset] = await Promise.all(await transformDetectionArbimonToBio(detections, sequelize))
  try {
    // Reset not validated items
    if (itemsToReset.length) {
      for (const d of itemsToReset) {
        const numberOfDeletedRows = await ModelRepository
          .getInstance(sequelize)
          .DetectionBySiteSpeciesHour
          .destroy({
            where: {
              timePrecisionHourLocal: d.timePrecisionHourLocal,
              locationSiteId: d.locationSiteId,
              taxonSpeciesId: d.taxonSpeciesId
            },
            transaction
          })
          console.info(`> ${numberOfDeletedRows} detections reset successfully for time ${d.timePrecisionHourLocal.toISOString()}, site ${d.locationSiteId}, species ${d.taxonSpeciesId}`)
      }
    }
    // Insert new or updated items
    if (itemsToInsertOrUpsert.length) {
      const rows = itemsToInsertOrUpsert.map(group => {
        return { ...group, countsByMinute: literalIntegerArray2D(reducedAndSortedPairs(group.countsByMinute), sequelize) }
      })
      // @ts-expect-error
      await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.bulkCreate(rows, { transaction })
    }
    return [itemsToInsertOrUpsert, []]
  } catch (batchInsertError) {
    console.info('⚠️ Batch insert `detections by site species hour` failed... try loop upsert')
    const failedToInsertItems = await loopUpsert(itemsToInsertOrUpsert, detections, sequelize, transaction)
    return [[], failedToInsertItems]
  }
}
