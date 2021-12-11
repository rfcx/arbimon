import { Project } from '@rfcx-bio/common/api-bio-types/projects'
import { Site } from '@rfcx-bio/common/api-bio-types/sites'
import { rawSites, simulateDelay } from '@rfcx-bio/common/mock-data'

export const getSites = async (project: Project): Promise<Site[]> => {
  return await simulateDelay(rawSites)
}
