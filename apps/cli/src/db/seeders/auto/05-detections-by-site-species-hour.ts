import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { DetectionsBySiteSpeciesHourModel } from '@rfcx-bio/common/dao/models/detections-by-site-species-hour-model'
import { SiteModel } from '@rfcx-bio/common/dao/models/location-site-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { DetectionsBySiteSpeciesHour } from '@rfcx-bio/common/domain'
import { rawDetections } from '@rfcx-bio/common/mock-data'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const model = DetectionsBySiteSpeciesHourModel(params.context.sequelize)

  const [species, sites] = await Promise.all([
    TaxonSpeciesModel(params.context.sequelize).findAll(),
    SiteModel(params.context.sequelize).findAll()
  ])

  const speciesArbimonToBio: Record<number, number> = Object.fromEntries(species.map(s => [s.idArbimon, s.id]))
  const siteArbimonToBio: Record<number, number> = Object.fromEntries(sites.map(s => [s.idArbimon, s.id]))

  const data: DetectionsBySiteSpeciesHour[] =
    rawDetections.map(d => ({
      timeHourLocal: new Date(new Date(d.date).getTime() + d.hour * 60 * 60 * 1000),
      taxonSpeciesId: speciesArbimonToBio[d.species_id] ?? -1,
      locationSiteId: siteArbimonToBio[d.arbimon_site_id] ?? -1,
      count: d.num_of_recordings,
      durationMinutes: 12
    }))

  await model.bulkCreate(data)
}
