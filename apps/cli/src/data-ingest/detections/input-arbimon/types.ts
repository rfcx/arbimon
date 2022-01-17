import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

export type ArbimonHourlyDetectionSummary = Omit<MockHourlyDetectionSummary, 'detection_frequency'>
