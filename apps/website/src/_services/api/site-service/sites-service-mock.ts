import { Project } from '@rfcx-bio/common/api-bio-types/projects'
import { Site } from '@rfcx-bio/common/api-bio-types/sites'

import { getRawSites, simulateDelay } from '~/api-helpers/mock'

export const getSites = async (project: Project): Promise<Site[]> => {
  return await simulateDelay(getRawSites())
}
