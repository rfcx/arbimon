import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR } from '@rfcx-bio/common/dao/models/detection-by-site-species-hour-model'
import { DetectionBySiteSpeciesHour, SyncError } from '@rfcx-bio/common/dao/types'

import { DetectionArbimon, transformDetectionArbimonToBio } from '../parsers/parse-detection-arbimon-to-bio'

const loopUpsert = async (detectionsBio: DetectionBySiteSpeciesHour[], detectionArbimon: DetectionArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
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

export const writeDetectionsToBio = async (detections: DetectionArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[DetectionBySiteSpeciesHour[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  const detectionsBio = await Promise.all(await transformDetectionArbimonToBio(detections, sequelize))
  try {
    await ModelRepository.getInstance(sequelize)
      .DetectionBySiteSpeciesHour
      .bulkCreate(detectionsBio, {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR,
        ...transaction && { transaction }
      })
    return [detectionsBio, []]
  } catch (batchInsertError) {
    console.info('⚠️ Batch insert `detections by site species hour` failed... try loop upsert')
    const failedToInsertItems = await loopUpsert(detectionsBio, detections, sequelize, transaction)
    return [[], failedToInsertItems]
  }
}
