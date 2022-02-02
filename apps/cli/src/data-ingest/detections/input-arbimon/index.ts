import * as fs from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

import { mysqlSelect } from '../../../_services/mysql'
import { ARBIMON_CONFIG } from '../../_connections/arbimon'
import { ArbimonHourlyDetectionSummary } from './types'

export const getArbimonDetectionSummaries = async (): Promise<MockHourlyDetectionSummary[]> => {
  // Read SQL
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const sqlPath = resolve(currentDir, './get-detection-summaries.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  // Query Arbimon
  const results = await mysqlSelect<ArbimonHourlyDetectionSummary>(ARBIMON_CONFIG, sql)

  // Calculate detection frequency
  return results.map(summary => ({
      ...summary,
      site_id: summary.arbimon_site_id, // use Arbimon IDs in mock data (we will make our own later)
      detection_frequency: summary.num_of_recordings / 12
  }))
}
