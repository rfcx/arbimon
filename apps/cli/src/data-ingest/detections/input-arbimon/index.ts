import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

import { mysqlSelect } from '../../../_services/mysql'
import { ARBIMON_CONFIG } from '../../_connections/arbimon'
import { ArbimonHourlyDetectionSummary } from './types'

export const getArbimonDetectionSummaries = async (idArbimon: number): Promise<MockHourlyDetectionSummary[]> => {
  const sql =
  `
  select a.site_id arbimon_site_id, s.external_id stream_id, s.name, s.lat, s.lon, s.alt, a.date, a.hour, a.species_id, sp.scientific_name, sp.taxon_id, st.taxon, num_of_recordings from
  (select r.site_id, date(r.datetime) date, hour(r.datetime) hour, rv.species_id, count(1) num_of_recordings
  from recordings r
      left join recording_validations rv on r.recording_id = rv.recording_id and (rv.present = 1 or rv.present_review > 0)
  where r.site_id in (select site_id from sites where project_id = ${idArbimon})
  group by r.site_id, date(r.datetime), hour(r.datetime), rv.species_id) a
  join sites s on a.site_id = s.site_id
  join species sp on a.species_id = sp.species_id
  join species_taxons st on sp.taxon_id = st.taxon_id;
  `

  // Query Arbimon
  const results = await mysqlSelect<ArbimonHourlyDetectionSummary>(ARBIMON_CONFIG, sql)

  // Calculate detection frequency
  return results.map(({ site_id: _, ...summary }) => ({
    site_id: summary.arbimon_site_id, // use Arbimon IDs in mock data (we will make our own later)
    ...summary,
    detection_frequency: summary.num_of_recordings / 12
  }))
}
