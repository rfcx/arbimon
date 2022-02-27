import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { rawDetections } from '@rfcx-bio/common/mock-data'

import { writeDetectionsToPostgres } from '@/data-ingest/detections/output-postgres'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  await writeDetectionsToPostgres(sequelize, rawDetections)
}
