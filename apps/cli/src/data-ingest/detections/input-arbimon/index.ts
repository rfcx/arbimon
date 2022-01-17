import * as fs from 'fs'
import { dirname, resolve } from 'path'

import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

import { queryArbimon } from '../../../_services/arbimon-helpers'
import { ArbimonHourlyDetectionSummary } from './types'

export const getArbimonDetectionSummaries = async (): Promise<MockHourlyDetectionSummary[]> => {
  // Read SQL
  const currentDir = dirname(new URL(import.meta.url).pathname)
  const sqlPath = resolve(currentDir, './get-detection-summaries.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  // Query Arbimon
  const results = await queryArbimon<ArbimonHourlyDetectionSummary>(sql)

  // Calculate detection frequency
  return results.map(summary => ({
      ...summary,
      detection_frequency: summary.num_of_recordings / 12
  }))
}
