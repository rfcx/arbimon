import * as fs from 'fs'
import { groupBy, mapValues } from 'lodash-es'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

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

export const getArbimonSpeciesCalls = async (): Promise<Record<string, ArbimonSpeciesCall[]>> => {
  // Read SQL
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const sqlPath = resolve(currentDir, './get-example-of-species-call.sql') // TODO - Update query to support other projects
  const sql = fs.readFileSync(sqlPath, 'utf8')

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
