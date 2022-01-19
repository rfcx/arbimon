import { getArbimonDetectionSummaries } from './input-arbimon'
import { writeDetectionsToPostgres } from './output-postgres'

const main = async (): Promise<void> => {
  const detections = await getArbimonDetectionSummaries()
  await writeDetectionsToPostgres(detections)
  process.exit(0)
}

await main()
