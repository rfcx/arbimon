import * as hash from 'object-hash'

import { ArbimonHourlyDetectionSummary } from '@/data-ingest/detections/arbimon'

export const getDataSourceHashId = (summaries: ArbimonHourlyDetectionSummary[]): string => {
  return hash.MD5(summaries)
}
