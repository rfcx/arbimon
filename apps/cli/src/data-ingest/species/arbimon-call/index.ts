import { groupBy, mapValues } from 'lodash-es'

import { SpeciesCall } from '@rfcx-bio/common/api-bio/species/types'
import { dateQueryParamify } from '@rfcx-bio/utils/url-helpers'

import { mysqlSelect } from '../../../_services/mysql'
import { ARBIMON_CONFIG } from '../../_connections/arbimon'

export type ArbimonSpeciesCall = SpeciesCall

interface ArbimonSpeciesCallRow {
  'scientific_name': string
  'songtype': string
  'recording_id': number
  'start': Date
  'end': Date
  'stream_id': string
  'stream_name': string
  'project_id': string
  'project_name': string
  'project_slug': string
  'timezone': string
}

export const getArbimonSpeciesCalls = async (idArbimon: number): Promise<Record<string, ArbimonSpeciesCall[]>> => {
  // Read SQL
  const sql = `
  select sp.scientific_name, st.songtype, DATE_ADD(r.datetime_utc, interval t.x1 second) start, DATE_ADD(r.datetime_utc, interval t.x2 second) "end", t.recording_id, s.external_id stream_id, s.name stream_name, s.timezone, p.external_id project_id, p.name project_name, p.url project_slug
  from templates t 
    join recordings r on t.recording_id = r.recording_id 
    join species sp on t.species_id = sp.species_id 
    join songtypes st on t.songtype_id = st.songtype_id 
    join sites s on r.site_id = s.site_id 
    join projects p on s.project_id = p.project_id 
  where t.project_id = ${idArbimon} and t.deleted != 1 and r.datetime_utc is not null;
  `

  // Query Arbimon
  const results = await mysqlSelect<ArbimonSpeciesCallRow>(ARBIMON_CONFIG, sql)

  // Calculate URLs & create keyed object
  return mapValues(
    groupBy(results, 'scientific_name'),
    list => list.map(row => ({
      siteName: row.stream_name,
      projectName: row.project_name,
      songType: row.songtype,
      recordedAt: row.start.toISOString(),
      timezone: row.timezone,
      redirectUrl: `https://arbimon.rfcx.org/project/${row.project_slug}/visualizer/rec/${row.recording_id}`,
      mediaWavUrl: `https://media-api.rfcx.org/internal/assets/streams/${row.stream_id}_t${dateQueryParamify(row.start.toISOString())}.${dateQueryParamify(row.end.toISOString())}_fwav.wav`,
      mediaSpecUrl: `https://media-api.rfcx.org/internal/assets/streams/${row.stream_id}_t${dateQueryParamify(row.start.toISOString())}.${dateQueryParamify(row.end.toISOString())}_d512.512_mtrue_fspec.png`
    }))
  )
}
