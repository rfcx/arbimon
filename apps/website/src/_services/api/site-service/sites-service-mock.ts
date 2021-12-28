import { Project } from '@rfcx-bio/common/api-bio/common/projects'
import { Site } from '@rfcx-bio/common/api-bio/common/sites'
import { rawSites, simulateDelay } from '@rfcx-bio/common/mock-data'

export const getSites = async (project: Project): Promise<Site[]> => {
  return await simulateDelay(rawSites.sort((a, b) => a.name.localeCompare(b.name)))
}
