import dayjs from 'dayjs'

import { type ProjectCreateRequest } from '@rfcx-bio/common/api-bio/project/project-create'
import { RANKING_PRIMARY } from '@rfcx-bio/common/roles'

import { createProject as createProjectInCore, getProject as getProjectInCore } from '~/api-core/api-core'
import { create } from './dao/get-project-members-dao'
import { createProject as createProjectLocal } from './dao/project-create-dao'
import { createProjectProfile } from './dao/project-profile-dao'
import { createProjectVersion } from './dao/project-version-dao'

export const createProject = async (request: ProjectCreateRequest, userId: number, token: string): Promise<[string, number]> => {
  // Create in Core
  // TODO: check if we want to add is_public to the request
  const idCore = await createProjectInCore({ name: request.name, is_public: false }, token)
  const { external_id: idArbimon } = await getProjectInCore(idCore, token)

  // Pre-populate insights table with the same data (will get updated from Core after sync)
  const project = { idCore, idArbimon, name: request.name }
  const { id, slug } = await createProjectLocal(project)

  // Create project profile
  const { objectives, dateStart, dateEnd } = request
  await createProjectProfile({ locationProjectId: id, objectives, dateStart: dayjs(dateStart).toDate(), dateEnd: dayjs(dateEnd).toDate() })
  await createProjectVersion(id, request.isPublic)

  // Set current user as owner
  await create({ locationProjectId: id, userId, role: 'owner', ranking: RANKING_PRIMARY })
  return [slug, id]
}
