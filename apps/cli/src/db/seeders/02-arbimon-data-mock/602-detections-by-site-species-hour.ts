import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { rawDetections } from '@rfcx-bio/common/mock-data'
import { DetectionBySiteSpeciesHourModel, UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR } from '@rfcx-bio/node-common/dao/models/detection-by-site-species-hour-model'
import { LocationSiteModel } from '@rfcx-bio/node-common/dao/models/location-site-model'
import { TaxonClassModel } from '@rfcx-bio/node-common/dao/models/taxon-class-model'
import { TaxonSpeciesModel } from '@rfcx-bio/node-common/dao/models/taxon-species-model'
import { type DetectionBySiteSpeciesHour } from '@rfcx-bio/node-common/dao/types'

import { getPuertoRicoProjectId } from '@/db/_helpers/get-puerto-rico-id'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const [puertoRicoProjectId, classes, species, sites] = await Promise.all([
    getPuertoRicoProjectId(sequelize),
    TaxonClassModel(sequelize).findAll(),
    TaxonSpeciesModel(sequelize).findAll(),
    LocationSiteModel(sequelize).findAll()
  ])
  if (Number.isNaN(puertoRicoProjectId)) return

  const classArbimonToBio: Record<number, number> = Object.fromEntries(classes.map(c => [c.idArbimon, c.id]))
  const speciesArbimonToBio: Record<number, number> = Object.fromEntries(species.map(s => [s.idArbimon, s.id]))
  const siteArbimonToBio: Record<number, number> = Object.fromEntries(sites.map(s => [s.idArbimon, s.id]))

  // Save data
  const detectionSummaries: DetectionBySiteSpeciesHour[] = rawDetections
    .map(d => ({
      timePrecisionHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
      taxonClassId: classArbimonToBio[d.taxon_id] ?? -1, // TODO: Throw error
      taxonSpeciesId: speciesArbimonToBio[d.species_id] ?? -1, // TODO: Throw error
      locationProjectId: puertoRicoProjectId,
      locationSiteId: siteArbimonToBio[d.arbimon_site_id] ?? -1, // TODO: Throw error
      count: d.num_of_recordings,
      countsByMinute: [] // TODO: build array from `d`
    }))

  await DetectionBySiteSpeciesHourModel(sequelize)
    .bulkCreate(detectionSummaries, {
      updateOnDuplicate: UPDATE_ON_DUPLICATE_DETECTION_BY_SITE_SPECIES_HOUR
    })
}
