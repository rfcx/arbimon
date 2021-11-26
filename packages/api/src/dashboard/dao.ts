import { DashboardMetrics } from '../TEMP/api-bio-types/dashboard-generated.js'

// TODO: Update to query from DB
export async function getMetrics (): Promise<DashboardMetrics> {
  return {
    detectionCount: 50000,
    siteCount: 200,
    speciesCount: 97,
    endangeredSpecies: 10
  }
}
