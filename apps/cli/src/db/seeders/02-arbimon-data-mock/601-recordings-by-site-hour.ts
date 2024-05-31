import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { rawRecordings } from '@rfcx-bio/common/mock-data/raw-recordings'
import { LocationSiteModel } from '@rfcx-bio/node-common/dao/models/location-site-model'
import { RecordingBySiteHourModel } from '@rfcx-bio/node-common/dao/models/recording-by-site-hour-model'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { getPuertoRicoProjectId } from '@/db/_helpers/get-puerto-rico-id'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const [puertoRicoProjectId, sites] = await Promise.all([
    getPuertoRicoProjectId(sequelize),
    LocationSiteModel(sequelize).findAll()
  ])

  if (Number.isNaN(puertoRicoProjectId)) return

  const siteArbimonToBio: Record<number, number> = Object.fromEntries(sites.map(s => [s.idArbimon, s.id]))

  const recordingValues: string[] = rawRecordings
    .map(d => {
      const siteId = siteArbimonToBio[d.location_site_id] ?? -1
      if (siteId === -1) return undefined

      return `('${d.time_precision_hour_local}', ${puertoRicoProjectId}, ${siteId}, '${d.created_at}', '${d.updated_at}', ${d.count}, '${d.counts_by_minute}', ${d.total_duration_in_minutes})`
    }).filter(isDefined)

  await sequelize.query(`INSERT INTO recording_by_site_hour (time_precision_hour_local, location_project_id, location_site_id, created_at, updated_at, count, counts_by_minute, total_duration_in_minutes) VALUES ${recordingValues.join(',')}`)
}

export const down: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await RecordingBySiteHourModel(params.context.sequelize).sync({ force: true })
}
