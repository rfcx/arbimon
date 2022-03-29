import { dateQueryParamify } from '@rfcx-bio/utils/url-helpers'

import { mysqlSelect } from '../../../_services/mysql'
import { ARBIMON_CONFIG } from '../../_connections/arbimon'

export interface ArbimonSpeciesCall {
  'species_id': number
  'project_idArbimon': number
  'project_slugArbimon': string
  'site_idArbimon': number
  'site_idCore': string
  'songtype': string
  'start': Date
  'end': Date
  'recording_id': number
  'timezone': string
  'redirect_url': string
  'media_wav_url': string
  'media_spec_url': string
}

type ArbimonSpeciesCallRow = Omit<ArbimonSpeciesCall, 'redirect_url' | 'media_wav_url' | 'media_spec_url'>

// interface ArbimonSpeciesCallRow {
//   'scientific_name': string
//   'songtype': string
//   'recording_id': number
//   'start': Date
//   'end': Date
//   'stream_id': string
//   'stream_name': string
//   'project_id': string
//   'project_name': string
//   'project_slug': string
//   'timezone': string
// }

export const getArbimonSpeciesCallsForProjectSpecies = async (projectIdArbimon: number, speciesIdsArbimon: number[] = []): Promise<ArbimonSpeciesCall[]> => {
  const sql = `
  SELECT t.species_id, t.project_id project_idArbimon, p.url project_slugArbimon, r.site_id site_idArbimon, s.external_id site_idCore, st.songtype, DATE_ADD(r.datetime_utc, interval t.x1 second) start, DATE_ADD(r.datetime_utc, interval t.x2 second) "end", t.recording_id, s.timezone 
  FROM templates t  
    JOIN recordings r on t.recording_id = r.recording_id
    JOIN songtypes st ON t.songtype_id = st.songtype_id 
    JOIN sites s ON r.site_id = s.site_id
    JOIN projects p ON s.project_id = p.project_id 
  WHERE t.project_id = ${projectIdArbimon} AND t.deleted != 1 AND r.datetime_utc is not null
  ${speciesIdsArbimon.length > 0 ? ` AND t.species_id IN (${speciesIdsArbimon.join(',')})` : ''}
  ;`
  const results = await mysqlSelect<ArbimonSpeciesCallRow>(ARBIMON_CONFIG, sql)
  return results.map(row => ({
    ...row,
    // TODO: respect the environment for generating redirect_url
    redirect_url: `https://arbimon.rfcx.org/project/${row.project_slugArbimon}/visualizer/rec/${row.recording_id}`,
    media_wav_url: `https://media-api.rfcx.org/internal/assets/streams/${row.site_idCore}_t${dateQueryParamify(row.start.toISOString())}.${dateQueryParamify(row.end.toISOString())}_fwav.wav`,
    media_spec_url: `https://media-api.rfcx.org/internal/assets/streams/${row.site_idCore}_t${dateQueryParamify(row.start.toISOString())}.${dateQueryParamify(row.end.toISOString())}_d512.512_mtrue_fspec.png`
  }))
}
