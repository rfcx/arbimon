import type { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR } from '@rfcx-bio/node-common/dao/models/detection-by-site-species-hour-model'
import { literalIntegerArray2D, reducedAndSortedPairs } from '@rfcx-bio/node-common/dao/query-helpers/sequelize-literal-integer-array-2d'
import type { SyncError } from '@rfcx-bio/node-common/dao/types'

import type { DetectionArbimon, DetectionBySiteSpeciesHourBio } from '../parsers/parse-detection-arbimon-to-bio'
import { transformDetectionArbimonToBio } from '../parsers/parse-detection-arbimon-to-bio'

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
  // Reset not validated items
  await deleteDetections(itemsToReset, sequelize, transaction)
  try {
    // Insert new or updated items
    if (itemsToInsertOrUpsert.length) {
      const rows = itemsToInsertOrUpsert.map(group => {
        return { ...group, countsByMinute: literalIntegerArray2D(reducedAndSortedPairs(group.countsByMinute), sequelize) }
      })
      // @ts-expect-error: countsByMinute in rows has incompatible type (but it seems to be accepted by sequelize)
      await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.bulkCreate(rows, {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR,
        ...transaction && { transaction }
      })
    }
    return [itemsToInsertOrUpsert, []]
  } catch (batchInsertError) {
    console.info('⚠️ Batch insert `detections by site species hour` failed... try loop upsert')
    const failedToInsertItems = await loopUpsert(itemsToInsertOrUpsert, detections, sequelize, transaction)
    return [[], failedToInsertItems]
  }
}

const deleteDetections = async (detections: DetectionBySiteSpeciesHourBio[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  if (!detections.length) return
  try {
    for (const d of detections) {
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
  } catch (err) {
    // TODO: Inform about the issue to the bio dev slack channel?
    console.error('> Error when deleting detections', detections, err as Error)
  }
}
