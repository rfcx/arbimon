import { getMockSites } from './input-from-mock-detections'
import { writeSitesToPostgres } from './output-postgres'

const main = async (): Promise<void> => {
  const sites = getMockSites()
  await writeSitesToPostgres(sites)
}

await main()
