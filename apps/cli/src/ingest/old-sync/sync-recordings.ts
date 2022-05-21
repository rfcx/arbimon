import { Sequelize } from 'sequelize'

import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonRecordingSummaries, tranformArbimonToBioRecordingSummaries } from '@/ingest/old-inputs/arbimon-recordings'
import { createRecordings } from '@/ingest/old-outputs/source-recordings'

export const syncRecordings = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, projects: Project[]): Promise<void> => {
  const arbimonRecordingSummaries = await getArbimonRecordingSummaries(arbimonSequelize, projects.map(p => p.idArbimon))
  const recordingSummaries = await tranformArbimonToBioRecordingSummaries(arbimonRecordingSummaries, biodiversitySequelize)
  await createRecordings(biodiversitySequelize, recordingSummaries)
}
