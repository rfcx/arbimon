import * as fs from 'fs'
import { keyBy, mapValues } from 'lodash-es'
import { dirname, resolve } from 'path'

import { SpeciesCall } from '@rfcx-bio/common/domain'
import { dateQueryParamify } from '@rfcx-bio/utils/url-helpers'

import { mysqlSelect } from '../../../_services/mysql'
import { ARBIMON_CONFIG } from '../../_connections/arbimon'
import { fileURLToPath } from 'url'

export type ArbimonSpeciesCall = SpeciesCall

interface ArbimonSpeciesCallRow {
  'scientific_name': string
  'songtype': string
  'start': Date
  'end': Date
  'stream_id': string
  'stream_name': string
  'project_id': string
  'project_name': string
  'timezone': string
}

export const getArbimonSpeciesCalls = async (): Promise<Record<string, ArbimonSpeciesCall>> => {
  // Read SQL
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const sqlPath = resolve(currentDir, './get-example-of-species-call.sql') // TODO - Update query to support other projects
  const sql = fs.readFileSync(sqlPath, 'utf8')

  // Query Arbimon
  const results = await mysqlSelect<ArbimonSpeciesCallRow>(ARBIMON_CONFIG, sql)

  // Calculate URLs & create keyed object
  return mapValues(
    keyBy(results, 'scientific_name'),
    ({ stream_id: streamId, stream_name: siteName, project_name: projectName, songtype: songType, start: recordedAt, end, timezone }) => ({
      siteName,
      projectName,
      songType,
      recordedAt: recordedAt.toISOString(),
      timezone,
      mediaWavUrl: `https://media-api.rfcx.org/internal/assets/streams/${streamId}_t${dateQueryParamify(recordedAt.toISOString())}.${dateQueryParamify(end.toISOString())}_fwav.wav`,
      mediaSpecUrl: `https://media-api.rfcx.org/internal/assets/streams/${streamId}_t${dateQueryParamify(recordedAt.toISOString())}.${dateQueryParamify(end.toISOString())}_d512.512_mtrue_fspec.png`
  }))
}
