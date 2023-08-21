import { groupBy } from 'lodash-es'
import { type Sequelize, type Transaction, Op } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR } from '@rfcx-bio/common/dao/models/detection-by-site-species-hour-model'
import type { SyncError } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { literalIntegerArray2D, reducedAndSortedPairs } from '@/db/seeders/_helpers/sequelize-literal-integer-array-2d'
import { filterRepeatingDetectionMinutes } from '../parsers/parse-array'
import type { DetectionArbimon, DetectionBySiteSpeciesHourBio } from '../parsers/parse-detection-arbimon-to-bio'

type ItemsToInsertOrUpsert = Record<string, DetectionBySiteSpeciesHourBio>

const itemsToInsertOrUpsert: ItemsToInsertOrUpsert = {}

/**
 * Convert datetime to the local recording time
 * @param datetime string of date e.g. 2020-12-06 10:00:00
 * @returns dayjs.utc and +00
 */
const getTimePrecisionHourLocal = (datetime: string): string => {
  return dayjs.utc(datetime).format('YYYY-MM-DD HH:00:00+00')
}

function isValidated (val: DetectionArbimon): boolean {
  return (val.present !== null && val.present > 0) || val.presentReview > 0 || val.presentAed > 0
}

export const writeDetectionBySiteSpeciesHourToBio = async (detectionBySiteSpeciesHour: DetectionBySiteSpeciesHourBio[], sequelize: Sequelize, transaction: Transaction | null = null): Promise<[DetectionBySiteSpeciesHourBio[], Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>]> => {
  // loop upsert
  const successToInsertItems: DetectionBySiteSpeciesHourBio[] = []
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []

  for (const detection of detectionBySiteSpeciesHour) {
    try {
      const newDetection = { ...detection, countsByMinute: literalIntegerArray2D(reducedAndSortedPairs(detection.countsByMinute), sequelize) }
      // @ts-expect-error: countsByMinute in rows has incompatible type
      await ModelRepository.getInstance(sequelize).DetectionBySiteSpeciesHour.upsert(newDetection, {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR,
        ...transaction && { transaction }
      })
      // @ts-expect-error: countsByMinute in rows has incompatible type
      successToInsertItems.push(newDetection)
    } catch (e: any) {
      console.error('⚠️ Insert detection by site, species, hour failed...', e)
      const errorMessage = (e instanceof Error) ? e.message : ''
      // store insert errors
      failedToInsertItems.push({
        externalId: `${detection.timePrecisionHourLocal.toString()}|${detection.locationSiteId}|${detection.taxonSpeciesId}`,
        error: `InsertError: ${errorMessage}`
      })
    }
  }
  return [successToInsertItems, failedToInsertItems]
}

export const mapDetectionBySiteSpeciesHourArbimonWithPrevSync = async (detectionArbimon: DetectionArbimon[], sequelize: Sequelize): Promise<DetectionBySiteSpeciesHourBio[]> => {
  // return previosly collected itemsToInsertOrUpsert if there is not new detectionArbimon
  if (!detectionArbimon.length) return Object.values(itemsToInsertOrUpsert)

  const arbimonDetectionGroupBySites = groupBy(detectionArbimon, 'siteId')
  const arbimonDetectionGroupBySpecies = groupBy(detectionArbimon, 'speciesId')

  // group arbimon detections by date, hour,site, species
  const arbimonDetectionGroupByDateHourSiteSpecies = Object.values(groupBy(detectionArbimon, d => `${getTimePrecisionHourLocal(d.datetime)}-${d.siteId}-${d.speciesId}`))
  const biodiversitySites = await ModelRepository.getInstance(sequelize).LocationSite.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonDetectionGroupBySites).map(Number) } },
    raw: true
  })

  const biodiversitySpecies = await ModelRepository.getInstance(sequelize).TaxonSpecies.findAll({
    where: { idArbimon: { [Op.in]: Object.keys(arbimonDetectionGroupBySpecies).map(Number) } },
    raw: true
  })

  // Group new selected arbimon detections
  for (const group of arbimonDetectionGroupByDateHourSiteSpecies) {
    const timePrecisionHourLocal = getTimePrecisionHourLocal(group[0].datetime)
    const locationSite = biodiversitySites.find(site => site.idArbimon === group[0].siteId)
    const locationSiteId = locationSite?.id
    const taxonSpeciesId = biodiversitySpecies.find(species => species.idArbimon === group[0].speciesId)?.id
    if (locationSiteId === undefined || taxonSpeciesId === undefined) {
      // skip detections with haven't synced site (validation issue)
      continue
    }

    // find existing detetction in the itemsToInsertOrUpsert object
    const label = `${locationSiteId}_${taxonSpeciesId}_${timePrecisionHourLocal}`
    const isNewDetection = itemsToInsertOrUpsert[label] === undefined
    if (isNewDetection) {
      // detection to insert (only validated detections)
      const filteredArbimonDetectionsByValidation = group.filter(dt => isValidated(dt))
      if (filteredArbimonDetectionsByValidation.length) {
        const detectionData = filterRepeatingDetectionMinutes(filteredArbimonDetectionsByValidation)

        itemsToInsertOrUpsert[label] = {
          timePrecisionHourLocal: dayjs.utc(timePrecisionHourLocal).toDate(),
          locationProjectId: locationSite?.locationProjectId ?? -1,
          locationSiteId: locationSiteId ?? -1,
          taxonSpeciesId: taxonSpeciesId ?? -1,
          taxonClassId: biodiversitySpecies.find(species => species.idArbimon === group[0].speciesId)?.taxonClassId ?? -1,
          count: detectionData.countsByMinute.length, // 3 - count of detection in the group
          countsByMinute: detectionData.countsByMinute // '{{10,1},{25,1},{55,1}}' - array of recordings datetime minutes (values), related to this group by site/species/date/hour
        }
      }
    } else if (itemsToInsertOrUpsert[label]?.countsByMinute !== undefined) {
      // detection to upsert
      const countsByMinute = itemsToInsertOrUpsert[label].countsByMinute
      group.forEach(dt => {
        const dtMinutes = dayjs(dt.datetime).minute()
        const existingIndex = countsByMinute.findIndex(pair => pair[0] === dtMinutes)
        const existing = existingIndex > -1
        // If a new detection exists and validated -> add it
        if (existing && isValidated(dt)) {
          countsByMinute[existingIndex][1] = countsByMinute[existingIndex][1] + 1
        }

        // If new detection does not exist and not validated -> do nothing
        if (!existing && !isValidated(dt)) return

        // If new detection exists and not validated -> remove it
        if (existing && !isValidated(dt)) {
          countsByMinute[existingIndex][1] = countsByMinute[existingIndex][1] - 1
        }

        // If new detection do not exist and validated -> add it
        if (!existing && isValidated(dt)) {
          countsByMinute.push([dtMinutes, 1])
        }
      })
      // Keep the detections with count is not equal `0` in the countsByMinute: [[6, 0], [30, 1]] => [[30, 1]]
      const filteredDetections = countsByMinute.filter(group => group[1] !== 0)

      const upsertDetectionGroup = {
        timePrecisionHourLocal: itemsToInsertOrUpsert[label].timePrecisionHourLocal,
        locationSiteId: itemsToInsertOrUpsert[label].locationSiteId,
        taxonSpeciesId: itemsToInsertOrUpsert[label].taxonSpeciesId,
        locationProjectId: itemsToInsertOrUpsert[label].locationProjectId,
        taxonClassId: itemsToInsertOrUpsert[label].taxonClassId,
        count: filteredDetections.length,
        countsByMinute: filteredDetections
      }

      itemsToInsertOrUpsert[label] = upsertDetectionGroup
    }
  }
  return Object.values(itemsToInsertOrUpsert)
}
