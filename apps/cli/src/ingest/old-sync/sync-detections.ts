import { Sequelize } from 'sequelize'

import { Project } from '@rfcx-bio/common/dao/types'

import { getArbimonDetectionSummaries, tranformArbimonToBioDetectionSummaries } from '@/ingest/old-inputs/arbimon-detections'
import { createDetections } from '@/ingest/old-outputs/source-detections'

export const syncDetections = async (arbimonSequelize: Sequelize, biodiversitySequelize: Sequelize, projects: Project[]): Promise<void> => {
  const arbimonDetectionSummaries = await getArbimonDetectionSummaries(arbimonSequelize, projects.map(p => p.idArbimon))
  const detectionSummaries = await tranformArbimonToBioDetectionSummaries(arbimonDetectionSummaries, biodiversitySequelize)
  await createDetections(biodiversitySequelize, detectionSummaries)
}
