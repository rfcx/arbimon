import { getArbimonDetectionSummaries } from './input-arbimon'
import { writeDetectionsToPostgres } from './output-postgres'

const main = async (): Promise<void> => {
  const detections = await getArbimonDetectionSummaries(1989)
  await writeDetectionsToPostgres(detections)
  process.exit(0)
}

await main()
