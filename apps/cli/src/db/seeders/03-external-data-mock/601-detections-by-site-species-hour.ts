import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { DetectionBySiteSpeciesHourModel } from '@rfcx-bio/common/dao/models/detection-by-site-species-hour-model'
import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { TaxonClassModel } from '@rfcx-bio/common/dao/models/taxon-class-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR, DetectionBySiteSpeciesHour } from '@rfcx-bio/common/dao/types'
import { rawDetections } from '@rfcx-bio/common/mock-data'

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

  // Data
  const data: DetectionBySiteSpeciesHour[] =
    rawDetections.map(d => ({
      timePrecisionHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
      taxonClassId: classArbimonToBio[d.taxon_id] ?? -1, // TODO: Throw error
      taxonSpeciesId: speciesArbimonToBio[d.species_id] ?? -1, // TODO: Throw error
      locationProjectId: puertoRicoProjectId,
      locationSiteId: siteArbimonToBio[d.arbimon_site_id] ?? -1, // TODO: Throw error
      count: d.num_of_recordings,
      durationMinutes: 12
    }))

  await DetectionBySiteSpeciesHourModel(sequelize).bulkCreate(data, {
    updateOnDuplicate: ATTRIBUTES_DETECTION_BY_SITE_SPECIES_HOUR.updateOnDuplicate
  })
}
